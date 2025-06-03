#!/bin/bash

# Syrian Ministry of Communication - Quick Deployment Script
# Domain: tawasal.moct.gov.sy
# Author: Abdulwahab Omira <abdul@omiratech.com>

set -e

echo "🚀 Quick deployment for tawasal.moct.gov.sy starting..."

# Configuration
APP_DIR="/var/www/tawasal"
SERVICE_NAME="tawasal-app"
DB_NAME="tawasal_db"
DB_USER="tawasal_user"
DB_PASS="Tawasal2024!@#"

# Create app directory
sudo mkdir -p $APP_DIR
cd $APP_DIR

# Install dependencies quickly
echo "📦 Installing system dependencies..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt update && sudo apt install -y nodejs nginx postgresql postgresql-contrib
sudo npm install -g pm2

# Copy application files (assuming they're in current directory)
echo "📁 Setting up application..."
cp -r /tmp/ministry-app/* . 2>/dev/null || echo "Files will be uploaded manually"

# Install app dependencies
npm install --production

# Setup database
echo "🗄️ Setting up database..."
sudo -u postgres createdb $DB_NAME 2>/dev/null || echo "Database exists"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || echo "User exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Create production environment
echo "⚙️ Creating environment configuration..."
cat > .env << EOL
NODE_ENV=production
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
SESSION_SECRET=$(openssl rand -base64 32)
CSRF_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
PORT=5000
APP_DOMAIN=tawasal.moct.gov.sy
EOL

# Build application
echo "🔨 Building application..."
npm run build

# Setup PM2 config
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    instances: 1,
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
EOL

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/tawasal << EOL
server {
    listen 80;
    server_name tawasal.moct.gov.sy www.tawasal.moct.gov.sy;
    
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOL

# Enable site
sudo ln -sf /etc/nginx/sites-available/tawasal /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Run database migrations
echo "🔄 Running database setup..."
npm run db:push

# Start application
echo "🚀 Starting application..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Set permissions
sudo chown -R www-data:www-data $APP_DIR

echo "✅ Deployment complete!"
echo "🌐 Application running at: http://tawasal.moct.gov.sy"
echo "👤 Admin login: admin / m5wYJU_FaXhyu^F"
echo "📊 Check status: pm2 status"