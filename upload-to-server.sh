#!/bin/bash

# Script to upload files to your server
# Run this from your local machine

SERVER_IP="185.216.134.79"
SERVER_PORT="3322"
SERVER_USER="root"
REMOTE_PATH="/opt/moct-platform"

echo "📦 Preparing to upload Syrian Ministry Platform to server..."
echo "========================================================="

# Create a deployment package
echo "Creating deployment package..."
rm -rf deploy-package
mkdir -p deploy-package

# Copy only necessary files
cp -r dist deploy-package/
cp -r uploads deploy-package/
cp -r backups deploy-package/
cp package*.json deploy-package/
cp .env.production deploy-package/.env
cp nginx.conf deploy-package/
cp ecosystem.config.js deploy-package/

# Create server setup script
cat > deploy-package/setup-server.sh << 'EOF'
#!/bin/bash

echo "🚀 Setting up Syrian Ministry Platform on server..."

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Setup database
sudo -u postgres psql << SQL
CREATE DATABASE ministry_communication;
CREATE USER moct_user WITH ENCRYPTED PASSWORD 'MOCTdb@2024!Secure';
GRANT ALL PRIVILEGES ON DATABASE ministry_communication TO moct_user;
\q
SQL

# Update .env with database URL
sed -i 's|DATABASE_URL=.*|DATABASE_URL=postgresql://moct_user:MOCTdb@2024!Secure@localhost:5432/ministry_communication|' .env

# Install dependencies
npm ci --production

# Install PM2
npm install -g pm2

# Start application
pm2 start dist/index.js --name moct-platform
pm2 save
pm2 startup

# Install and configure Nginx
apt-get install -y nginx

cat > /etc/nginx/sites-available/tawasal << 'NGINX'
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
    }
}
NGINX

ln -sf /etc/nginx/sites-available/tawasal /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo "✅ Setup complete!"
EOF

chmod +x deploy-package/setup-server.sh

# Upload to server
echo ""
echo "📤 Uploading files to server..."
echo "When prompted, enter the password"
echo ""

# Create remote directory
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_PATH"

# Upload files
rsync -avz -e "ssh -p $SERVER_PORT" deploy-package/* $SERVER_USER@$SERVER_IP:$REMOTE_PATH/

echo ""
echo "✅ Files uploaded successfully!"
echo ""
echo "📋 Next steps:"
echo "1. SSH to server: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP"
echo "2. Go to directory: cd $REMOTE_PATH"
echo "3. Run setup: ./setup-server.sh"
echo "4. Access site at: http://tawasal.moct.gov.sy"

# Clean up
rm -rf deploy-package