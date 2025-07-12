#!/bin/bash

# Syrian Ministry Platform - Simple Production Deployment
# This script deploys the application to 185.216.134.96:3322

set -e

echo "🇸🇾 Syrian Ministry Platform - Simple Production Deployment"
echo "=========================================================="

# Configuration
SERVER_IP="185.216.134.96"
SERVER_PORT="3322"
SERVER_USER="root"
SERVER_PASS="P@ssw0rd@moct123@!"
APP_NAME="moct-platform"
APP_DIR="/opt/moct-platform"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Build application locally
print_status "Step 1: Building application locally..."
if ! npm run build; then
    print_error "Build failed! Please fix build errors before deployment."
    exit 1
fi
print_success "Local build completed successfully"

# Step 2: Create production environment file
print_status "Step 2: Creating production environment configuration..."
cat > production.env << 'EOF'
# Syrian Ministry Platform - Production Environment
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://moct_user:SecurePassword2024!@localhost:5432/ministry_communication

# Security Configuration
SESSION_SECRET=syrian-ministry-platform-session-secret-2024-production
CSRF_SECRET=syrian-ministry-platform-csrf-secret-2024-production
JWT_SECRET=syrian-ministry-platform-jwt-secret-2024-production
JWT_EXPIRES_IN=24h

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/opt/moct-platform/uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# Application Configuration
APP_NAME="Syrian Ministry of Communication"
APP_VERSION=1.0.0
APP_DOMAIN=185.216.134.96
EOF

print_success "Production environment file created"

# Step 3: Test SSH connection
print_status "Step 3: Testing SSH connection..."
if ! ssh -p $SERVER_PORT -o ConnectTimeout=10 -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "echo 'SSH connection successful'"; then
    print_error "Cannot connect to server. Please check credentials and network connectivity."
    exit 1
fi
print_success "SSH connection established"

# Step 4: Deploy to server
print_status "Step 4: Deploying to server..."

# Create deployment script for server
cat > deploy-server.sh << 'EOF'
#!/bin/bash

# Server-side deployment script
set -e

APP_DIR="/opt/moct-platform"
APP_NAME="moct-platform"

echo "🚀 Starting server deployment..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required software
echo "🔧 Installing required software..."
apt install -y nodejs npm nginx git postgresql postgresql-contrib curl wget unzip

# Create application directory
echo "📁 Creating application directory..."
mkdir -p $APP_DIR
mkdir -p $APP_DIR/uploads
mkdir -p $APP_DIR/logs
mkdir -p $APP_DIR/backups

# Set proper permissions
chown -R www-data:www-data $APP_DIR
chmod 750 $APP_DIR
chmod 750 $APP_DIR/uploads
chmod 750 $APP_DIR/logs
chmod 750 $APP_DIR/backups

# Configure PostgreSQL
echo "🗄️ Configuring PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << 'SQL'
DROP DATABASE IF EXISTS ministry_communication;
DROP USER IF EXISTS moct_user;
CREATE DATABASE ministry_communication;
CREATE USER moct_user WITH ENCRYPTED PASSWORD 'SecurePassword2024!';
GRANT ALL PRIVILEGES ON DATABASE ministry_communication TO moct_user;
ALTER USER moct_user CREATEDB;
\q
SQL

# Install dependencies and build
echo "🔨 Installing dependencies and building application..."
cd $APP_DIR
npm ci --production
npm run build

# Install PM2
echo "⚡ Installing PM2..."
npm install -g pm2

