#!/bin/bash

# Rollback to Original Welcome Screen
echo "🔄 Rolling back to original welcome screen with full Syrian eagle logo..."

# Build the client with original welcome screen
echo "📦 Building client with original welcome screen..."
cd client
npm run build
cd ..

# Deploy to server
echo "📤 Uploading original files to server..."
scp -P 3322 -r client/dist/ root@185.216.134.96:/opt/moct-platform/client/
scp -P 3322 client/src/App.tsx root@185.216.134.96:/opt/moct-platform/client/src/

# SSH into server and restart services
echo "🔄 Restarting services on server..."
ssh -p 3322 root@185.216.134.96 << 'EOF'
    cd /opt/moct-platform
    
    # Rebuild on server 
    echo "Building on server..."
    cd client
    npm run build
    cd ..
    
    # Restart PM2 process
    echo "Restarting application..."
    pm2 restart moct-platform
    
    # Reload nginx
    echo "Reloading nginx..."
    nginx -s reload
    
    echo "✅ Rollback complete! Original welcome screen with full Syrian eagle logo restored."
    
    # Show status
    pm2 status
EOF

echo "🎉 Rollback Successful!"
echo "🦅 The original Syrian eagle logo is now restored in the welcome screen"
echo "🌐 Test at: https://tawasal.moct.gov.sy" 