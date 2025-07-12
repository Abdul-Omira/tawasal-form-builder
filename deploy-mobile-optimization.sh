#!/bin/bash

# Mobile Performance Optimization Deployment Script
echo "🚀 Starting Mobile Performance Optimization Deployment..."

# Build the optimized client
echo "📦 Building optimized client..."
cd client
npm run build
cd ..

# Copy optimized files to server
echo "📤 Uploading optimized files to server..."
scp -P 3322 -r client/dist/ root@185.216.134.96:/opt/moct-platform/client/
scp -P 3322 client/src/components/animation/WelcomeScreenOptimized.tsx root@185.216.134.96:/opt/moct-platform/client/src/components/animation/
scp -P 3322 client/src/components/animation/OptimizedCalligraphyAnimation.tsx root@185.216.134.96:/opt/moct-platform/client/src/components/animation/
scp -P 3322 client/src/components/animation/FastWelcomeScreen.tsx root@185.216.134.96:/opt/moct-platform/client/src/components/animation/
scp -P 3322 client/src/App.tsx root@185.216.134.96:/opt/moct-platform/client/src/

# SSH into server and restart services
echo "🔄 Restarting services on server..."
ssh -p 3322 root@185.216.134.96 << 'EOF'
    cd /opt/moct-platform
    
    # Rebuild on server with optimizations
    echo "Building optimized version on server..."
    cd client
    npm run build
    cd ..
    
    # Restart PM2 process
    echo "Restarting application..."
    pm2 restart moct-platform
    
    # Reload nginx to ensure latest static files
    echo "Reloading nginx..."
    nginx -s reload
    
    echo "✅ Mobile optimization deployment complete!"
    
    # Show status
    pm2 status
EOF

echo "🎉 Mobile Performance Optimization Deployed Successfully!"
echo "📱 The welcome screen should now be much faster on mobile devices"
echo "🌐 Test at: https://tawasal.moct.gov.sy" 