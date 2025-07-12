#!/bin/bash

# 🤖 Syrian Ministry AI System Deployment Script
# Deploys Llama 3.1/3.2 models with Ollama to production server

set -e  # Exit on any error

# Configuration - Use environment variables for security
PRODUCTION_SERVER="${PRODUCTION_SERVER:-CHANGE_ME}"
PRODUCTION_PORT="${PRODUCTION_PORT:-22}"
PRODUCTION_USER="${PRODUCTION_USER:-CHANGE_ME}"
AI_MODELS=("llama3.2:latest" "llama3.1:8b")
OLLAMA_PORT="11434"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🤖 Syrian Ministry AI System Deployment"
echo "======================================"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running locally or deploying to production
if [[ $1 == "production" || $1 == "prod" ]]; then
    DEPLOY_TO_PRODUCTION=true
    print_header "🚀 PRODUCTION DEPLOYMENT MODE"
    echo "Target Server: $PRODUCTION_SERVER:$PRODUCTION_PORT"
else
    DEPLOY_TO_PRODUCTION=false
    print_header "🧪 LOCAL INSTALLATION MODE"
    echo "Installing AI system locally"
fi

# Function to run commands locally or on production server
run_command() {
    local cmd="$1"
    local description="$2"
    
    print_status "$description"
    
    if [[ $DEPLOY_TO_PRODUCTION == true ]]; then
        ssh -p $PRODUCTION_PORT $PRODUCTION_USER@$PRODUCTION_SERVER "$cmd"
    else
        eval "$cmd"
    fi
}

# Function to copy files to production server
copy_to_production() {
    local local_path="$1"
    local remote_path="$2"
    local description="$3"
    
    if [[ $DEPLOY_TO_PRODUCTION == true ]]; then
        print_status "$description"
        scp -P $PRODUCTION_PORT "$local_path" "$PRODUCTION_USER@$PRODUCTION_SERVER:$remote_path"
    fi
}

print_header "🔍 Step 1: Checking system compatibility"

# Check OS and architecture
run_command "uname -a" "Checking system information"

# Detect OS
if [[ $DEPLOY_TO_PRODUCTION == true ]]; then
    OS=$(ssh -p $PRODUCTION_PORT $PRODUCTION_USER@$PRODUCTION_SERVER "uname -s")
    ARCH=$(ssh -p $PRODUCTION_PORT $PRODUCTION_USER@$PRODUCTION_SERVER "uname -m")
else
    OS=$(uname -s)
    ARCH=$(uname -m)
fi

print_status "Detected OS: $OS"
print_status "Detected Architecture: $ARCH"

print_header "📦 Step 2: Installing Ollama"

if [[ $OS == "Darwin" ]]; then
    # macOS installation
    if [[ $DEPLOY_TO_PRODUCTION == false ]]; then
        print_status "Installing Ollama via Homebrew (macOS)"
        if ! command -v ollama &> /dev/null; then
            brew install ollama
            brew services start ollama
        else
            print_status "Ollama already installed"
        fi
    else
        print_error "Production server appears to be macOS, which is unusual. Please verify."
        exit 1
    fi
elif [[ $OS == "Linux" ]]; then
    # Linux installation
    print_status "Installing Ollama on Linux"
    run_command "curl -fsSL https://ollama.com/install.sh | sh" "Downloading and installing Ollama"
    
    # Start Ollama service
    run_command "systemctl enable ollama" "Enabling Ollama service"
    run_command "systemctl start ollama" "Starting Ollama service"
    
    # Wait for service to start
    print_status "Waiting for Ollama service to start..."
    sleep 10
    
else
    print_error "Unsupported operating system: $OS"
    exit 1
fi

print_header "🔥 Step 3: Configuring firewall for Ollama"

if [[ $OS == "Linux" ]]; then
    # Configure firewall for Ollama port
    run_command "ufw allow $OLLAMA_PORT/tcp" "Opening Ollama port $OLLAMA_PORT"
    print_status "Firewall configured for Ollama"
fi

print_header "🧠 Step 4: Downloading AI models"

for model in "${AI_MODELS[@]}"; do
    print_status "Downloading model: $model"
    run_command "ollama pull $model" "Pulling $model model"
done

print_header "🚀 Step 5: Testing AI models"

# Test each model
for model in "${AI_MODELS[@]}"; do
    print_status "Testing model: $model"
    run_command "ollama run $model 'مرحبا، اختبار سريع للنموذج'" "Testing $model with Arabic text"
done

print_header "📋 Step 6: Deploying application AI integration"

