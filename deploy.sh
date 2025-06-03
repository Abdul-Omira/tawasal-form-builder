#!/bin/bash

# Syrian Ministry of Communication - Citizen Engagement Platform
# Production Deployment Script for Nginx Server
# 
# Author: Abdulwahab Omira <abdul@omiratech.com>
# Version: 1.0.0
# License: MIT

set -e

echo "Starting deployment of Syrian Ministry of Communication Platform..."

# Configuration
APP_DIR="/var/www/ministry-app"
SERVICE_NAME="ministry-app"
NGINX_SITE="/etc/nginx/sites-available/ministry-app"
DB_NAME="ministry_communication"

# Create application directory
sudo mkdir -p $APP_DIR
cd $APP_DIR

# Install system dependencies
echo "Installing system dependencies..."
sudo apt update
sudo apt install -y nodejs npm nginx postgresql postgresql-contrib git curl

# Install Node.js 20 if needed
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone or copy application files
echo "Setting up application files..."
# Note: Copy your application files to this directory

# Install application dependencies
echo "Installing application dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Set up PostgreSQL database
echo "Setting up database..."
sudo -u postgres createdb $DB_NAME || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER ministry_user WITH PASSWORD 'secure_password_123!';" || echo "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO ministry_user;"

# Create environment file
echo "Creating environment configuration..."
cat > .env << EOL
NODE_ENV=production
DATABASE_URL=postgresql://ministry_user:secure_password_123!@localhost:5432/$DB_NAME
SESSION_SECRET=$(openssl rand -base64 32)
PORT=5000
EOL

# Run database migrations
echo "Running database migrations..."
npm run db:push

# Set up PM2 ecosystem file
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOL

# Create logs directory
mkdir -p logs

# Set up Nginx configuration
echo "Configuring Nginx..."
sudo cp nginx.conf $NGINX_SITE
sudo ln -sf $NGINX_SITE /etc/nginx/sites-enabled/ministry-app || echo "Symlink already exists"
sudo nginx -t
sudo systemctl reload nginx

# Start the application with PM2
echo "Starting application..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Set proper permissions
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR

# Enable services
sudo systemctl enable nginx
sudo systemctl enable postgresql

echo "Deployment completed successfully!"
echo "Application should be running on http://your-domain.com"
echo "Check application status with: pm2 status"
echo "View logs with: pm2 logs"