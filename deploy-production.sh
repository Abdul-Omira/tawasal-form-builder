#!/bin/bash

# Syrian Ministry Platform - Clean Production Deployment
# This script performs a clean deployment with minimal footprint

set -e

echo "🇸🇾 Syrian Ministry Platform - Clean Production Deployment"
echo "========================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Verify backup exists
echo -e "${YELLOW}Checking database backup...${NC}"
if [ ! -d "backups" ] || [ -z "$(ls -A backups)" ]; then
    echo -e "${RED}No backup found! Please run export-database-backup.ts first${NC}"
    exit 1
fi

LATEST_BACKUP=$(ls -t backups/*encrypted.json | head -1)
echo -e "${GREEN}✅ Found backup: $LATEST_BACKUP${NC}"

# Step 2: Clean build artifacts
echo -e "${YELLOW}Cleaning build artifacts...${NC}"
rm -rf dist/
rm -rf node_modules/.cache
rm -f .DS_Store

# Step 3: Production build
echo -e "${YELLOW}Building for production...${NC}"
NODE_ENV=production npm run build

# Step 4: Create production directories
echo -e "${YELLOW}Creating production directories...${NC}"
mkdir -p /opt/moct-platform/{dist,uploads,logs,backups}

# Step 5: Copy production files only
echo -e "${YELLOW}Copying production files...${NC}"
cp -r dist/* /opt/moct-platform/dist/
cp package.json /opt/moct-platform/
cp package-lock.json /opt/moct-platform/
cp .env.production /opt/moct-platform/.env

# Copy latest backup
cp "$LATEST_BACKUP" /opt/moct-platform/backups/

# Step 6: Install production dependencies only
echo -e "${YELLOW}Installing production dependencies...${NC}"
cd /opt/moct-platform
npm ci --production

# Step 7: Set up systemd service
echo -e "${YELLOW}Setting up systemd service...${NC}"
cat > /etc/systemd/system/moct-platform.service << EOF
[Unit]
Description=Syrian Ministry Communications Platform
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/moct-platform
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10
StandardOutput=append:/opt/moct-platform/logs/app.log
StandardError=append:/opt/moct-platform/logs/error.log
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Step 8: Start service
systemctl daemon-reload
systemctl enable moct-platform
systemctl start moct-platform

# Step 9: Configure nginx
echo -e "${YELLOW}Configuring nginx...${NC}"
cat > /etc/nginx/sites-available/moct-platform << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
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
        add_header Cache-Control "public, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/moct-platform /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Step 10: Set proper permissions
echo -e "${YELLOW}Setting permissions...${NC}"
chown -R www-data:www-data /opt/moct-platform
chmod 750 /opt/moct-platform
chmod -R 640 /opt/moct-platform/*
chmod 750 /opt/moct-platform/dist
chmod 750 /opt/moct-platform/uploads
chmod 750 /opt/moct-platform/logs

# Step 11: Check service status
echo -e "${YELLOW}Checking service status...${NC}"
systemctl status moct-platform --no-pager

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "============================="
echo "🌐 URL: http://$(hostname -I | awk '{print $1}')"
echo "📊 Admin: http://$(hostname -I | awk '{print $1}')/mgt-system-2024"
echo ""
echo "Credentials:"
echo "Admin: admin / Syria@MOCT#2024\$Admin!"
echo "Employee: employee / MOCT@Employee#2024!Secure"
echo ""
echo "Monitor logs: journalctl -u moct-platform -f"
echo "View app logs: tail -f /opt/moct-platform/logs/app.log"