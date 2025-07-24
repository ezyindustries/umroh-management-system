const {
  MarketingCustomer,
  MarketingConversation,
  MarketingConversationSummary,
  MarketingPackageTemplate,
  MarketingAutoReplyRule
} = require('../models/Marketing');
const ApiError = require('../utils/ApiError');

// Get marketing dashboard statistics
exports.getStatistics = async (req, res, next) => {
  try {
    const stats = await MarketingCustomer.getStatistics();
    
    // Calculate conversion rates
    const conversionRate = stats.total_leads > 0 
      ? ((stats.total_booked / stats.total_leads) * 100).toFixed(2)
      : 0;
    
    const monthlyConversionRate = stats.monthly_leads > 0
      ? ((stats.monthly_closings / stats.monthly_leads) * 100).toFixed(2)
      : 0;

    res.json({
      yearly: {
        leads: parseInt(stats.yearly_leads) || 0,
        closings: parseInt(stats.yearly_closings) || 0
      },
      monthly: {
        leads: parseInt(stats.monthly_leads) || 0,
        closings: parseInt(stats.monthly_closings) || 0,
        conversionRate: parseFloat(monthlyConversionRate)
      },
      daily: {
        today: {
          leads: parseInt(stats.today_leads) || 0,
          closings: parseInt(stats.today_closings) || 0
        },
        yesterday: {
          leads: parseInt(stats.yesterday_leads) || 0
        }
      },
      pipeline: {
        leads: parseInt(stats.total_leads) || 0,
        interest: parseInt(stats.total_interest) || 0,
        booked: parseInt(stats.total_booked) || 0
      },
      conversionRate: parseFloat(conversionRate)
    });
  } catch (error) {
    next(error);
  }
};

// Get all customers with filters
exports.getCustomers = async (req, res, next) => {
  try {
    const { 
      pipeline_stage, 
      search, 
      limit = 50, 
      offset = 0 
    } = req.query;

    const customers = await MarketingCustomer.getAll({
      pipeline_stage,
      search,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json(customers);
  } catch (error) {
    next(error);
  }
};

// Get single customer with conversation
exports.getCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const customer = await MarketingCustomer.findById(id);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    const conversations = await MarketingConversation.getByCustomerId(id);
    
    // Mark messages as read
    await MarketingConversation.markAsRead(id);

    res.json({
      customer,
      conversations
    });
  } catch (error) {
    next(error);
  }
};

// Update customer stage
exports.updateCustomerStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage, agreed_price, payment_status } = req.body;

    if (!['leads', 'interest', 'booked'].includes(stage)) {
      throw new ApiError(400, 'Invalid pipeline stage');
    }

    const customer = await MarketingCustomer.updateStage(id, stage, {
      agreed_price,
      payment_status
    });

    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    // Log stage change as system message
    await MarketingConversation.create({
      customer_id: id,
      sender_type: 'system',
      message_content: `Status diubah ke ${stage}`,
      message_type: 'text'
    });

    res.json(customer);
  } catch (error) {
    next(error);
  }
};

// WAHA webhook handler
exports.handleWAHAWebhook = async (req, res, next) => {
  try {
    const { 
      event,
      session,
      payload 
    } = req.body;

    // Handle incoming message
    if (event === 'message' && payload.from !== 'status@broadcast') {
      const phoneNumber = payload.from.replace('@c.us', '');
      const messageContent = payload.body || '';
      const messageId = payload.id;

      // Find or create customer
      let customer = await MarketingCustomer.findByPhone(phoneNumber);
      if (!customer) {
        customer = await MarketingCustomer.create({
          phone_number: phoneNumber,
          name: payload.notifyName || null
        });

        // Create initial summary
        await MarketingConversationSummary.upsert(
          customer.id,
          'Pelanggan baru',
          'customer'
        );
      }

      // Save message to conversation
      await MarketingConversation.create({
        customer_id: customer.id,
        message_id: messageId,
        sender_type: 'customer',
        message_type: payload.type || 'text',
        message_content: messageContent,
        media_url: payload.mediaUrl || null
      });

      // Check for package code or auto-reply triggers
      const autoReply = await processAutoReply(customer, messageContent);
      
      if (autoReply) {
        // Send auto-reply via WAHA API
        // This will be implemented when WAHA integration is ready
        
        // Save auto-reply to conversation
        await MarketingConversation.create({
          customer_id: customer.id,
          sender_type: 'system',
          message_type: 'text',
          message_content: autoReply
        });
      }

      // Update conversation summary
      await updateConversationSummary(customer.id);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('WAHA webhook error:', error);
    res.status(200).json({ status: 'error', message: error.message });
  }
};

// Send message to customer
exports.sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const customer = await MarketingCustomer.findById(id);
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    // Save message to conversation
    await MarketingConversation.create({
      customer_id: id,
      sender_type: 'agent',
      message_type: 'text',
      message_content: message
    });

    // Send via WAHA API (to be implemented)
    // await sendWhatsAppMessage(customer.phone_number, message);

    res.json({ 
      success: true, 
      message: 'Message sent successfully' 
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to process auto-reply
async function processAutoReply(customer, message) {
  // Check if message contains package code
  const packageCodeMatch = message.match(/\b[A-Z]{2,3}\d{2,4}\b/);
  if (packageCodeMatch) {
    const packageTemplate = await MarketingPackageTemplate.findByCode(packageCodeMatch[0]);
    if (packageTemplate) {
      // Update customer with package info
      await MarketingCustomer.updateStage(customer.id, 'interest', {
        package_code: packageTemplate.package_code,
        package_name: packageTemplate.package_name
      });
      return packageTemplate.template_message;
    }
  }

  // Find matching auto-reply rule
  const rule = await MarketingAutoReplyRule.findMatchingRule(message);
  if (rule) {
    return rule.reply_template;
  }

  return null;
}

// Update conversation summary using simple summarization
async function updateConversationSummary(customerId) {
  const conversations = await MarketingConversation.getByCustomerId(customerId, 10);
  
  if (conversations.length > 0) {
    // Simple summary: take key points from last few messages
    const lastMessages = conversations.slice(-3).map(c => c.message_content).join('. ');
    const summary = lastMessages.length > 100 
      ? lastMessages.substring(0, 100) + '...' 
      : lastMessages;
    
    const lastMessage = conversations[conversations.length - 1];
    
    await MarketingConversationSummary.upsert(
      customerId,
      summary,
      lastMessage.sender_type
    );
  }
}

// Get package templates
exports.getPackageTemplates = async (req, res, next) => {
  try {
    const templates = await MarketingPackageTemplate.getAll();
    res.json(templates);
  } catch (error) {
    next(error);
  }
};

// Create package template
exports.createPackageTemplate = async (req, res, next) => {
  try {
    const template = await MarketingPackageTemplate.create(req.body);
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
};