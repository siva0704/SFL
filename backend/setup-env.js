const fs = require('fs');
const path = require('path');

const envContent = `# Server Configuration
NODE_ENV=development
PORT=8001
API_VERSION=v1

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/fms
MONGODB_URI_TEST=mongodb://localhost:27017/fms-test

# JWT Configuration
JWT_SECRET=your-hiiamsudeeppatiliamfrombagalkot
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=hiiamsudeeppatiliamfrombagalkot123
JWT_REFRESH_EXPIRES_IN=30d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sudeeppatil24315@gmail.com
SMTP_PASS=yprl eqfr dnir aaxz

# Redis Configuration (for caching and sessions)
REDIS_URL=redis://localhost:6379

# External Services
SENTRY_DSN=your-sentry-dsn

# Feature Flags
ENABLE_SWAGGER=true
ENABLE_RATE_LIMITING=true
ENABLE_COMPRESSION=true
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully in backend directory');
  console.log('📝 Please review and update the MongoDB URI if needed');
  console.log('🔧 For local development, you can use: mongodb://localhost:27017/fms');
  console.log('🌐 For MongoDB Atlas, update MONGODB_URI with your connection string');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}
