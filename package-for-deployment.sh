#!/bin/bash

# Syrian Ministry of Communication - Deployment Package Creator
# Creates a ready-to-deploy package for tawasal.moct.gov.sy
# Author: Abdulwahab Omira <abdul@omiratech.com>

echo "Creating deployment package for tawasal.moct.gov.sy..."

# Create deployment directory
mkdir -p deployment-package
cd deployment-package

# Copy essential files
cp ../*.json .
cp ../*.ts .
cp ../*.js .
cp -r ../client .
cp -r ../server .
cp -r ../shared .
cp -r ../types .
cp ../nginx.conf .
cp ../quick-deploy.sh .
cp ../production.env .env.example

# Create startup script for server
cat > start-server.sh << 'EOF'
#!/bin/bash
cd /var/www/tawasal
export NODE_ENV=production
node --loader tsx server/index.ts
EOF

chmod +x start-server.sh
chmod +x quick-deploy.sh

# Create archive
cd ..
tar -czf tawasal-deployment.tar.gz deployment-package/

echo "Deployment package created: tawasal-deployment.tar.gz"
echo "Package size: $(du -h tawasal-deployment.tar.gz | cut -f1)"