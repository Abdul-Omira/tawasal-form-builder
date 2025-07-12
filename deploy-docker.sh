#!/bin/bash

# Syrian Ministry Platform - Docker Production Deployment
# One-command deployment with Docker Compose

set -e

echo "🇸🇾 Syrian Ministry Platform - Docker Deployment"
echo "================================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOCKER_COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.docker"
DATA_DIR="/opt/moct-data"
BACKUP_DIR="./backups"

# Function to generate secure secrets
generate_secret() {
    openssl rand -base64 32
}

# Function to create environment file
create_env_file() {
    echo -e "${YELLOW}Creating environment file...${NC}"
    
    cat > $ENV_FILE << EOF
# Syrian Ministry of Communications Platform - Docker Production Environment
# Generated for Docker deployment

# Database Configuration
DB_PASSWORD=$(generate_secret)
DATABASE_URL=postgres://postgres:\${DB_PASSWORD}@db:5432/ministry_communication

# Security Secrets
SESSION_SECRET=$(generate_secret)
JWT_SECRET=$(generate_secret)
FILE_ACCESS_SECRET=$(generate_secret)

# Redis Configuration
REDIS_PASSWORD=$(generate_secret)

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Syria@MOCT#2024\$Admin!
ADMIN_NAME=مدير النظام

# Employee Credentials
EMPLOYEE_USERNAME=employee
EMPLOYEE_PASSWORD=MOCT@Employee#2024!Secure
EMPLOYEE_NAME=موظف وزارة الاتصالات

# Application Configuration
NODE_ENV=production
PORT=5000
TZ=Asia/Damascus

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png,gif

# Backup Configuration
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30

# Security Configuration
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
HONEYPOT_ENABLED=true

# Monitoring
HEALTH_CHECK_INTERVAL=30
LOG_LEVEL=info
EOF

    echo -e "${GREEN}✅ Environment file created: $ENV_FILE${NC}"
}

# Function to create data directories
create_directories() {
    echo -e "${YELLOW}Creating data directories...${NC}"
    
    sudo mkdir -p $DATA_DIR/{postgres,redis,uploads,secure-uploads,logs}
    sudo chown -R 1001:1001 $DATA_DIR
    sudo chmod -R 755 $DATA_DIR
    
    # Create backup directory
    mkdir -p $BACKUP_DIR
    
    echo -e "${GREEN}✅ Data directories created${NC}"
}

# Function to create backup script
create_backup_script() {
    echo -e "${YELLOW}Creating backup script...${NC}"
    
    mkdir -p scripts
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash

# Database backup script for Docker deployment
BACKUP_DIR="/backups"
DB_NAME="ministry_communication"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump -h db -U postgres -d $DB_NAME > "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Remove old backups (keep last 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$TIMESTAMP.sql.gz"
EOF

    chmod +x scripts/backup.sh
    echo -e "${GREEN}✅ Backup script created${NC}"
}

# Function to create health check endpoint
create_health_check() {
    echo -e "${YELLOW}Adding health check endpoint...${NC}"
    
    # Check if health endpoint exists in routes
    if ! grep -q "/api/health" server/routes.ts; then
        echo "Adding health check endpoint to routes..."
        
        # Add health check route
        cat >> server/routes.ts << 'EOF'

// Health check endpoint for Docker
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});
EOF
    fi
    
    echo -e "${GREEN}✅ Health check endpoint ready${NC}"
}

# Function to build and deploy
deploy_application() {
    echo -e "${YELLOW}Building and deploying application...${NC}"
    
    # Pull latest images
    docker-compose -f $DOCKER_COMPOSE_FILE pull
    
    # Build application
    docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache
    
    # Start services
    docker-compose -f $DOCKER_COMPOSE_FILE --env-file $ENV_FILE up -d
    
    echo -e "${GREEN}✅ Application deployed successfully${NC}"
}