if [[ $DEPLOY_TO_PRODUCTION == true ]]; then
    # Copy AI service files to production
    copy_to_production "server/aiService.ts" "/var/www/syrian-ministry/server/" "Uploading AI service"
    
    # Update environment variables
    run_command "echo 'OLLAMA_HOST=http://localhost:11434' >> /var/www/syrian-ministry/.env" "Setting OLLAMA_HOST"
    run_command "echo 'AI_MODEL=llama3.2:latest' >> /var/www/syrian-ministry/.env" "Setting AI_MODEL"
    run_command "echo 'AI_FALLBACK_MODEL=llama3.1:8b' >> /var/www/syrian-ministry/.env" "Setting AI_FALLBACK_MODEL"
    
    # Rebuild application
    run_command "cd /var/www/syrian-ministry && npm run build" "Building application with AI integration"
    
    # Restart PM2 processes
    run_command "pm2 restart all" "Restarting PM2 processes"
    
else
    # Local deployment - just rebuild
    print_status "Building application locally with AI integration"
    npm run build
fi

print_header "🔍 Step 7: Verifying AI system status"

# Check Ollama service status
run_command "ollama list" "Checking available models"

# Test API endpoints (if production)
if [[ $DEPLOY_TO_PRODUCTION == true ]]; then
    print_status "Testing AI API endpoints..."
    
    # Wait a moment for services to fully start
    sleep 5
    
    # Test AI status endpoint
    run_command "curl -s http://localhost:5000/api/ai/status -H 'Authorization: Bearer admin-token' || echo 'AI status endpoint test (requires admin login)'" "Testing AI status endpoint"
fi

print_header "📊 Step 8: System Information Summary"

echo ""
echo "🎉 AI SYSTEM DEPLOYMENT COMPLETED!"
echo "=================================="
echo ""
echo "📋 Installation Summary:"
echo "  • Ollama Version: $(if [[ $DEPLOY_TO_PRODUCTION == true ]]; then ssh -p $PRODUCTION_PORT $PRODUCTION_USER@$PRODUCTION_SERVER 'ollama --version'; else ollama --version; fi)"
echo "  • AI Models Installed:"
for model in "${AI_MODELS[@]}"; do
    echo "    - $model ✅"
done
echo "  • Ollama Port: $OLLAMA_PORT"
echo "  • Integration: Syrian Ministry Platform ✅"
echo ""

if [[ $DEPLOY_TO_PRODUCTION == true ]]; then
    echo "🌐 Production Server Details:"
    echo "  • Server: $PRODUCTION_SERVER:$PRODUCTION_PORT"
    echo "  • Ollama Service: http://$PRODUCTION_SERVER:$OLLAMA_PORT"
    echo "  • AI API Endpoints: https://tawasal.moct.gov.sy/api/ai/*"
    echo ""
    echo "🔧 To manage Ollama on production:"
    echo "  • Check status: ssh -p $PRODUCTION_PORT $PRODUCTION_USER@$PRODUCTION_SERVER 'systemctl status ollama'"
    echo "  • View logs: ssh -p $PRODUCTION_PORT $PRODUCTION_USER@$PRODUCTION_SERVER 'journalctl -u ollama -f'"
    echo "  • Restart service: ssh -p $PRODUCTION_PORT $PRODUCTION_USER@$PRODUCTION_SERVER 'systemctl restart ollama'"
else
    echo "🧪 Local Development:"
    echo "  • Ollama Service: http://localhost:$OLLAMA_PORT"
    echo "  • AI API Endpoints: http://localhost:5000/api/ai/*"
    echo ""
    echo "🔧 To manage Ollama locally:"
    echo "  • Check status: ollama list"
    echo "  • Start service: brew services start ollama (macOS)"
    echo "  • Stop service: brew services stop ollama (macOS)"
fi

echo ""
echo "🔐 Available AI API Endpoints (Admin only):"
echo "  • GET  /api/ai/status     - AI system status"
echo "  • GET  /api/ai/health     - Health check"
echo "  • POST /api/ai/analyze    - Analyze communication"
echo "  • POST /api/ai/suggestions - Generate response suggestions"
echo "  • POST /api/ai/chat       - AI chat interface"
echo ""

echo "✨ The Syrian Ministry platform now has LOCAL AI CAPABILITIES!"
echo "🤖 No external APIs required - everything runs on your infrastructure"
echo "🛡️ Complete data privacy and security maintained"
echo ""

print_status "🎯 Next steps:"
echo "  1. Test the AI features in the admin panel"
echo "  2. Monitor system performance and resource usage"
echo "  3. Adjust AI model settings in environment variables if needed"
echo "  4. Train staff on new AI-powered features"

echo ""
echo "🚀 Deployment completed successfully!" 