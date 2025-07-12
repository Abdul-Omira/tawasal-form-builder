#!/bin/bash

# Syrian Ministry Platform - Server Deployment Instructions
# DO NOT share SSH credentials publicly!

echo "🚨 SECURITY WARNING: Change your root password immediately!"
echo "Run on server: passwd root"
echo ""
echo "📋 Follow these steps to deploy on your server (185.216.134.79):"
echo "=================================================="

# Step 1: Connect to your server
echo "1. Connect to server:"
echo "   ssh -p 3322 root@185.216.134.79"

# Step 2: Initial server setup
cat << 'EOF'

2. Run these commands on the server:

# Update system
apt update && apt upgrade -y

# Install required software
apt install -y nodejs npm nginx git postgresql postgresql-contrib

# Create app directory
mkdir -p /opt/moct-platform
cd /opt/moct-platform

# Clone your repository (or upload files)
# Option A: If you have a git repository
# git clone https://github.com/your-repo/moct-platform.git .

# Option B: Upload files from local machine (run on your LOCAL machine):
# rsync -avz -e "ssh -p 3322" --exclude node_modules --exclude .git ./* root@185.216.134.79:/opt/moct-platform/

3. Configure PostgreSQL:
sudo -u postgres psql << SQL
CREATE DATABASE ministry_communication;
CREATE USER moct_user WITH ENCRYPTED PASSWORD 'SecurePassword2024!';
GRANT ALL PRIVILEGES ON DATABASE ministry_communication TO moct_user;
\q
SQL

4. Set up environment:
cd /opt/moct-platform
cp .env.production .env
nano .env  # Update database credentials

5. Install dependencies and build:
npm install
npm run build

6. Install PM2 for process management:
npm install -g pm2

7. Start application:
pm2 start dist/index.js --name moct-platform
pm2 save
pm2 startup

8. Configure Nginx:
cat > /etc/nginx/sites-available/moct-platform << 'NGINX'
server {
    listen 80;
    server_name tawasal.moct.gov.sy;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINX

ln -s /etc/nginx/sites-available/moct-platform /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

9. Configure firewall:
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3322/tcp
ufw enable

10. Set up SSL (HTTPS):
apt install certbot python3-certbot-nginx -y
certbot --nginx -d tawasal.moct.gov.sy

EOF

echo ""
echo "🚨 IMPORTANT SECURITY STEPS:"
echo "1. Change root password immediately: passwd root"
echo "2. Create a non-root user for daily operations"
echo "3. Disable root SSH login"
echo "4. Set up fail2ban for brute force protection"
echo "5. Enable automatic security updates"