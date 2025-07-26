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
            
            if (existingSession) {
                if (existingSession.status === 'WORKING') {
                    return res.json({ 
                        success: true, 
                        message: 'Already connected',
                        connected: true 
                    });
                } else if (existingSession.status === 'SCAN_QR_CODE') {
                    // Session exists but needs QR scan
                    return res.json({ 
                        success: true, 
                        message: 'Session ready, please scan QR code',
                        needsQR: true 
                    });
                }
                // For other statuses, we'll try to restart the session
            } else {
                // Start new session if it doesn't exist
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
            }
            
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

// POST /api/whatsapp/restart - Restart WhatsApp session
router.post('/restart', async (req, res) => {
    try {
        // First stop the session if it exists
        try {
            await wahaAPI(`/api/sessions/${SESSION_NAME}/stop`, 'POST');
        } catch (error) {
            console.log('Session might not exist, continuing...');
        }
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
        
        res.json({ 
            success: true, 
            message: 'Session restarted successfully' 
        });
    } catch (error) {
        console.error('Error restarting WhatsApp session:', error);
        res.status(500).json({ error: 'Failed to restart session' });
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
                
            case 'message.any':
                console.log(`Message event (any) from ${payload.from}: ${payload.body}`);
                handleIncomingMessage(payload);
                break;
                
            default:
                console.log(`Unhandled webhook event: ${event}`);
                break;
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// POST /api/whatsapp/autoreply - Toggle autoreply for leads bot
router.post('/autoreply', async (req, res) => {
    try {
        const { enabled } = req.body;
        
        // Store autoreply state in memory (you can later move this to database)
        global.leadsBotEnabled = enabled;
        
        console.log(`Leads Bot ${enabled ? 'enabled' : 'disabled'}`);
        
        res.json({ 
            success: true, 
            enabled: enabled,
            message: `Leads Bot ${enabled ? 'enabled' : 'disabled'}`
        });
    } catch (error) {
        console.error('Error toggling autoreply:', error);
        res.status(500).json({ error: 'Failed to toggle autoreply' });
    }
});

// GET /api/whatsapp/autoreply - Get current autoreply status
router.get('/autoreply', (req, res) => {
    res.json({ 
        enabled: global.leadsBotEnabled || false 
    });
});

// GET /api/whatsapp/chats - Get list of chats
router.get('/chats', async (req, res) => {
    try {
        const chats = await wahaAPI(`/api/${SESSION_NAME}/chats?limit=50`);
        
        // Format chats for frontend
        const formattedChats = chats.map(chat => {
            // Extract name from different possible fields
            let name = chat.name || chat.contact?.name || chat.contact?.pushname || '';
            
            // If no name, use phone number
            if (!name && chat.id) {
                name = chat.id.replace('@c.us', '').replace('@g.us', '');
                // Format phone number
                if (name.startsWith('62')) {
                    name = '+' + name.substring(0, 2) + ' ' + 
                           name.substring(2, 5) + '-' + 
                           name.substring(5, 9) + '-' + 
                           name.substring(9);
                }
            }
            
            return {
                id: chat.id || chat.chatId,
                name: name,
                lastMessage: chat.lastMessage?.body || chat.lastMessage?.caption || '',
                timestamp: chat.lastMessage?.timestamp ? 
                    new Date(chat.lastMessage.timestamp * 1000).toISOString() : 
                    new Date().toISOString(),
                unread: chat.unreadCount || 0
            };
        });
        
        // Sort by timestamp (newest first)
        formattedChats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        res.json(formattedChats);
    } catch (error) {
        console.error('Error getting chats:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to get chats' });
    }
});

// GET /api/whatsapp/messages/:chatId - Get messages for a specific chat
router.get('/messages/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        const limit = parseInt(req.query.limit) || 100;
        
        const messages = await wahaAPI(`/api/${SESSION_NAME}/chats/${encodeURIComponent(chatId)}/messages?limit=${limit}`);
        
        // Format messages for frontend
        const formattedMessages = messages.map(msg => ({
            id: msg.id || msg._id,
            from: msg.from || msg.chatId,
            fromMe: msg.fromMe || false,
            body: msg.body || msg.caption || '',
            timestamp: msg.timestamp ? 
                new Date(msg.timestamp * 1000).toISOString() : 
                new Date().toISOString(),
            hasMedia: msg.hasMedia || false,
            mediaUrl: msg.media?.url || null,
            type: msg.type || 'chat',
            ack: msg.ack || 1
        }));
        
        // Sort by timestamp (oldest first for chat display)
        formattedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        res.json(formattedMessages);
    } catch (error) {
        console.error('Error getting messages:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to get messages' });
    }
});