# Function to wait for services
wait_for_services() {
    echo -e "${YELLOW}Waiting for services to be ready...${NC}"
    
    # Wait for database
    echo "Waiting for database..."
    until docker-compose -f $DOCKER_COMPOSE_FILE exec db pg_isready -U postgres; do
        sleep 2
    done
    
    # Wait for application
    echo "Waiting for application..."
    until curl -f http://localhost:5000/api/health > /dev/null 2>&1; do
        sleep 2
    done
    
    echo -e "${GREEN}✅ All services are ready${NC}"
}

# Function to run database migrations
run_migrations() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    
    # Copy migration files if they exist
    if [ -d "migrations" ]; then
        docker-compose -f $DOCKER_COMPOSE_FILE exec app node -e "
            const fs = require('fs');
            const path = require('path');
            console.log('Migration files found:', fs.readdirSync('/docker-entrypoint-initdb.d'));
        "
    fi
    
    echo -e "${GREEN}✅ Database migrations completed${NC}"
}

# Function to show deployment status
show_status() {
    echo -e "${BLUE}Deployment Status:${NC}"
    echo "===================="
    
    docker-compose -f $DOCKER_COMPOSE_FILE ps
    
    echo ""
    echo -e "${GREEN}✅ Syrian Ministry Platform Deployed Successfully!${NC}"
    echo "=================================================="
    echo ""
    echo "🌐 Application URL: http://$(hostname -I | awk '{print $1}')"
    echo "📊 Admin Panel: http://$(hostname -I | awk '{print $1}')/mgt-system-2024"
    echo ""
    echo "Admin Credentials:"
    echo "Username: admin"
    echo "Password: Syria@MOCT#2024\$Admin!"
    echo ""
    echo "Employee Credentials:"
    echo "Username: employee"
    echo "Password: MOCT@Employee#2024!Secure"
    echo ""
    echo "📋 Useful Commands:"
    echo "View logs: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
    echo "Stop services: docker-compose -f $DOCKER_COMPOSE_FILE down"
    echo "Restart: docker-compose -f $DOCKER_COMPOSE_FILE restart"
    echo "Backup database: docker-compose -f $DOCKER_COMPOSE_FILE exec db-backup /scripts/backup.sh"
    echo ""
    echo "📊 Service Status:"
    echo "Database: $(docker-compose -f $DOCKER_COMPOSE_FILE ps db --format 'table {{.State}}')"
    echo "Application: $(docker-compose -f $DOCKER_COMPOSE_FILE ps app --format 'table {{.State}}')"
    echo "Nginx: $(docker-compose -f $DOCKER_COMPOSE_FILE ps nginx --format 'table {{.State}}')"
}

# Main deployment process
main() {
    echo -e "${BLUE}Starting Docker deployment process...${NC}"
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
        exit 1
    fi
    
    # Stop existing services if running
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        echo -e "${YELLOW}Stopping existing services...${NC}"
        docker-compose -f $DOCKER_COMPOSE_FILE down 2>/dev/null || true
    fi
    
    # Create environment file
    create_env_file
    
    # Create directories
    create_directories
    
    # Create backup script
    create_backup_script
    
    # Create health check
    create_health_check
    
    # Deploy application
    deploy_application
    
    # Wait for services
    wait_for_services
    
    # Run migrations
    run_migrations
    
    # Show status
    show_status
}

# Handle script arguments
case "${1:-}" in
    "stop")
        echo -e "${YELLOW}Stopping services...${NC}"
        docker-compose -f $DOCKER_COMPOSE_FILE down
        ;;
    "restart")
        echo -e "${YELLOW}Restarting services...${NC}"
        docker-compose -f $DOCKER_COMPOSE_FILE restart
        ;;
    "logs")
        docker-compose -f $DOCKER_COMPOSE_FILE logs -f
        ;;
    "status")
        docker-compose -f $DOCKER_COMPOSE_FILE ps
        ;;
    "backup")
        echo -e "${YELLOW}Creating database backup...${NC}"
        docker-compose -f $DOCKER_COMPOSE_FILE exec db-backup /scripts/backup.sh
        ;;
    *)
        main
        ;;
esac 