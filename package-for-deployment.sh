#!/bin/bash

# Syrian Ministry of Communication - Complete Deployment Package Creator
# Author: Abdulwahab Omira <abdul@omiratech.com>

echo "Creating complete deployment package for tawasal.moct.gov.sy..."

# Create deployment directory
mkdir -p deployment-package
cd deployment-package

# Copy ALL application files and directories
cp ../*.json . 2>/dev/null || echo "No JSON files in root"
cp ../*.ts . 2>/dev/null || echo "No TS files in root" 
cp ../*.js . 2>/dev/null || echo "No JS files in root"
cp -r ../client . 2>/dev/null || echo "No client directory"
cp -r ../server . 2>/dev/null || echo "No server directory"
cp -r ../shared . 2>/dev/null || echo "No shared directory"
cp -r ../types . 2>/dev/null || echo "No types directory"
cp -r ../uploads . 2>/dev/null || mkdir uploads
cp ../nginx.conf . 2>/dev/null || echo "No nginx.conf"
cp ../quick-deploy.sh . 2>/dev/null || echo "No quick-deploy.sh"
cp ../production.env .env.example 2>/dev/null || echo "No production.env"

# Ensure we have package.json
if [ ! -f "package.json" ]; then
    echo "Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "tawasal-ministry-app",
  "version": "1.0.0",
  "description": "Syrian Ministry of Communication Platform",
  "main": "server/index.ts",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "tsc && vite build",
    "start": "NODE_ENV=production node --loader tsx server/index.ts",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.2",
    "@neondatabase/serverless": "^0.9.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-aspect-ratio": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-context-menu": "^2.1.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-menubar": "^1.0.4",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@tanstack/react-query": "^5.8.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "cmdk": "^0.2.0",
    "connect-pg-simple": "^9.0.1",
    "cookie-parser": "^1.4.6",
    "crypto-js": "^4.2.0",
    "date-fns": "^2.30.0",
    "drizzle-orm": "^0.29.0",
    "drizzle-zod": "^0.5.1",
    "embla-carousel-react": "^8.0.0-rc18",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "express-session": "^1.17.3",
    "file-type": "^19.0.0",
    "framer-motion": "^10.16.5",
    "helmet": "^7.1.0",
    "hpp": "^0.2.3",
    "i18next": "^23.7.6",
    "input-otp": "^1.2.4",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.294.0",
    "memoizee": "^0.4.15",
    "multer": "^1.4.5-lts.1",
    "next-themes": "^0.2.1",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "react": "^18.2.0",
    "react-day-picker": "^8.9.1",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.48.2",
    "react-i18next": "^13.5.0",
    "react-icons": "^4.12.0",
    "react-resizable-panels": "^0.0.63",
    "recharts": "^2.8.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7",
    "tsx": "^4.6.0",
    "typescript": "^5.3.2",
    "uuid": "^9.0.1",
    "vaul": "^0.8.0",
    "wouter": "^3.0.0",
    "ws": "^8.14.2",
    "xss-clean": "^0.1.4",
    "zod": "^3.22.4",
    "zod-validation-error": "^2.1.0"
  },
  "devDependencies": {
    "@types/connect-pg-simple": "^7.0.3",
    "@types/crypto-js": "^4.2.1",
    "@types/express": "^4.17.21",
    "@types/express-session": "^1.17.10",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/memoizee": "^0.4.11",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.9.2",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@types/uuid": "^9.0.7",
    "@types/ws": "^8.5.10",
    "@vitejs/plugin-react": "^4.1.1",
    "autoprefixer": "^10.4.16",
    "drizzle-kit": "^0.20.4",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "vite": "^4.5.0"
  }
}
EOF
fi

# Create complete deployment script
cat > complete-deploy.sh << 'EOF'
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
EOF

chmod +x complete-deploy.sh

# Create archive
cd ..
tar -czf tawasal-complete.tar.gz deployment-package/

echo "Complete deployment package created: tawasal-complete.tar.gz"
echo "Package size: $(du -h tawasal-complete.tar.gz | cut -f1)"