// Handle incoming messages
async function handleIncomingMessage(message) {
    try {
        console.log('=== HANDLING INCOMING MESSAGE ===');
        console.log('Message object:', JSON.stringify(message, null, 2));
        
        // Extract phone number
        const phoneNumber = message.from.replace('@c.us', '');
        console.log('Phone number:', phoneNumber);
        console.log('Message body:', message.body);
        console.log('Leads Bot enabled:', global.leadsBotEnabled);
        
        // Save message to database as lead
        // TODO: Save to database
        
        // Check if Leads Bot is enabled
        if (global.leadsBotEnabled) {
            console.log('Leads Bot is active, checking message...');
            
            // Simple test: Reply to "assalamualaikum" (only for personal chats, not groups)
            const isGroupMessage = message.from.includes('@g.us');
            
            if (!isGroupMessage && message.body && message.body.toLowerCase() === 'assalamualaikum') {
                console.log('Detected greeting from personal chat, sending reply...');
                try {
                    const result = await wahaAPI('/api/sendText', 'POST', {
                        chatId: message.from,
                        text: 'Waalaikumsalam'
                    });
                    console.log('Reply sent successfully!', result);
                    return; // Exit after sending reply
                } catch (error) {
                    console.error('Error sending reply:', error.response?.data || error.message);
                }
            } else if (!isGroupMessage) {
                console.log('Personal message but not assalamualaikum:', message.body);
            }
            
            // Check if message contains a package code
            const packageCodeRegex = /#(\d{4}_\d{1,2}[HMU]_[A-Z]{3}_[A-Z]{2,3}_[A-Z]{3}\d{1,2})/;
            const match = message.body ? message.body.match(packageCodeRegex) : null;
            
            if (match) {
                const packageCode = match[1];
                console.log(`Package code detected: ${packageCode}`);
                
                // Get package details from database
                const db = require('../config/database');
                try {
                    const result = await db.query(
                        'SELECT * FROM core.packages WHERE kode_paket = $1',
                        [packageCode]
                    );
                    
                    if (result.rows.length > 0) {
                        const pkg = result.rows[0];
                        
                        // Format package details message
                        let replyMessage = `*Paket Umroh ${pkg.nama_paket}*\n\n`;
                        replyMessage += `📅 Keberangkatan: ${new Date(pkg.tanggal_keberangkatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
                        replyMessage += `⏱ Durasi: ${pkg.durasi_hari} hari\n`;
                        replyMessage += `✈️ Maskapai: ${pkg.maskapai}\n`;
                        replyMessage += `🏨 Hotel: ${pkg.hotel_mekkah} (Mekkah), ${pkg.hotel_madinah} (Madinah)\n`;
                        replyMessage += `💰 Harga: Rp ${new Intl.NumberFormat('id-ID').format(pkg.harga_double)}/orang (Double)\n\n`;
                        replyMessage += `📋 *Fasilitas:*\n${pkg.fasilitas || 'Hubungi kami untuk detail fasilitas'}\n\n`;
                        replyMessage += `Untuk informasi lebih lanjut dan pendaftaran, silakan hubungi tim marketing kami.\n`;
                        replyMessage += `\nJazakallah khair 🙏`;
                        
                        // Send package details
                        await wahaAPI('/api/sendText', 'POST', {
                            chatId: message.from,
                            text: replyMessage
                        });
                        
                        // Send package images if available
                        if (pkg.gambar_utama) {
                            await wahaAPI('/api/sendFile', 'POST', {
                                chatId: message.from,
                                file: {
                                    url: `${process.env.BACKEND_URL || 'http://localhost:5000'}${pkg.gambar_utama}`
                                },
                                caption: `Gambar paket ${pkg.nama_paket}`
                            });
                        }
                        
                        console.log(`Sent package details for ${packageCode} to ${phoneNumber}`);
                    } else {
                        // Package not found
                        await wahaAPI('/api/sendText', 'POST', {
                            chatId: message.from,
                            text: `Mohon maaf, paket dengan kode *#${packageCode}* tidak ditemukan. Silakan cek kembali kode paket atau hubungi tim marketing kami untuk informasi paket yang tersedia.`
                        });
                    }
                } catch (dbError) {
                    console.error('Database error:', dbError);
                    // Send error message
                    await wahaAPI('/api/sendText', 'POST', {
                        chatId: message.from,
                        text: 'Mohon maaf, terjadi kesalahan sistem. Silakan coba beberapa saat lagi atau hubungi tim kami.'
                    });
                }
            }
        } else if (process.env.WA_AUTO_REPLY === 'true') {
            // Default auto-reply if Leads Bot is disabled but auto-reply is enabled
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