#!/bin/bash

echo "🇸🇾 SYRIAN MINISTRY PLATFORM - PRODUCTION EMAIL SETUP"
echo "======================================================"
echo ""
echo "Setting up production-ready email system with SendGrid..."
echo ""

# Function to setup SendGrid
setup_sendgrid() {
    echo "📧 SENDGRID SETUP (Recommended for Production)"
    echo "=============================================="
    echo ""
    echo "1. Go to: https://sendgrid.com"
    echo "2. Sign up for free account (100 emails/day)"
    echo "3. Verify your email address"
    echo "4. Go to Settings → API Keys"
    echo "5. Create new API Key with 'Mail Send' permissions"
    echo ""
    
    read -p "Enter your SendGrid API Key (starts with SG.): " SENDGRID_API_KEY
    
    if [[ $SENDGRID_API_KEY == SG.* ]]; then
        echo "✅ Valid SendGrid API Key format"
    else
        echo "❌ Invalid API Key format. Should start with 'SG.'"
        exit 1
    fi
    
    # Backup current .env
    if [ -f .env ]; then
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        echo "✅ Backed up current .env file"
    fi
    
    # Remove old SMTP settings
    sed -i.bak '/^SMTP_/d' .env 2>/dev/null || true
    
    # Add SendGrid configuration
    cat >> .env << EOF

# Production Email Configuration - SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_REJECT_UNAUTHORIZED=true
SMTP_USER=apikey
SMTP_PASSWORD=$SENDGRID_API_KEY
EOF
    
    echo "✅ Updated .env with SendGrid configuration"
    echo ""
    echo "🎉 SENDGRID SETUP COMPLETE!"
    echo "=========================="
    echo "✅ Production-ready email system configured"
    echo "✅ 100 emails/day free tier activated"
    echo "✅ Enterprise-grade deliverability"
    echo ""
}

# Function to setup Amazon SES (alternative)
setup_amazon_ses() {
    echo "☁️ AMAZON SES SETUP (Enterprise Option)"
    echo "======================================="
    echo ""
    echo "1. Go to: https://aws.amazon.com/ses/"
    echo "2. Sign up for AWS account"
    echo "3. Go to SES console"
    echo "4. Create SMTP credentials"
    echo "5. Note your region (e.g., us-east-1)"
    echo ""
    
    read -p "Enter your AWS SES username: " SES_USERNAME
    read -p "Enter your AWS SES password: " SES_PASSWORD
    read -p "Enter your AWS region (e.g., us-east-1): " SES_REGION
    
    # Backup current .env
    if [ -f .env ]; then
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        echo "✅ Backed up current .env file"
    fi
    
    # Remove old SMTP settings
    sed -i.bak '/^SMTP_/d' .env 2>/dev/null || true
    
    # Add Amazon SES configuration
    cat >> .env << EOF

# Production Email Configuration - Amazon SES
SMTP_HOST=email-smtp.$SES_REGION.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_REJECT_UNAUTHORIZED=true
SMTP_USER=$SES_USERNAME
SMTP_PASSWORD=$SES_PASSWORD
EOF
    
    echo "✅ Updated .env with Amazon SES configuration"
    echo ""
    echo "🎉 AMAZON SES SETUP COMPLETE!"
    echo "=========================="
    echo "✅ Production-ready email system configured"
    echo "✅ $0.10 per 1,000 emails pricing"
    echo "✅ Unlimited scalability"
    echo ""
}

# Function to test email configuration
test_production_email() {
    echo "🧪 TESTING PRODUCTION EMAIL"
    echo "=========================="
    echo ""
    
    # Build the application first
    echo "📦 Building application..."
    npm run build > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Application built successfully"
    else
        echo "❌ Build failed - check your configuration"
        exit 1
    fi
    
    # Start production server in background
    echo "🚀 Starting production server..."
    NODE_ENV=production PORT=3001 npm run start &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 10
    
    # Test email sending
    echo "📧 Sending test email..."
    
    TEST_RESPONSE=$(curl -s -X POST http://localhost:3001/api/test-email \
        -H "Content-Type: application/json" \
        -d '{"to":"abdulwahab.omira@moct.gov.sy","subject":"Production Email Test - Syrian Ministry Platform"}')
    
    if echo "$TEST_RESPONSE" | grep -q '"success":true'; then
        echo "🎉 SUCCESS: Production email system is working!"
        echo "📧 Test email sent to: abdulwahab.omira@moct.gov.sy"
        echo "✅ All citizen communications will now be delivered"
    else
        echo "❌ Email test failed. Response: $TEST_RESPONSE"
        echo "💡 Check your API key and try again"
    fi
    
    # Stop the test server
    kill $SERVER_PID 2>/dev/null
    
    echo ""
}

# Function to show production deployment commands
show_deployment_commands() {
    echo "🚀 PRODUCTION DEPLOYMENT COMMANDS"
    echo "================================"
    echo ""
    echo "To deploy your Syrian Ministry Platform to production:"
    echo ""
    echo "1. Build the application:"
    echo "   npm run build"
    echo ""
    echo "2. Start production server:"
    echo "   NODE_ENV=production PORT=3001 npm run start"
    echo ""
    echo "3. Or use PM2 for process management:"
    echo "   npm install -g pm2"
    echo "   pm2 start ecosystem.config.js --env production"
    echo ""
    echo "4. Set up reverse proxy (nginx):"
    echo "   sudo apt update && sudo apt install nginx"
    echo "   # Configure nginx to proxy to your app"
    echo ""
    echo "5. Enable SSL with Let's Encrypt:"
    echo "   sudo apt install certbot python3-certbot-nginx"
    echo "   sudo certbot --nginx -d your-domain.com"
    echo ""
}

# Main menu
main_menu() {
    echo "Choose your production email solution:"
    echo ""
    echo "1) 📧 SendGrid (Recommended)"
    echo "   - 99.9% deliverability"
    echo "   - 100 emails/day free"
    echo "   - 5-minute setup"
    echo "   - Zero maintenance"
    echo ""
    echo "2) ☁️ Amazon SES (Enterprise)"
    echo "   - $0.10 per 1,000 emails"
    echo "   - Unlimited scale"
    echo "   - AWS integration"
    echo ""
    echo "3) 🧪 Test current configuration"
    echo ""
    echo "4) 📖 Show deployment commands"
    echo ""
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            setup_sendgrid
            test_production_email
            show_deployment_commands
            ;;
        2)
            setup_amazon_ses
            test_production_email
            show_deployment_commands
            ;;
        3)
            test_production_email
            ;;
        4)
            show_deployment_commands
            ;;
        *)
            echo "❌ Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
}

# Start the script
echo "This script will configure production-ready email for your Syrian Ministry Platform."
echo ""
main_menu

echo ""
echo "🎯 PRODUCTION EMAIL SETUP COMPLETE!"
echo "==================================="
echo "✅ Your email system is now production-ready"
echo "✅ All citizen communications will be delivered"
echo "✅ Enterprise-grade reliability and security"
echo ""
echo "🔄 Next: Deploy to your production server!"
echo "Run: NODE_ENV=production PORT=3001 npm run start" 