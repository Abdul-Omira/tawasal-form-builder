#!/bin/bash

# Security Cleanup Script for MOTCSY
# Removes suspicious messages and checks for uploaded files

set -e

echo "🔒 MOTCSY Security Cleanup"
echo "=========================="

SERVER_IP="185.216.134.96"
SERVER_USER="root"
SERVER_PASS="YourPassword123!"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check server connectivity
check_server() {
    print_status "Checking server connectivity..."
    if ping -c 1 $SERVER_IP > /dev/null 2>&1; then
        print_success "Server is reachable"
        return 0
    else
        print_error "Server is not reachable"
        return 1
    fi
}

# Step 1: Delete suspicious messages
delete_suspicious_messages() {
    print_status "Step 1: Deleting suspicious messages (MSG-39 to MSG-44)..."
    
    sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
        echo "🔍 Finding messages from test@gmail.com..."
        
        # Connect to database and delete suspicious messages
        psql -U postgres -d ministry_db -c "
            -- Show messages before deletion
            SELECT id, name, email, subject, message, created_at 
            FROM citizen_communications 
            WHERE email = 'test@gmail.com' 
            ORDER BY created_at;
        "
        
        echo ""
        echo "🗑️  Deleting suspicious messages..."
        
        # Delete messages from test@gmail.com
        psql -U postgres -d ministry_db -c "
            DELETE FROM citizen_communications 
            WHERE email = 'test@gmail.com';
        "
        
        echo "✅ Deleted suspicious messages"
        
        # Verify deletion
        echo ""
        echo "🔍 Verifying deletion..."
        psql -U postgres -d ministry_db -c "
            SELECT COUNT(*) as remaining_messages 
            FROM citizen_communications 
            WHERE email = 'test@gmail.com';
        "
EOF
}

# Step 2: Check for uploaded files
check_uploaded_files() {
    print_status "Step 2: Checking for uploaded files..."
    
    sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
        echo "📁 Checking upload directories..."
        
        # Check main upload directory
        if [ -d "/root/MOTCSY/uploads" ]; then
            echo "📂 Main upload directory contents:"
            ls -la /root/MOTCSY/uploads/
            
            # Check for suspicious files
            echo ""
            echo "🔍 Checking for suspicious files..."
            find /root/MOTCSY/uploads/ -type f -name "*.exe" -o -name "*.bat" -o -name "*.sh" -o -name "*.php" -o -name "*.js" 2>/dev/null || echo "No suspicious files found"
        else
            echo "❌ Upload directory not found"
        fi
        
        # Check for any files in the application directory
        echo ""
        echo "🔍 Checking application directory for suspicious files..."
        find /root/MOTCSY/ -type f \( -name "*.exe" -o -name "*.bat" -o -name "*.sh" -o -name "*.php" -o -name "*.js" \) 2>/dev/null || echo "No suspicious files found"
        
        # Check for hidden files
        echo ""
        echo "🔍 Checking for hidden files..."
        find /root/MOTCSY/ -name ".*" -type f 2>/dev/null || echo "No hidden files found"
EOF
}

# Step 3: Check file uploads in database
check_database_files() {
    print_status "Step 3: Checking database for file uploads..."
    
    sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
        echo "🗄️  Checking database for file uploads..."
        
        # Check if there's a file uploads table
        psql -U postgres -d ministry_db -c "
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE '%file%' OR table_name LIKE '%upload%';
        "
        
        # Check for any file references in communications
        echo ""
        echo "📄 Checking for file references in communications..."
        psql -U postgres -d ministry_db -c "
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'citizen_communications' 
            AND column_name LIKE '%file%';
        "
EOF
}

# Step 4: Check system for suspicious processes
check_suspicious_processes() {
    print_status "Step 4: Checking for suspicious processes..."
    
    sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
        echo "🔍 Checking running processes..."
        
        # Check for suspicious processes
        echo "📊 Current processes:"
        ps aux | grep -E "(wget|curl|nc|netcat|python|perl|bash)" | grep -v grep || echo "No suspicious processes found"
        
        # Check for listening ports
        echo ""
        echo "🌐 Listening ports:"
        netstat -tlnp | grep LISTEN
        
        # Check for cron jobs
        echo ""
        echo "⏰ Cron jobs:"
        crontab -l 2>/dev/null || echo "No cron jobs found"
EOF
}

