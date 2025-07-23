const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files
app.use(express.static(__dirname));

// Serve the demo HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Demo server is running'
    });
});

// Mock API endpoints for demo
app.use(express.json());

// Demo data
let demoJamaah = [
    {
        id: 1,
        full_name: 'Ahmad Salim',
        nik: '3201234567890123',
        passport_number: 'A1234567',
        package_name: 'Paket Reguler',
        package_id: 1,
        jamaah_status: 'active',
        birth_date: '1985-05-15',
        gender: 'L',
        phone: '081234567890',
        email: 'ahmad@example.com',
        address: 'Jl. Merdeka No. 123, Jakarta',
        created_at: '2024-01-15'
    },
    {
        id: 2,
        full_name: 'Fatimah Zahra',
        nik: '3201234567890124',
        passport_number: 'A1234568',
        package_name: 'Paket Premium',
        package_id: 2,
        jamaah_status: 'completed',
        birth_date: '1980-03-20',
        gender: 'P',
        phone: '081234567891',
        email: 'fatimah@example.com',
        address: 'Jl. Sudirman No. 456, Jakarta',
        created_at: '2024-01-10'
    },
    {
        id: 3,
        full_name: 'Muhammad Rizki',
        nik: '3201234567890125',
        passport_number: 'A1234569',
        package_name: 'Paket VIP',
        package_id: 3,
        jamaah_status: 'active',
        birth_date: '1990-07-10',
        gender: 'L',
        phone: '081234567892',
        email: 'rizki@example.com',
        address: 'Jl. Thamrin No. 789, Jakarta',
        created_at: '2024-01-20'
    }
];

let demoPackages = [
    {
        id: 1,
        name: 'Paket Reguler',
        price: 25000000,
        duration: 14,
        status: 'active',
        description: 'Paket umroh reguler 14 hari'
    },
    {
        id: 2,
        name: 'Paket Premium',
        price: 35000000,
        duration: 21,
        status: 'active',
        description: 'Paket umroh premium 21 hari'
    },
    {
        id: 3,
        name: 'Paket VIP',
        price: 45000000,
        duration: 28,
        status: 'active',
        description: 'Paket umroh VIP 28 hari'
    }
];

let demoPayments = [
    {
        id: 1,
        jamaah_id: 1,
        jamaah_name: 'Ahmad Salim',
        amount: 10000000,
        payment_date: '2024-01-15',
        payment_method: 'transfer',
        payment_status: 'completed',
        notes: 'Pembayaran DP'
    },
    {
        id: 2,
        jamaah_id: 2,
        jamaah_name: 'Fatimah Zahra',
        amount: 35000000,
        payment_date: '2024-01-10',
        payment_method: 'cash',
        payment_status: 'completed',
        notes: 'Pelunasan'
    }
];

let demoDocuments = [
    {
        id: 1,
        jamaah_id: 1,
        jamaah_name: 'Ahmad Salim',
        document_type: 'ktp',
        file_url: '#',
        upload_date: '2024-01-15',
        notes: 'KTP Ahmad Salim'
    },
    {
        id: 2,
        jamaah_id: 1,
        jamaah_name: 'Ahmad Salim',
        document_type: 'passport',
        file_url: '#',
        upload_date: '2024-01-15',
        notes: 'Paspor Ahmad Salim'
    }
];

let demoUsers = [
    {
        id: 1,
        name: 'Admin Demo',
        email: 'admin@umroh.com',
        role: 'admin',
        status: 'active'
    },
    {
        id: 2,
        name: 'Operator Demo',
        email: 'operator@umroh.com',
        role: 'operator',
        status: 'active'
    }
];

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (email === 'admin@umroh.com' && password === 'admin123') {
        res.json({
            success: true,
            user: demoUsers[0],
            token: 'demo-token-12345'
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }
});

// Jamaah endpoints
app.get('/api/jamaah/statistics', (req, res) => {
    res.json({
        success: true,
        data: {
            total_jamaah: demoJamaah.length,
            total_packages: demoPackages.length,
            pending_visa: Math.floor(demoJamaah.length * 0.3),
            total_revenue: demoPayments.reduce((sum, p) => sum + p.amount, 0)
        }
    });
});

app.get('/api/jamaah', (req, res) => {
    res.json({
        success: true,
        data: demoJamaah,
        pagination: {
            current_page: 1,
            total_pages: 1,
            total_records: demoJamaah.length
        }
    });
});

app.get('/api/jamaah/:id', (req, res) => {
    const jamaah = demoJamaah.find(j => j.id == req.params.id);
    if (jamaah) {
        res.json({ success: true, data: jamaah });
    } else {
        res.status(404).json({ success: false, message: 'Jamaah not found' });
    }
});

app.post('/api/jamaah', (req, res) => {
    const newJamaah = {
        id: Date.now(),
        ...req.body,
        created_at: new Date().toISOString().split('T')[0]
    };
    
    // Find package name
    const package = demoPackages.find(p => p.id == req.body.package_id);
    if (package) {
        newJamaah.package_name = package.name;
    }
    
    demoJamaah.unshift(newJamaah);
    res.json({ success: true, data: newJamaah });
});

app.put('/api/jamaah/:id', (req, res) => {
    const index = demoJamaah.findIndex(j => j.id == req.params.id);
    if (index !== -1) {
        // Find package name
        const package = demoPackages.find(p => p.id == req.body.package_id);
        if (package) {
            req.body.package_name = package.name;
        }
        
        demoJamaah[index] = { ...demoJamaah[index], ...req.body };
        res.json({ success: true, data: demoJamaah[index] });
    } else {
        res.status(404).json({ success: false, message: 'Jamaah not found' });
    }
});

