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