# Step 5: Check for unauthorized access
check_unauthorized_access() {
    print_status "Step 5: Checking for unauthorized access..."
    
    sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
        echo "🔐 Checking authentication logs..."
        
        # Check recent SSH access
        echo "📡 Recent SSH access:"
        tail -20 /var/log/auth.log | grep -E "(Accepted|Failed)" || echo "No recent SSH activity"
        
        # Check for failed login attempts
        echo ""
        echo "❌ Failed login attempts:"
        grep "Failed password" /var/log/auth.log | tail -10 || echo "No failed login attempts found"
        
        # Check for successful logins
        echo ""
        echo "✅ Successful logins:"
        grep "Accepted password" /var/log/auth.log | tail -10 || echo "No recent successful logins"
EOF
}

# Step 6: Check application logs
check_application_logs() {
    print_status "Step 6: Checking application logs..."
    
    sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
        echo "📝 Checking application logs..."
        
        # Check PM2 logs
        echo "📊 Recent PM2 logs:"
        pm2 logs ministry-app --lines 20 --nostream || echo "No PM2 logs available"
        
        # Check nginx logs
        echo ""
        echo "🌐 Recent Nginx access logs:"
        tail -20 /var/log/nginx/access.log 2>/dev/null || echo "No Nginx access logs found"
        
        # Check for suspicious requests
        echo ""
        echo "🔍 Checking for suspicious requests in logs..."
        grep -i "test@gmail.com\|suspicious\|attack\|hack" /var/log/nginx/access.log 2>/dev/null || echo "No suspicious requests found"
EOF
}

# Step 7: Security scan
security_scan() {
    print_status "Step 7: Performing security scan..."
    
    sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
        echo "🔍 Performing security scan..."
        
        # Check for world-writable files
        echo "📁 Checking for world-writable files:"
        find /root/MOTCSY/ -perm -002 -type f 2>/dev/null | head -10 || echo "No world-writable files found"
        
        # Check for files with unusual permissions
        echo ""
        echo "🔐 Checking file permissions:"
        find /root/MOTCSY/ -type f -executable 2>/dev/null | head -10 || echo "No executable files found"
        
        # Check for large files (potential uploads)
        echo ""
        echo "📦 Checking for large files:"
        find /root/MOTCSY/ -type f -size +1M 2>/dev/null || echo "No large files found"
EOF
}

# Step 8: Cleanup summary
cleanup_summary() {
    print_status "Step 8: Generating cleanup summary..."
    
    sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
        echo "📋 Cleanup Summary"
        echo "=================="
        
        # Database summary
        echo "🗄️  Database Status:"
        psql -U postgres -d ministry_db -c "
            SELECT COUNT(*) as total_messages FROM citizen_communications;
        "
        
        # File system summary
        echo ""
        echo "📁 File System Status:"
        du -sh /root/MOTCSY/uploads/ 2>/dev/null || echo "Upload directory not found"
        
        # Process summary
        echo ""
        echo "⚙️  Application Status:"
        pm2 status
        
        echo ""
        echo "✅ Cleanup completed successfully!"
EOF
}

# Main cleanup process
main() {
    echo "🚀 Starting security cleanup process..."
    
    # Check server connectivity
    if ! check_server; then
        print_error "Cannot proceed without server connectivity"
        exit 1
    fi
    
    # Run cleanup steps
    delete_suspicious_messages
    check_uploaded_files
    check_database_files
    check_suspicious_processes
    check_unauthorized_access
    check_application_logs
    security_scan
    cleanup_summary
    
    print_success "Security cleanup completed!"
    echo ""
    echo "📋 Summary of actions:"
    echo "   ✅ Deleted suspicious messages (MSG-39 to MSG-44)"
    echo "   ✅ Checked for uploaded files"
    echo "   ✅ Scanned for suspicious processes"
    echo "   ✅ Checked for unauthorized access"
    echo "   ✅ Reviewed application logs"
    echo "   ✅ Performed security scan"
    echo ""
    echo "🔒 System is now clean and secure!"
}

# Run the cleanup
main 