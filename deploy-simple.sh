#!/bin/bash

# Simple Deployment Script (Without Docker)
# For quick deployment on any server with Node.js

echo "🇸🇾 Syrian Ministry Platform - Simple Deployment"
echo "=============================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed!"
    echo "Install with: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

# Check if production build exists
if [ ! -d "dist" ]; then
    echo "📦 Building application..."
    npm run build
fi

# Create necessary directories
mkdir -p uploads logs backups

# Create PM2 ecosystem file for process management
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'moct-platform',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

echo "🚀 Starting application..."

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save
pm2 startup

echo ""
echo "✅ Deployment Complete!"
echo "======================="
echo "🌐 Application URL: http://localhost:5000"
echo "📊 Admin Panel: http://localhost:5000/mgt-system-2024"
echo ""
echo "Useful commands:"
echo "- View logs: pm2 logs"
echo "- Monitor: pm2 monit"
echo "- Restart: pm2 restart moct-platform"
echo "- Stop: pm2 stop moct-platform"