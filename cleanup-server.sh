#!/bin/bash

# Syrian Ministry of Communication - Server Cleanup Script
# This script cleans up the server environment
# 
# Author: Abdulwahab Omira <abdul@omiratech.com>
# Version: 1.0.0

set -e

echo "🧹 Starting server cleanup..."
echo "=============================="

# 1. Stop all Node.js processes
echo "🛑 Stopping Node.js processes..."
NODE_PIDS=$(ps -ax | grep -e "node" -e "npm" | grep -v grep | awk '{print $1}' || true)
if [ ! -z "$NODE_PIDS" ]; then
    echo "Found Node.js processes: $NODE_PIDS"
    for PID in $NODE_PIDS; do
        echo "  Killing process $PID..."
        kill -9 $PID 2>/dev/null || true
    done
    echo "✅ Node.js processes stopped"
else
    echo "ℹ️  No Node.js processes found"
fi

# 2. Free up ports
echo -e "\n🔌 Freeing up ports..."
# Kill processes on port 3000 (backend)
PORT_3000=$(lsof -ti:3000 || true)
if [ ! -z "$PORT_3000" ]; then
    echo "  Killing process on port 3000: $PORT_3000"
    kill -9 $PORT_3000 2>/dev/null || true
fi

# Kill processes on port 5173 (frontend)
PORT_5173=$(lsof -ti:5173 || true)
if [ ! -z "$PORT_5173" ]; then
    echo "  Killing process on port 5173: $PORT_5173"
    kill -9 $PORT_5173 2>/dev/null || true
fi

# Kill processes on port 5000 (production)
PORT_5000=$(lsof -ti:5000 || true)
if [ ! -z "$PORT_5000" ]; then
    echo "  Killing process on port 5000: $PORT_5000"
    kill -9 $PORT_5000 2>/dev/null || true
fi
echo "✅ Ports freed"

# 3. Clean up old log files
echo -e "\n📄 Cleaning up log files..."
if [ -d "logs" ]; then
    find logs -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
    echo "  Removed log files older than 7 days"
fi
rm -f server-output.log 2>/dev/null || true
rm -f npm-debug.log* 2>/dev/null || true
rm -f yarn-error.log* 2>/dev/null || true
echo "✅ Log files cleaned"

# 4. Clean up test files
echo -e "\n🧪 Cleaning up test files..."
TEST_FILES=$(find . -name "test-*.ts" -o -name "test-*.js" -o -name "debug-*.ts" -o -name "debug-*.js" | grep -v node_modules | grep -v .git || true)
if [ ! -z "$TEST_FILES" ]; then
    echo "$TEST_FILES" | while read file; do
        echo "  Removing: $file"
        rm -f "$file"
    done
else
    echo "  No test files found"
fi
echo "✅ Test files cleaned"

# 5. Clean up temporary files
echo -e "\n📁 Cleaning up temporary files..."
rm -rf tmp/* 2>/dev/null || true
rm -rf temp/* 2>/dev/null || true
rm -f .DS_Store 2>/dev/null || true
find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name "*.bak" -type f -delete 2>/dev/null || true
find . -name "*.swp" -type f -delete 2>/dev/null || true
echo "✅ Temporary files cleaned"

# 6. Clean up old email service files
echo -e "\n📧 Cleaning up old email files..."
if [ -d "local-mail-server" ]; then
    # Keep only the last 10 sent emails
    if [ -d "local-mail-server/sent" ]; then
        cd local-mail-server/sent
        ls -t | tail -n +21 | xargs rm -f 2>/dev/null || true
        cd ../..
        echo "  Kept only recent sent emails"
    fi
    
    # Clear failed emails
    if [ -d "local-mail-server/failed" ]; then
        rm -rf local-mail-server/failed/* 2>/dev/null || true
        echo "  Cleared failed emails"
    fi
    
    # Clear queue
    rm -f local-mail-server/queue.json 2>/dev/null || true
    rm -rf local-mail-server/queue/* 2>/dev/null || true
    echo "  Cleared email queue"
fi
echo "✅ Email files cleaned"

# 7. Clean and rebuild node_modules
echo -e "\n📦 Do you want to clean and rebuild node_modules? (y/n)"
read -r REBUILD_MODULES
if [ "$REBUILD_MODULES" = "y" ]; then
    echo "  Removing node_modules..."
    rm -rf node_modules
    echo "  Removing package-lock.json..."
    rm -f package-lock.json
    echo "  Installing dependencies..."
    npm install
    echo "✅ Dependencies rebuilt"
else
    echo "  Skipped node_modules rebuild"
fi

# 8. Clean build artifacts
echo -e "\n🏗️ Cleaning build artifacts..."
rm -rf dist/* 2>/dev/null || true
echo "✅ Build artifacts cleaned"

# 9. List what we're keeping
echo -e "\n📌 Preserved files and directories:"
echo "======================================"
echo "✅ Production configuration files"
echo "✅ Source code (client/, server/, shared/)"
echo "✅ Assets"
echo "✅ Database backups (if any)"
echo "✅ Uploads directory"
echo "✅ Documentation files"
echo "✅ Git repository"

# 10. Summary
echo -e "\n📊 Cleanup Summary:"
echo "==================="
echo "✅ Stopped all Node.js processes"
echo "✅ Freed ports 3000, 5000, 5173"
echo "✅ Removed old log files"
echo "✅ Removed test and debug files"
echo "✅ Cleaned temporary files"
echo "✅ Cleaned old email files"
if [ "$REBUILD_MODULES" = "y" ]; then
    echo "✅ Rebuilt node_modules"
fi
echo "✅ Cleaned build artifacts"

echo -e "\n🎉 Server cleanup completed successfully!"
echo "To start the server again, run: npm run dev"