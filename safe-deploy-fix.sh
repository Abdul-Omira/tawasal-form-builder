#!/bin/bash

# Safe Deployment Script for MOTCSY Security Fix
# This script safely deploys the storage.ts fix with backup and testing

set -e  # Exit on any error

echo "🔒 Safe Deployment Script for MOTCSY Security Fix"
echo "=================================================="

# Configuration
SERVER_IP="185.216.134.96"
SERVER_USER="root"
SERVER_PASS="YourPassword123!"
BACKUP_DIR="/root/MOTCSY/backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check server connectivity
check_server() {
    print_status "Checking server connectivity..."
    if ping -c 1 $SERVER_IP > /dev/null 2>&1; then
        print_success "Server is reachable"
        return 0
    else
        print_error "Server is not reachable. Please check network connectivity."
        return 1
    fi
}

# Function to create backup
create_backup() {
    print_status "Creating backup of current storage.ts..."
    
    sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
        mkdir -p /root/MOTCSY/backups
        if [ -f /root/MOTCSY/server/storage.ts ]; then
            cp /root/MOTCSY/server/storage.ts /root/MOTCSY/backups/storage.ts.backup.$(date +"%Y-%m-%d_%H-%M-%S")
            echo "Backup created successfully"
        else
            echo "Warning: storage.ts not found, no backup created"
        fi
EOF
}

# Function to deploy the fix
deploy_fix() {
    print_status "Deploying the security fix..."
    
    # Upload the fixed storage.ts file
    sshpass -p "$SERVER_PASS" scp server/storage.ts $SERVER_USER@$SERVER_IP:/root/MOTCSY/server/storage.ts
    
    # Restart the application safely
    sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
        cd /root/MOTCSY
        
        # Check current PM2 status
        echo "Current PM2 status:"
        pm2 status
        
        # Restart the application
        echo "Restarting application..."
        pm2 restart ministry-app
        
        # Wait a moment and check status
        sleep 5
        echo "New PM2 status:"
        pm2 status
        
        # Check if the application is running
        if pm2 list | grep -q "ministry-app.*online"; then
            echo "Application restarted successfully"
        else
            echo "ERROR: Application failed to restart"
            exit 1
        fi
EOF
}

# Function to test the fix
test_fix() {
    print_status "Testing the security fix..."
    
    # Test 1: Check if the application is responding
    print_status "Testing application response..."
    if curl -s -o /dev/null -w "%{http_code}" https://$SERVER_IP | grep -q "200\|302"; then
        print_success "Application is responding"
    else
        print_warning "Application might not be responding properly"
    fi
    
    # Test 2: Submit a test message to verify IP logging
    print_status "Testing IP address logging..."
    
    # Create a test submission
    TEST_RESPONSE=$(curl -s -X POST https://$SERVER_IP/api/citizen-communication \
        -H "Content-Type: application/json" \
        -H "X-Forwarded-For: 192.168.1.100" \
        -H "User-Agent: Test-Bot/1.0" \
        -d '{
            "name": "Test User",
            "email": "test-security@example.com",
            "phone": "+963123456789",
            "subject": "Security Test",
            "message": "Testing IP address logging functionality",
            "captchaToken": "test-token"
        }')
    
    echo "Test submission response: $TEST_RESPONSE"
    
    # Check if the test submission was recorded with IP
    sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
        echo "Checking database for test submission..."
        psql -U postgres -d ministry_db -c "
            SELECT id, name, email, subject, \"ipAddress\", \"userAgent\", created_at 
            FROM citizen_communications 
            WHERE email = 'test-security@example.com' 
            ORDER BY created_at DESC 
            LIMIT 1;
        "
EOF
}

# Function to rollback if needed
rollback() {
    print_warning "Rolling back to previous version..."
    
    sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
        cd /root/MOTCSY
        
        # Find the most recent backup
        LATEST_BACKUP=$(ls -t /root/MOTCSY/backups/storage.ts.backup.* 2>/dev/null | head -1)
        
        if [ -n "$LATEST_BACKUP" ]; then
            echo "Restoring from backup: $LATEST_BACKUP"
            cp "$LATEST_BACKUP" /root/MOTCSY/server/storage.ts
            
            # Restart application
            pm2 restart ministry-app
            
            echo "Rollback completed"
        else
            echo "No backup found for rollback"
        fi
EOF
}

# Main deployment process
main() {
    echo "🚀 Starting safe deployment process..."
    
    # Step 1: Check server connectivity
    if ! check_server; then
        print_error "Cannot proceed without server connectivity"
        exit 1
    fi
    
    # Step 2: Create backup
    print_status "Step 1/4: Creating backup..."
    create_backup
    
    # Step 3: Deploy the fix
    print_status "Step 2/4: Deploying security fix..."
    deploy_fix
    
    # Step 4: Test the fix
    print_status "Step 3/4: Testing the fix..."
    test_fix
    
    # Step 5: Final verification
    print_status "Step 4/4: Final verification..."
    sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
        echo "Final PM2 status:"
        pm2 status
        
        echo "Final Nginx status:"
        systemctl status nginx --no-pager -l
        
        echo "Recent application logs:"
        pm2 logs ministry-app --lines 10
EOF
    
    print_success "Deployment completed successfully!"
    echo ""
    echo "📋 Summary:"
    echo "   ✅ Backup created"
    echo "   ✅ Security fix deployed"
    echo "   ✅ Application restarted"
    echo "   ✅ Tests performed"
    echo ""
    echo "🔍 To verify the fix manually:"
    echo "   1. Submit a new message through the website"
    echo "   2. Check the database for IP address recording"
    echo "   3. Monitor logs for any issues"
    echo ""
    echo "🔄 If you need to rollback, run: ./rollback.sh"
}

# Rollback script creation
create_rollback_script() {
    cat > rollback.sh << 'EOF'
#!/bin/bash
echo "🔄 Rollback script for MOTCSY"
sshpass -p 'YourPassword123!' ssh root@185.216.134.96 << 'ROLLBACK_EOF'
    cd /root/MOTCSY
    
    # Find the most recent backup
    LATEST_BACKUP=$(ls -t /root/MOTCSY/backups/storage.ts.backup.* 2>/dev/null | head -1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        echo "Restoring from backup: $LATEST_BACKUP"
        cp "$LATEST_BACKUP" /root/MOTCSY/server/storage.ts
        
        # Restart application
        pm2 restart ministry-app
        
        echo "Rollback completed successfully"
    else
        echo "No backup found for rollback"
    fi
ROLLBACK_EOF
EOF
    chmod +x rollback.sh
    print_success "Rollback script created: rollback.sh"
}

# Check if we should run the deployment or just create scripts
if [ "$1" = "--create-scripts" ]; then
    create_rollback_script
    print_success "Scripts created. Run ./safe-deploy-fix.sh when server is accessible."
    exit 0
fi

# Run the main deployment
main 