#!/bin/bash
set -e

echo "🚀 Deploying tawasal.moct.gov.sy..."

# Configuration
APP_DIR="/var/www/tawasal"
SERVICE_NAME="tawasal-app"
DB_NAME="tawasal_db"
DB_USER="tawasal_user"
DB_PASS="Tawasal2024!@#"

# Create app directory and copy files
sudo mkdir -p $APP_DIR
sudo cp -r * $APP_DIR/
cd $APP_DIR

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt update && sudo apt install -y nodejs nginx postgresql postgresql-contrib
sudo npm install -g pm2

# Install dependencies
npm install --production

# Setup database
sudo -u postgres createdb $DB_NAME 2>/dev/null || echo "Database exists"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || echo "User exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Create environment
cat > .env << EOL
NODE_ENV=production
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
SESSION_SECRET=$(openssl rand -base64 32)
CSRF_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
PORT=5000
APP_DOMAIN=tawasal.moct.gov.sy
EOL

# Configure Nginx
sudo tee /etc/nginx/sites-available/tawasal << EOL
server {
    listen 80;
    server_name tawasal.moct.gov.sy www.tawasal.moct.gov.sy;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOL

sudo ln -sf /etc/nginx/sites-available/tawasal /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Setup PM2
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    instances: 1,
    env: { NODE_ENV: 'production', PORT: 5000 }
  }]
}
EOL

# Run migrations and start
npm run db:push 2>/dev/null || echo "Migration skipped"
pm2 start ecosystem.config.js
pm2 save
pm2 startup

sudo chown -R www-data:www-data $APP_DIR

echo "✅ Deployment complete!"
echo "🌐 Visit: http://tawasal.moct.gov.sy"
echo "👤 Admin: admin / m5wYJU_FaXhyu^F"
