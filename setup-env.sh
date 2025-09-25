#!/bin/bash

# Setup environment variables for Aiven PostgreSQL
echo "Setting up environment variables for Aiven PostgreSQL database..."

cat > .env << 'EOF'
# Server Configuration
PORT=5000
NODE_ENV=development

# Main Database (PostgreSQL - Aiven Cloud)
DB_HOST=e-commerce-database-rankhimanshu-9937.g.aivencloud.com
DB_PORT=17193
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=AVNS_19FQnuEbqNrvM2EAArt
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000

# Logs Database (PostgreSQL - Same as main for now)
DB_LOGS_HOST=e-commerce-database-rankhimanshu-9937.g.aivencloud.com
DB_LOGS_PORT=17193
DB_LOGS_NAME=defaultdb
DB_LOGS_USER=avnadmin
DB_LOGS_PASSWORD=AVNS_19FQnuEbqNrvM2EAArt
DB_LOGS_MAX_CONNECTIONS=10
DB_LOGS_IDLE_TIMEOUT=30000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-e-commerce-backend-2024-development-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-e-commerce-backend-2024-refresh
JWT_REFRESH_EXPIRES_IN=7d

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=5000000
FILE_UPLOAD_PATH=./uploads

# Frontend URL
CLIENT_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Application Settings
COMPANY_NAME=Your E-Commerce Store
SUPPORT_EMAIL=support@yourstore.com

# Redis Cache (Optional - for future use)
REDIS_URL=redis://localhost:6379
REDIS_READ_CLIENT_COUNT=5

# Elasticsearch (Optional - for future use)
ELASTICSEARCH_HOST=localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_elasticsearch_password
EOF

echo "✅ Environment variables set up successfully!"
echo "📝 Created .env file with Aiven PostgreSQL configuration"
echo "🔍 You can now test the database connection with: npm run db:test"
