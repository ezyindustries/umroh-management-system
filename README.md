# Umroh Management System

Sistem manajemen umroh terintegrasi untuk mengelola jamaah, pembayaran, dokumen, dan operasional umroh.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 16+ (untuk development)
- PostgreSQL 13+ (jika tidak menggunakan Docker)

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd umroh-management
```

2. **Setup environment**
```bash
cp .env.example .env
# Edit .env dengan konfigurasi Anda
```

3. **Start dengan Docker**
```bash
./start.sh
```

Atau manual:
```bash
docker-compose up -d
docker-compose exec app node backend/scripts/setup-database.js
```

4. **Akses aplikasi**
- API: http://localhost:5000
- Frontend: http://localhost:8888
- Login: admin / admin123

## 📁 Project Structure

```
umroh-management/
├── backend/
│   ├── config/         # Database & app configuration
│   ├── middleware/     # Auth, validation, error handling
│   ├── routes/         # API endpoints
│   ├── migrations/     # Database migrations
│   ├── scripts/        # Setup & utility scripts
│   └── server-prod.js  # Main server file
├── frontend/
│   ├── *.html          # Modular frontend apps
│   └── shared/         # Shared CSS & JS
├── uploads/            # File uploads
├── logs/               # Application logs
├── docker-compose.yml  # Docker configuration
├── Dockerfile          # Container build
└── package.json        # Dependencies
```

## 🔧 Configuration

### Environment Variables
```env
# Application
NODE_ENV=production
PORT=5000

# Database
DB_HOST=localhost
DB_NAME=umroh_management
DB_USER=postgres
DB_PASSWORD=your_password

# Security
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email
SMTP_PASSWORD=app_password
```

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Run migrations
npm run migrate

# Start development server
npm run dev
```

### Database Commands
```bash
# Run migrations
npm run migrate

# Seed sample data
npm run seed

# Reset database
npm run db:reset
```

## 📦 Production Deployment

### Using Docker
```bash
# Build image
docker build -t umroh-app .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
```bash
# Install dependencies
npm ci --only=production

# Run migrations
NODE_ENV=production npm run migrate

# Start server
NODE_ENV=production npm start
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /var/www/umroh-frontend;
        try_files $uri /index.html;
    }
}
```

## 🔒 Security

- JWT authentication
- Bcrypt password hashing
- Rate limiting
- Input validation with Joi
- SQL injection protection
- XSS protection with Helmet
- CORS configuration

## 📊 API Documentation

### Authentication
```
POST   /api/auth/login      - Login
POST   /api/auth/logout     - Logout
GET    /api/auth/me         - Get current user
POST   /api/auth/refresh    - Refresh token
```

### Jamaah Management
```
GET    /api/jamaah          - List jamaah
GET    /api/jamaah/:id      - Get jamaah detail
POST   /api/jamaah          - Create jamaah
PUT    /api/jamaah/:id      - Update jamaah
DELETE /api/jamaah/:id      - Delete jamaah
```

### Payments
```
GET    /api/payments        - List payments
POST   /api/payments        - Create payment
PUT    /api/payments/:id    - Update payment
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- --testNamePattern="Auth"
```

## 🚨 Monitoring

- Health check: `/api/health`
- Metrics: `/api/metrics`
- Logs: Check `logs/` directory

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 License

Copyright 2025 - Umroh Management System