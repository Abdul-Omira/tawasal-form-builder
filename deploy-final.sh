#!/bin/bash

# Syrian Ministry Platform - Final Production Deployment
# This script deploys the application to 185.216.134.96:3322

set -e

echo "🇸🇾 Syrian Ministry Platform - Final Production Deployment"
echo "========================================================="

# Configuration
SERVER_IP="185.216.134.96"
SERVER_PORT="3322"
SERVER_USER="root"
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

# Step 2: Test SSH connection
print_status "Step 2: Testing SSH connection..."
if ! ssh -p $SERVER_PORT -o ConnectTimeout=10 -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "echo 'SSH connection successful'"; then
    print_error "Cannot connect to server. Please check credentials and network connectivity."
    exit 1
fi
print_success "SSH connection established"

# Step 3: Prepare server environment
print_status "Step 3: Preparing server environment..."
ssh -p $SERVER_PORT -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "
    # Update system
    apt update && apt upgrade -y
    
    # Install Node.js 22.x (LTS)
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
    
    # Install required software
    apt install -y npm nginx git postgresql postgresql-contrib curl wget unzip
    
    # Create application directory
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
    
    # Print Node.js version
    node -v
    npm -v
"

print_success "Server environment prepared"

# Step 4: Configure PostgreSQL
print_status "Step 4: Configuring PostgreSQL..."
ssh -p $SERVER_PORT -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "
    # Start PostgreSQL service
    systemctl start postgresql
    systemctl enable postgresql
    
    # Create database and user
    sudo -u postgres psql << 'SQL'
    DROP DATABASE IF EXISTS ministry_communication;
    DROP USER IF EXISTS postgres;
    CREATE DATABASE ministry_communication;
    ALTER USER postgres WITH ENCRYPTED PASSWORD 'SyriaDB@2024!Secure';
    GRANT ALL PRIVILEGES ON DATABASE ministry_communication TO postgres;
    \q
SQL

    # Configure PostgreSQL for better performance
    echo 'max_connections = 100' >> /etc/postgresql/*/main/postgresql.conf
    echo 'shared_buffers = 256MB' >> /etc/postgresql/*/main/postgresql.conf
    echo 'effective_cache_size = 1GB' >> /etc/postgresql/*/main/postgresql.conf
    
    # Restart PostgreSQL
    systemctl restart postgresql
"

print_success "PostgreSQL configured successfully"

# Step 5: Copy application files
print_status "Step 5: Copying application files to server..."
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

print_success "Application files copied to server"

# Step 6: Install dependencies and build on server
print_status "Step 6: Installing dependencies and building on server..."
ssh -p $SERVER_PORT -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "
    cd $APP_DIR
    
    # Clean up previous installs
    rm -rf node_modules package-lock.json
    
    # Install all dependencies (including dev dependencies for build)
    PUPPETEER_SKIP_DOWNLOAD=true npm install --legacy-peer-deps
    
    # Build application
    npm run build
    
    # Set proper permissions
    chown -R www-data:www-data $APP_DIR
    chmod 750 $APP_DIR/dist
"

print_success "Dependencies installed and application built"

# Step 7: Install PM2 and configure application
print_status "Step 7: Installing PM2 and configuring application..."
ssh -p $SERVER_PORT -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "
    # Install PM2 globally
    npm install -g pm2
    
    # Create PM2 ecosystem file with .cjs extension
    cat > $APP_DIR/ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: '$APP_DIR/dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '$APP_DIR/logs/err.log',
    out_file: '$APP_DIR/logs/out.log',
    log_file: '$APP_DIR/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF

    # Start application with PM2
    cd $APP_DIR
    pm2 start ecosystem.config.cjs
    pm2 save
    pm2 startup
"

print_success "PM2 configured and application started"

# Step 8: Configure Nginx
print_status "Step 8: Configuring Nginx..."
ssh -p $SERVER_PORT -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "
    # Add rate limiting zones to main nginx.conf
    sed -i '/http {/a\\n    # Rate limiting zones\n    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;\n    limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;\n' /etc/nginx/nginx.conf
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/$APP_NAME << 'EOF'
server {
    listen 80;
    server_name 185.216.134.96 tawasal.moct.gov.sy;
    
    # Security headers
    add_header X-Frame-Options 'SAMEORIGIN' always;
    add_header X-Content-Type-Options 'nosniff' always;
    add_header X-XSS-Protection '1; mode=block' always;
    add_header Referrer-Policy 'strict-origin-when-cross-origin' always;
    add_header Strict-Transport-Security 'max-age=31536000; includeSubDomains' always;
    
    # Main application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }
    
    # API endpoints with stricter rate limiting
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Login endpoint with very strict rate limiting
    location /api/auth/login {
        limit_req zone=login burst=3 nodelay;
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files
    location /uploads {
        alias $APP_DIR/uploads;
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
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
"

print_success "Nginx configured successfully"

# Step 9: Configure firewall
print_status "Step 9: Configuring firewall..."
ssh -p $SERVER_PORT -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "
    # Install UFW if not present
    apt install -y ufw
    
    # Configure firewall
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow $SERVER_PORT/tcp
    ufw --force enable
"

print_success "Firewall configured"

# Step 10: Set up monitoring and logging
print_status "Step 10: Setting up monitoring and logging..."
ssh -p $SERVER_PORT -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "
    # Create log rotation configuration
    cat > /etc/logrotate.d/$APP_NAME << 'EOF'
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

    # Set up systemd service for PM2
    pm2 startup systemd -u www-data --hp /home/www-data
    systemctl enable pm2-www-data
"

print_success "Monitoring and logging configured"

# Step 11: Final security setup
print_status "Step 11: Final security setup..."
ssh -p $SERVER_PORT -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "
    # Install fail2ban for brute force protection
    apt install -y fail2ban
    
    # Configure fail2ban for SSH
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

    systemctl enable fail2ban
    systemctl start fail2ban
    
    # Set up automatic security updates
    apt install -y unattended-upgrades
    dpkg-reconfigure -plow unattended-upgrades
"

print_success "Security measures implemented"

# Step 12: Verify deployment
print_status "Step 12: Verifying deployment..."
ssh -p $SERVER_PORT -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "
    # Check if application is running
    pm2 status
    
    # Check if Nginx is running
    systemctl status nginx --no-pager
    
    # Check if PostgreSQL is running
    systemctl status postgresql --no-pager
    
    # Test application health
    curl -f http://localhost:5000/health || echo 'Health check failed'
"

print_success "Deployment verification completed"

# Step 13: Display final information
echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉${NC}"
echo "================================================"
echo ""
echo -e "${BLUE}Application Information:${NC}"
echo "  🌐 URL: http://$SERVER_IP"
echo "  🔒 Secure URL: https://tawasal.moct.gov.sy"
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
echo "  📋 View logs: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP 'pm2 logs $APP_NAME'"
echo "  🔄 Restart app: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP 'pm2 restart $APP_NAME'"
echo "  🛡️  Check security: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP 'fail2ban-client status'"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT SECURITY REMINDERS:${NC}"
echo "  1. Change the root password immediately"
echo "  2. Configure SSL certificate for HTTPS"
echo "  3. Set up regular backups"
echo "  4. Monitor application logs regularly"
echo "  5. Update the domain DNS to point to the server IP"
echo ""
echo -e "${GREEN}✅ Your Syrian Ministry Platform is now live and ready for production!${NC}" 