app.delete('/api/jamaah/:id', (req, res) => {
    const index = demoJamaah.findIndex(j => j.id == req.params.id);
    if (index !== -1) {
        demoJamaah.splice(index, 1);
        res.json({ success: true, message: 'Jamaah deleted' });
    } else {
        res.status(404).json({ success: false, message: 'Jamaah not found' });
    }
});

// Packages endpoints
app.get('/api/packages', (req, res) => {
    res.json({ success: true, data: demoPackages });
});

app.post('/api/packages', (req, res) => {
    const newPackage = {
        id: Date.now(),
        ...req.body
    };
    demoPackages.unshift(newPackage);
    res.json({ success: true, data: newPackage });
});

app.put('/api/packages/:id', (req, res) => {
    const index = demoPackages.findIndex(p => p.id == req.params.id);
    if (index !== -1) {
        demoPackages[index] = { ...demoPackages[index], ...req.body };
        res.json({ success: true, data: demoPackages[index] });
    } else {
        res.status(404).json({ success: false, message: 'Package not found' });
    }
});

app.delete('/api/packages/:id', (req, res) => {
    const index = demoPackages.findIndex(p => p.id == req.params.id);
    if (index !== -1) {
        demoPackages.splice(index, 1);
        res.json({ success: true, message: 'Package deleted' });
    } else {
        res.status(404).json({ success: false, message: 'Package not found' });
    }
});

// Payments endpoints
app.get('/api/payments', (req, res) => {
    res.json({ success: true, data: demoPayments });
});

app.post('/api/payments', (req, res) => {
    const newPayment = {
        id: Date.now(),
        ...req.body
    };
    
    // Find jamaah name
    const jamaah = demoJamaah.find(j => j.id == req.body.jamaah_id);
    if (jamaah) {
        newPayment.jamaah_name = jamaah.full_name;
    }
    
    demoPayments.unshift(newPayment);
    res.json({ success: true, data: newPayment });
});

app.put('/api/payments/:id', (req, res) => {
    const index = demoPayments.findIndex(p => p.id == req.params.id);
    if (index !== -1) {
        // Find jamaah name
        const jamaah = demoJamaah.find(j => j.id == req.body.jamaah_id);
        if (jamaah) {
            req.body.jamaah_name = jamaah.full_name;
        }
        
        demoPayments[index] = { ...demoPayments[index], ...req.body };
        res.json({ success: true, data: demoPayments[index] });
    } else {
        res.status(404).json({ success: false, message: 'Payment not found' });
    }
});

app.delete('/api/payments/:id', (req, res) => {
    const index = demoPayments.findIndex(p => p.id == req.params.id);
    if (index !== -1) {
        demoPayments.splice(index, 1);
        res.json({ success: true, message: 'Payment deleted' });
    } else {
        res.status(404).json({ success: false, message: 'Payment not found' });
    }
});

// Documents endpoints
app.get('/api/documents', (req, res) => {
    res.json({ success: true, data: demoDocuments });
});

app.post('/api/documents', (req, res) => {
    const newDocument = {
        id: Date.now(),
        jamaah_id: req.body.jamaah_id,
        document_type: req.body.document_type,
        file_url: '#demo-file',
        upload_date: new Date().toISOString().split('T')[0],
        notes: req.body.notes
    };
    
    // Find jamaah name
    const jamaah = demoJamaah.find(j => j.id == req.body.jamaah_id);
    if (jamaah) {
        newDocument.jamaah_name = jamaah.full_name;
    }
    
    demoDocuments.unshift(newDocument);
    res.json({ success: true, data: newDocument });
});

app.delete('/api/documents/:id', (req, res) => {
    const index = demoDocuments.findIndex(d => d.id == req.params.id);
    if (index !== -1) {
        demoDocuments.splice(index, 1);
        res.json({ success: true, message: 'Document deleted' });
    } else {
        res.status(404).json({ success: false, message: 'Document not found' });
    }
});

// Users endpoints
app.get('/api/users', (req, res) => {
    res.json({ success: true, data: demoUsers });
});

app.post('/api/users', (req, res) => {
    const newUser = {
        id: Date.now(),
        ...req.body,
        status: 'active'
    };
    demoUsers.push(newUser);
    res.json({ success: true, data: newUser });
});

app.put('/api/users/:id', (req, res) => {
    const index = demoUsers.findIndex(u => u.id == req.params.id);
    if (index !== -1) {
        demoUsers[index] = { ...demoUsers[index], ...req.body };
        res.json({ success: true, data: demoUsers[index] });
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});

app.delete('/api/users/:id', (req, res) => {
    if (req.params.id == 1) {
        res.status(400).json({ success: false, message: 'Cannot delete admin user' });
        return;
    }
    
    const index = demoUsers.findIndex(u => u.id == req.params.id);
    if (index !== -1) {
        demoUsers.splice(index, 1);
        res.json({ success: true, message: 'User deleted' });
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});

// Health check for API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0-demo'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Demo server running on port ${PORT}`);
    console.log(`📱 Access your app at: http://103.181.143.223:${PORT}`);
    console.log(`🌐 Local access: http://localhost:${PORT}`);
    console.log(`📋 Demo credentials: admin@umroh.com / admin123`);
});

module.exports = app;