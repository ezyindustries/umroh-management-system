const express = require('express');
const router = express.Router();
const axios = require('axios');

// WAHA Configuration
const WAHA_API_URL = process.env.WAHA_API_URL || 'http://localhost:3000';
const WAHA_API_KEY = process.env.WAHA_API_KEY || '';
const SESSION_NAME = 'default'; // WAHA Core only supports 'default' session

// Helper function to make WAHA API calls
async function wahaAPI(endpoint, method = 'GET', data = null) {
    try {
        const config = {
            method,
            url: `${WAHA_API_URL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': WAHA_API_KEY
            }
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error('WAHA API Error:', error.response?.data || error.message);
        throw error;
    }
}

// GET /api/whatsapp/status - Check WhatsApp connection status
router.get('/status', async (req, res) => {
    try {
        // Check if WAHA is available
        try {
            const sessions = await wahaAPI('/api/sessions');
            const session = sessions.find(s => s.name === SESSION_NAME);
            
            if (!session) {
                return res.json({ connected: false });
            }
            
            const sessionInfo = await wahaAPI(`/api/sessions/${SESSION_NAME}`);
            
            res.json({
                connected: sessionInfo.status === 'WORKING',
                phoneNumber: sessionInfo.me?.id || '',
                name: sessionInfo.me?.pushName || '',
                status: sessionInfo.status
            });
        } catch (wahaError) {
            // If WAHA is not running, return disconnected status
            if (wahaError.code === 'ECONNREFUSED') {
                return res.json({ 
                    connected: false,
                    error: 'WAHA not running. Please install and run WAHA first.'
                });
            }
            throw wahaError;
        }
    } catch (error) {
        console.error('Error checking WhatsApp status:', error);
        res.json({ 
            connected: false,
            error: 'Failed to check WhatsApp status' 
        });
    }
});

// POST /api/whatsapp/start - Start WhatsApp session and get QR code
router.post('/start', async (req, res) => {
    try {
        // Check if WAHA is available
        try {
            // First, check if session already exists
            const sessions = await wahaAPI('/api/sessions');
            const existingSession = sessions.find(s => s.name === SESSION_NAME);
            
            if (existingSession && existingSession.status === 'WORKING') {
                return res.json({ 
                    success: true, 
                    message: 'Already connected',
                    connected: true 
                });
            }
            
            // Start new session
            await wahaAPI('/api/sessions/start', 'POST', {
                name: SESSION_NAME,
                config: {
                    webhooks: [
                        {
                            url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/whatsapp/webhook`,
                            events: ['message', 'session.status']
                        }
                    ]
                }
            });
            
            // Wait a bit for session to initialize
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            res.json({ 
                success: true, 
                message: 'Session started, waiting for QR code' 
            });
        } catch (wahaError) {
            // If WAHA is not running, return error message
            if (wahaError.code === 'ECONNREFUSED') {
                return res.status(503).json({ 
                    error: 'WAHA tidak berjalan. Silakan install dan jalankan WAHA terlebih dahulu.',
                    instructions: 'Jalankan: docker run -it --rm -p 3000:3000/tcp --name waha devlikeapro/waha'
                });
            }
            throw wahaError;
        }
    } catch (error) {
        console.error('Error starting WhatsApp session:', error);
        res.status(500).json({ error: 'Failed to start WhatsApp session' });
    }
});

// GET /api/whatsapp/qr - Get QR code for authentication
router.get('/qr', async (req, res) => {
    try {
        // WAHA returns QR as PNG image directly
        const response = await axios.get(`${WAHA_API_URL}/api/${SESSION_NAME}/auth/qr`, {
            headers: {
                'X-Api-Key': WAHA_API_KEY
            },
            responseType: 'arraybuffer'
        });
        
        // Convert to base64 for easy display in frontend
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        const dataUri = `data:image/png;base64,${base64}`;
        
        res.json({ 
            qr: dataUri,
            timeout: 60000 // QR expires in 60 seconds
        });
    } catch (error) {
        console.error('Error getting QR code:', error.message);
        
        // Check if session exists but QR not available
        try {
            const sessions = await wahaAPI('/api/sessions');
            const session = sessions.find(s => s.name === SESSION_NAME);
            
            if (session) {
                if (session.status === 'WORKING') {
                    return res.json({ 
                        connected: true,
                        message: 'Already connected'
                    });
                } else if (session.status === 'SCAN_QR_CODE') {
                    return res.status(404).json({ 
                        error: 'QR code is being generated. Please try again.' 
                    });
                }
            }
        } catch (checkError) {
            console.error('Error checking session:', checkError);
        }
        
        res.status(500).json({ error: 'Failed to get QR code' });
    }
});

// POST /api/whatsapp/stop - Disconnect WhatsApp
router.post('/stop', async (req, res) => {
    try {
        await wahaAPI(`/api/sessions/${SESSION_NAME}/stop`, 'POST');
        
        res.json({ 
            success: true, 
            message: 'WhatsApp disconnected' 
        });
    } catch (error) {
        console.error('Error stopping WhatsApp session:', error);
        res.status(500).json({ error: 'Failed to disconnect WhatsApp' });
    }
});

// POST /api/whatsapp/send - Send message
router.post('/send', async (req, res) => {
    try {
        const { to, message, mediaUrl } = req.body;
        
        if (!to || !message) {
            return res.status(400).json({ error: 'Missing required fields: to, message' });
        }
        
        // Format phone number (remove non-digits and add country code if needed)
        let phoneNumber = to.replace(/\D/g, '');
        if (!phoneNumber.startsWith('62')) {
            phoneNumber = '62' + phoneNumber.replace(/^0/, '');
        }
        
        const payload = {
            chatId: `${phoneNumber}@c.us`,
            text: message
        };
        
        // Send media if provided
        if (mediaUrl) {
            payload.media = {
                url: mediaUrl
            };
        }
        
        const result = await wahaAPI(`/api/sendText`, 'POST', payload);
        
        res.json({ 
            success: true, 
            messageId: result.id,
            to: phoneNumber 
        });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// POST /api/whatsapp/webhook - Webhook for WAHA events
router.post('/webhook', async (req, res) => {
    try {
        const { event, session, payload } = req.body;
        
        console.log(`WhatsApp webhook: ${event} for session ${session}`);
        
        // Handle different events
        switch (event) {
            case 'session.status':
                console.log(`Session status: ${payload.status}`);
                // Could emit socket event here to update UI in real-time
                break;
                
            case 'message':
                console.log(`New message from ${payload.from}: ${payload.body}`);
                // Handle incoming messages (auto-reply, save to database, etc.)
                handleIncomingMessage(payload);
                break;
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Handle incoming messages
async function handleIncomingMessage(message) {
    try {
        // Extract phone number
        const phoneNumber = message.from.replace('@c.us', '');
        
        // Save message to database as lead
        // TODO: Save to database
        
        // Auto-reply if enabled
        if (process.env.WA_AUTO_REPLY === 'true') {
            const autoReplyMessage = `Assalamualaikum, terima kasih telah menghubungi kami.

Tim kami akan segera merespon pesan Anda.

Untuk informasi paket umroh, silakan kunjungi website kami atau hubungi CS kami di jam kerja.

Jazakallah khair 🙏`;
            
            await wahaAPI('/api/sendText', 'POST', {
                chatId: message.from,
                text: autoReplyMessage
            });
        }
    } catch (error) {
        console.error('Error handling incoming message:', error);
    }
}

module.exports = router;