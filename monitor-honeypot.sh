#!/bin/bash

# Live Honeypot System Monitoring Script
# This script monitors all honeypot-related logs in real-time

echo "🛡️ LIVE HONEYPOT SYSTEM MONITORING"
echo "=================================="
echo "Monitoring started at: $(date)"
echo ""

# Function to show current status
show_status() {
    echo "📊 CURRENT SYSTEM STATUS:"
    echo "========================="
    sshpass -p 'P@ssw0rd@moct123@!' ssh -p 3322 root@185.216.134.96 "cd /opt/moct-platform && echo 'PM2 Status:' && pm2 status | grep moct-platform && echo '' && echo 'Honeypot Log Size:' && ls -lh logs/honeypot.log 2>/dev/null || echo 'No honeypot.log found'"
    echo ""
}

# Function to monitor honeypot logs
monitor_honeypot() {
    echo "🍯 MONITORING HONEYPOT LOGS:"
    echo "============================"
    sshpass -p 'P@ssw0rd@moct123@!' ssh -p 3322 root@185.216.134.96 "cd /opt/moct-platform && tail -f logs/honeypot.log"
}

# Function to monitor application logs
monitor_app_logs() {
    echo "📱 MONITORING APPLICATION LOGS:"
    echo "=============================="
    sshpass -p 'P@ssw0rd@moct123@!' ssh -p 3322 root@185.216.134.96 "cd /opt/moct-platform && tail -f logs/app-$(date +%Y-%m-%d).log"
}

# Function to monitor PM2 logs
monitor_pm2() {
    echo "⚡ MONITORING PM2 LOGS:"
    echo "======================"
    sshpass -p 'P@ssw0rd@moct123@!' ssh -p 3322 root@185.216.134.96 "pm2 logs moct-platform --lines 0"
}

# Function to show recent attempts
show_recent_attempts() {
    echo "🔍 RECENT HONEYPOT ATTEMPTS:"
    echo "============================"
    sshpass -p 'P@ssw0rd@moct123@!' ssh -p 3322 root@185.216.134.96 "cd /opt/moct-platform && echo 'Last 5 attempts:' && tail -5 logs/honeypot.log 2>/dev/null || echo 'No attempts logged yet'"
    echo ""
}

# Function to monitor security alerts
monitor_security_alerts() {
    echo "🚨 MONITORING SECURITY ALERTS:"
    echo "=============================="
    sshpass -p 'P@ssw0rd@moct123@!' ssh -p 3322 root@185.216.134.96 "cd /opt/moct-platform && tail -f logs/security-alerts.json 2>/dev/null || echo 'No security alerts file found'"
}

# Main monitoring function
main_monitoring() {
    echo "🎯 STARTING COMPREHENSIVE MONITORING..."
    echo "Press Ctrl+C to stop monitoring"
    echo ""
    
    # Show initial status
    show_status
    show_recent_attempts
    
    echo "📡 Starting live monitoring..."
    echo "=============================="
    
    # Start monitoring in parallel
    (
        echo "🍯 HONEYPOT LOGS:" && echo "================="
        sshpass -p 'P@ssw0rd@moct123@!' ssh -p 3322 root@185.216.134.96 "cd /opt/moct-platform && tail -f logs/honeypot.log"
    ) &
    
    (
        echo "📱 APP LOGS:" && echo "============="
        sshpass -p 'P@ssw0rd@moct123@!' ssh -p 3322 root@185.216.134.96 "cd /opt/moct-platform && tail -f logs/app-$(date +%Y-%m-%d).log"
    ) &
    
    (
        echo "⚡ PM2 LOGS:" && echo "============="
        sshpass -p 'P@ssw0rd@moct123@!' ssh -p 3322 root@185.216.134.96 "pm2 logs moct-platform --lines 0"
    ) &
    
    # Wait for all background processes
    wait
}

# Check if script is run with specific options
case "${1:-}" in
    "status")
        show_status
        ;;
    "recent")
        show_recent_attempts
        ;;
    "honeypot")
        monitor_honeypot
        ;;
    "app")
        monitor_app_logs
        ;;
    "pm2")
        monitor_pm2
        ;;
    "alerts")
        monitor_security_alerts
        ;;
    *)
        main_monitoring
        ;;
esac 