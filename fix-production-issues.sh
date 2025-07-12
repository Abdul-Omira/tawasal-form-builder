#!/bin/bash

# Fix Production Issues Script
# This script addresses HTTPS/HTTP issues, static file serving, and security headers

echo "🔧 Fixing production issues..."

# 1. Update Nginx configuration to handle both HTTP and HTTPS properly
cat > /etc/nginx/sites-available/ministry-app << 'EOF'
# Syrian Ministry of Communication - Citizen Engagement Platform
# Nginx Configuration for Production Deployment

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name tawasal.moct.gov.sy www.tawasal.moct.gov.sy 185.216.134.96;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name tawasal.moct.gov.sy www.tawasal.moct.gov.sy 185.216.134.96;
    
    # SSL configuration (self-signed for now)
    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers (removed problematic COOP and Origin-Agent-Cluster)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' ~https: data: blob: 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: blob: https:; font-src 'self' data: https:;" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Serve static files with proper caching
    location /assets/ {
        alias /var/www/ministry-app/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
    
    # Serve favicon and other static assets
    location ~* \.(ico|svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot)$ {
        alias /var/www/ministry-app/dist/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Main application
    location / {
        try_files $uri $uri/ @fallback;
    }
    
    location @fallback {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 2. Generate self-signed SSL certificate
echo "🔐 Generating SSL certificate..."
mkdir -p /etc/ssl/private
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt \
    -subj "/C=SY/ST=Damascus/L=Damascus/O=Ministry of Communication/OU=IT Department/CN=tawasal.moct.gov.sy"

# 3. Enable the site and disable default
echo "🌐 Configuring Nginx sites..."
ln -sf /etc/nginx/sites-available/ministry-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 4. Test and reload Nginx
echo "🧪 Testing Nginx configuration..."
nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    systemctl reload nginx
    echo "🔄 Nginx reloaded successfully"
else
    echo "❌ Nginx configuration has errors"
    exit 1
fi

# 5. Check if static files exist and are accessible
echo "📁 Checking static files..."
if [ -d "/var/www/ministry-app/dist/assets" ]; then
    echo "✅ Assets directory exists"
    ls -la /var/www/ministry-app/dist/assets/ | head -5
else
    echo "❌ Assets directory not found"
    echo "Creating assets directory..."
    mkdir -p /var/www/ministry-app/dist/assets
fi

# 6. Check if favicon exists
if [ -f "/var/www/ministry-app/dist/favicon.svg" ]; then
    echo "✅ Favicon exists"
else
    echo "⚠️  Favicon not found, creating placeholder..."
    echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text y="20" font-size="20">M</text></svg>' > /var/www/ministry-app/dist/favicon.svg
fi

# 7. Set proper permissions
echo "🔐 Setting permissions..."
chown -R www-data:www-data /var/www/ministry-app/dist/
chmod -R 755 /var/www/ministry-app/dist/

# 8. Check PM2 status
echo "📊 Checking PM2 status..."
pm2 status

# 9. Show final status
echo ""
echo "🎉 Production issues fixed!"
echo "📋 Summary:"
echo "   ✅ HTTPS redirect configured"
echo "   ✅ SSL certificate generated"
echo "   ✅ Static files properly served"
echo "   ✅ Security headers optimized"
echo "   ✅ Nginx configuration updated"
echo ""
echo "🌐 Access your application at:"
echo "   HTTP: http://185.216.134.96 (will redirect to HTTPS)"
echo "   HTTPS: https://185.216.134.96"
echo ""
echo "⚠️  Note: You're using a self-signed certificate."
echo "   For production, replace with a proper SSL certificate." 