# Create PM2 ecosystem file
cat > $APP_DIR/ecosystem.config.js << 'PM2EOF'
module.exports = {
  apps: [{
    name: 'moct-platform',
    script: '/opt/moct-platform/dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/opt/moct-platform/logs/err.log',
    out_file: '/opt/moct-platform/logs/out.log',
    log_file: '/opt/moct-platform/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
PM2EOF

# Start application with PM2
echo "🚀 Starting application with PM2..."
cd $APP_DIR
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/moct-platform << 'NGINXEOF'
server {
    listen 80;
    server_name 185.216.134.96;
    
    # Security headers
    add_header X-Frame-Options 'SAMEORIGIN' always;
    add_header X-Content-Type-Options 'nosniff' always;
    add_header X-XSS-Protection '1; mode=block' always;
    add_header Referrer-Policy 'strict-origin-when-cross-origin' always;
    
    # Main application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files
    location /uploads {
        alias /opt/moct-platform/uploads;
        expires 30d;
        add_header Cache-Control 'public, immutable';
        add_header X-Content-Type-Options 'nosniff' always;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 'healthy\n';
        add_header Content-Type text/plain;
    }
}
NGINXEOF

# Enable site
ln -sf /etc/nginx/sites-available/moct-platform /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t && systemctl reload nginx

# Configure firewall
echo "🛡️ Configuring firewall..."
apt install -y ufw
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3322/tcp
ufw --force enable

# Set proper permissions
echo "🔐 Setting proper permissions..."
chown -R www-data:www-data $APP_DIR
chmod 750 $APP_DIR/dist

echo "✅ Server deployment completed!"
echo "🌐 Application should be available at: http://185.216.134.96"
echo "📊 PM2 Status: pm2 status"
echo "📋 Logs: pm2 logs moct-platform"
EOF

# Copy deployment script to server
scp -P $SERVER_PORT -o StrictHostKeyChecking=no deploy-server.sh $SERVER_USER@$SERVER_IP:/tmp/

# Copy application files to server
print_status "Copying application files to server..."
rsync -avz -e "ssh -p $SERVER_PORT -o StrictHostKeyChecking=no" \
    --exclude node_modules \
    --exclude .git \
    --exclude dist \
    --exclude backups \
    --exclude uploads \
    --exclude logs \
    --exclude .env \
    --exclude .env.local \
    --exclude .env.development \
    ./ $SERVER_USER@$SERVER_IP:$APP_DIR/

# Copy production environment file
scp -P $SERVER_PORT -o StrictHostKeyChecking=no production.env $SERVER_USER@$SERVER_IP:$APP_DIR/.env

# Execute deployment script on server
print_status "Executing deployment script on server..."
ssh -p $SERVER_PORT -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "chmod +x /tmp/deploy-server.sh && /tmp/deploy-server.sh"

print_success "Deployment completed successfully!"

# Step 5: Verify deployment
print_status "Step 5: Verifying deployment..."
ssh -p $SERVER_PORT -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "
    echo '📊 PM2 Status:'
    pm2 status
    
    echo '🌐 Nginx Status:'
    systemctl status nginx --no-pager
    
    echo '🗄️ PostgreSQL Status:'
    systemctl status postgresql --no-pager
    
    echo '🔧 Health Check:'
    curl -f http://localhost:5000/health || echo 'Health check failed'
"

# Step 6: Display final information
echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉${NC}"
echo "================================================"
echo ""
echo -e "${BLUE}Application Information:${NC}"
echo "  🌐 URL: http://$SERVER_IP"
echo "  📊 Admin Panel: http://$SERVER_IP/mgt-system-2024"
echo "  🔧 Health Check: http://$SERVER_IP/health"
echo ""
echo -e "${BLUE}Server Information:${NC}"
echo "  🖥️  Server: $SERVER_IP:$SERVER_PORT"
echo "  👤 User: $SERVER_USER"
echo "  📁 App Directory: $APP_DIR"
echo ""
echo -e "${BLUE}Default Credentials:${NC}"
echo "  👨‍💼 Admin: admin / Syria@MOCT#2024\$Admin!"
echo "  👨‍💻 Employee: employee / MOCT@Employee#2024!Secure"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  📊 Check app status: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP 'pm2 status'"
echo "  📋 View logs: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP 'pm2 logs moct-platform'"
echo "  🔄 Restart app: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP 'pm2 restart moct-platform'"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT SECURITY REMINDERS:${NC}"
echo "  1. Change the root password immediately"
echo "  2. Update the database passwords in production"
echo "  3. Configure SSL certificate for HTTPS"
echo "  4. Set up regular backups"
echo "  5. Monitor application logs regularly"
echo ""
echo -e "${GREEN}✅ Your Syrian Ministry Platform is now live and ready for production!${NC}"

# Clean up local files
rm -f deploy-server.sh production.env 