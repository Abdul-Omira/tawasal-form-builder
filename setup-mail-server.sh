#!/bin/bash

echo "🇸🇾 SYRIAN MINISTRY PLATFORM - MAIL SERVER SETUP"
echo "=================================================="
echo ""
echo "This script will help you set up your own mail server to send emails"
echo "from the Syrian Ministry Platform without relying on external SMTP."
echo ""

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker and try again."
        exit 1
    fi
    echo "✅ Docker is running"
}

# Function to setup simple MailHog for testing
setup_mailhog() {
    echo "🧪 SETTING UP MAILHOG (Development/Testing)"
    echo "==========================================="
    echo "MailHog is perfect for development and testing emails."
    echo ""
    
    docker run -d \
        --name syrian-ministry-mailhog \
        -p 1025:1025 \
        -p 8025:8025 \
        --restart always \
        mailhog/mailhog:latest
    
    echo "✅ MailHog is running!"
    echo "📧 SMTP Server: localhost:1025 (no authentication needed)"
    echo "🌐 Web Interface: http://localhost:8025"
    echo ""
    echo "📝 Update your .env file with:"
    echo "SMTP_HOST=localhost"
    echo "SMTP_PORT=1025"
    echo "SMTP_SECURE=false"
    echo "SMTP_USER="
    echo "SMTP_PASSWORD="
    echo ""
}

# Function to setup simple SMTP relay
setup_smtp_relay() {
    echo "📨 SETTING UP SIMPLE SMTP RELAY"
    echo "==============================="
    echo "Simple SMTP relay for sending emails without authentication."
    echo ""
    
    docker run -d \
        --name syrian-ministry-smtp-relay \
        -p 1025:25 \
        -e RELAY_NETWORKS=:172.0.0.0/8:10.0.0.0/8:192.168.0.0/16:127.0.0.0/8 \
        --restart always \
        namshi/smtp
    
    echo "✅ SMTP Relay is running!"
    echo "📧 SMTP Server: localhost:1025 (no authentication needed)"
    echo ""
    echo "📝 Update your .env file with:"
    echo "SMTP_HOST=localhost"
    echo "SMTP_PORT=1025"
    echo "SMTP_SECURE=false"
    echo "SMTP_USER="
    echo "SMTP_PASSWORD="
    echo ""
}

# Function to setup complete mail server
setup_complete_mailserver() {
    echo "🏢 SETTING UP COMPLETE MAIL SERVER"
    echo "=================================="
    echo "Complete mail server with authentication, spam filtering, and web interface."
    echo ""
    
    # Create directories
    mkdir -p mail-data mail-config rainloop-data
    
    # Create user accounts
    echo "📝 Creating email accounts..."
    echo "tawasal@moct-platform.local|{PLAIN}admin123" > mail-config/postfix-accounts.cf
    echo "admin@moct-platform.local|{PLAIN}admin123" >> mail-config/postfix-accounts.cf
    echo "ministry@moct-platform.local|{PLAIN}admin123" >> mail-config/postfix-accounts.cf
    
    # Start the mail server
    docker-compose -f docker-compose-mail.yml up -d mailserver rainloop
    
    echo "✅ Complete Mail Server is starting up (may take 2-3 minutes)..."
    echo "📧 SMTP Server: localhost:587 or localhost:465"
    echo "👤 Email Accounts:"
    echo "   - tawasal@moct-platform.local (password: admin123)"
    echo "   - admin@moct-platform.local (password: admin123)"
    echo "   - ministry@moct-platform.local (password: admin123)"
    echo "🌐 Web Interface: http://localhost:8080"
    echo ""
    echo "📝 Update your .env file with:"
    echo "SMTP_HOST=localhost"
    echo "SMTP_PORT=587"
    echo "SMTP_SECURE=false"
    echo "SMTP_USER=tawasal@moct-platform.local"
    echo "SMTP_PASSWORD=admin123"
    echo ""
}

# Function to update application config
update_app_config() {
    echo "🔧 UPDATING APPLICATION CONFIGURATION"
    echo "====================================="
    
    # Backup current .env
    if [ -f .env ]; then
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        echo "✅ Backed up current .env file"
    fi
    
    # Update .env with new SMTP settings
    echo "📝 Updating .env file with local mail server settings..."
    
    # Remove old SMTP settings
    sed -i.bak '/^SMTP_/d' .env 2>/dev/null || true
    
    # Add new SMTP settings
    cat >> .env << EOF

# Local Mail Server Configuration
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_REJECT_UNAUTHORIZED=false
SMTP_USER=
SMTP_PASSWORD=
EOF
    
    echo "✅ Updated .env file with local mail server settings"
    echo ""
}

# Function to test email sending
test_email() {
    echo "📧 TESTING EMAIL SENDING"
    echo "======================="
    echo "Let's test if the mail server is working..."
    echo ""
    
    # Wait for server to be ready
    sleep 5
    
    # Test email with curl
    echo "Sending test email..."
    curl -X POST http://localhost:3000/api/test-email \
        -H "Content-Type: application/json" \
        -d '{"to":"test@example.com","subject":"Mail Server Test"}' \
        2>/dev/null | grep -o '"success":true' && \
        echo "✅ Email sent successfully!" || \
        echo "⚠️  Email test failed - check server logs"
}

# Main menu
main_menu() {
    echo "Please choose your mail server setup:"
    echo ""
    echo "1) 🧪 MailHog (Recommended for development/testing)"
    echo "   - No authentication needed"
    echo "   - Web interface to view emails"
    echo "   - Perfect for testing"
    echo ""
    echo "2) 📨 Simple SMTP Relay"
    echo "   - Basic SMTP sending"
    echo "   - No authentication"
    echo "   - Lightweight"
    echo ""
    echo "3) 🏢 Complete Mail Server"
    echo "   - Full email server with accounts"
    echo "   - Authentication required"
    echo "   - Web interface included"
    echo ""
    echo "4) 🔧 Just update app configuration"
    echo ""
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            check_docker
            setup_mailhog
            update_app_config
            echo "🎉 MAILHOG SETUP COMPLETE!"
            echo "Visit http://localhost:8025 to see captured emails"
            ;;
        2)
            check_docker
            setup_smtp_relay
            update_app_config
            echo "🎉 SMTP RELAY SETUP COMPLETE!"
            ;;
        3)
            check_docker
            setup_complete_mailserver
            update_app_config
            echo "🎉 COMPLETE MAIL SERVER SETUP COMPLETE!"
            echo "⏳ Wait 2-3 minutes for full startup, then visit http://localhost:8080"
            ;;
        4)
            update_app_config
            echo "🎉 CONFIGURATION UPDATED!"
            ;;
        *)
            echo "❌ Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
}

# Start the script
check_docker
main_menu

echo ""
echo "🔄 NEXT STEPS:"
echo "============="
echo "1. Restart your Syrian Ministry Platform:"
echo "   npm run dev:server"
echo ""
echo "2. Test email sending:"
echo "   Visit: http://localhost:3000"
echo "   Go to Admin panel and send a test email"
echo ""
echo "3. All citizen communications will now use your local mail server!"
echo ""
echo "✅ Your email system is now independent and fully under your control!" 