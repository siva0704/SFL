const fs = require('fs');
const path = require('path');

const envContent = `# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=10000

# App Configuration
VITE_APP_NAME=Factory Management System
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=true

# External Services
VITE_SENTRY_DSN=
VITE_GOOGLE_ANALYTICS_ID=
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully in frontend directory');
  console.log('🔧 API base URL set to: http://localhost:8000/api/v1');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}
