# 🐳 Docker Deployment Guide - Syrian Ministry Platform

## Why Docker Makes Deployment Seamless

Docker transforms your complex 148-line manual deployment into a **single command**:

```bash
./deploy-docker.sh
```

## 🎯 Advantages Over Manual Deployment

| Manual Deployment | Docker Deployment |
|-------------------|-------------------|
| 148 lines of bash script | 1 command |
| System dependency issues | Isolated containers |
| File permission problems | Automatic permissions |
| Environment inconsistencies | Identical environments |
| Difficult rollbacks | Easy rollbacks |
| Security vulnerabilities | Container isolation |
| Manual service management | Automatic restarts |

## 🚀 Quick Start

### 1. Install Docker (One-time setup)

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

**CentOS/RHEL:**
```bash
sudo yum install -y docker docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 2. Deploy the Platform

```bash
# Clone your repository
git clone <your-repo-url>
cd MOTCSY

# Deploy with one command
./deploy-docker.sh
```

That's it! Your Syrian Ministry platform is now running with:
- ✅ Secure file upload system
- ✅ PostgreSQL database with Arabic support
- ✅ Redis for caching
- ✅ Nginx reverse proxy
- ✅ Automatic backups
- ✅ Health monitoring
- ✅ Security logging

## 🔧 Docker Services

Your platform runs these containerized services:

### 📱 Application Container (`moct-app`)
- Node.js 20 Alpine Linux
- Your Syrian Ministry application
- Secure file handling
- Health checks every 30 seconds

### 🗄️ Database Container (`moct-db`)
- PostgreSQL 16 with Arabic support
- Automatic backups
- Health monitoring
- Persistent data storage

### 🔄 Redis Container (`moct-redis`)
- Session storage
- Caching layer
- Password protected

### 🌐 Nginx Container (`moct-nginx`)
- Reverse proxy
- SSL termination
- Security headers
- Static file serving

### 🔄 Backup Container (`moct-backup`)
- Automated daily backups
- 30-day retention
- Compressed storage

## 📋 Management Commands

```bash
# Deploy platform
./deploy-docker.sh

# View service status
./deploy-docker.sh status

# View logs
./deploy-docker.sh logs

# Stop all services
./deploy-docker.sh stop

# Restart services
./deploy-docker.sh restart

# Create database backup
./deploy-docker.sh backup
```

## 🔐 Security Features

### Container Security
- **Non-root user**: All containers run as non-privileged users
- **Read-only filesystem**: Application container is read-only
- **No new privileges**: Prevents privilege escalation
- **Resource limits**: CPU and memory limits

### Network Security
- **Isolated network**: Custom bridge network `ministry-network`
- **Internal communication**: Services communicate internally
- **Firewall rules**: Only necessary ports exposed

### Data Security
- **Encrypted secrets**: Auto-generated secure secrets
- **Volume permissions**: Proper file permissions
- **Backup encryption**: Compressed and secured backups

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Internet      │    │   Your Server   │
│                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          │ HTTP/HTTPS           │
          │                      │
    ┌─────▼─────┐          ┌─────▼─────┐
    │   Nginx   │          │  Docker   │
    │  (Port 80)│          │  Engine   │
    └─────┬─────┘          └─────┬─────┘
          │                      │
          │ Proxy to             │
          │                      │
    ┌─────▼─────┐          ┌─────▼─────┐
    │    App    │◄────────►│    DB     │
    │ (Port 5000)│          │(Port 5432)│
    └─────┬─────┘          └─────┬─────┘
          │                      │
          │ Cache                │
          │                      │
    ┌─────▼─────┐          ┌─────▼─────┐
    │   Redis   │          │  Backup   │
    │ (Port 6379)│          │  Service  │
    └───────────┘          └───────────┘
```

## 🚀 Deployment Process

The `deploy-docker.sh` script automates:

1. **Environment Setup**: Generates secure secrets
2. **Directory Creation**: Creates data directories with proper permissions
3. **Service Building**: Builds optimized Docker images
4. **Service Deployment**: Starts all services with health checks
5. **Health Verification**: Waits for all services to be ready
6. **Migration Execution**: Runs database migrations
7. **Status Display**: Shows deployment status and credentials

## 📊 Monitoring

### Health Checks
- **Database**: `pg_isready` every 10 seconds
- **Application**: `/api/health` endpoint every 30 seconds
- **Redis**: Connection test every 10 seconds
- **Nginx**: HTTP status check every 30 seconds

### Logging
- **Application logs**: `/opt/moct-data/logs/`
- **Database logs**: Docker logs
- **Nginx logs**: Docker logs
- **System logs**: Docker daemon logs

### Backup System
- **Schedule**: Daily at 2 AM
- **Retention**: 30 days
- **Format**: Compressed SQL dumps
- **Location**: `/opt/moct-data/backups/`

## 🔧 Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check Docker status
sudo systemctl status docker

# Check logs
./deploy-docker.sh logs

# Restart services
./deploy-docker.sh restart
```

**Database connection issues:**
```bash
# Check database health
docker-compose -f docker-compose.production.yml exec db pg_isready -U postgres

# View database logs
docker-compose -f docker-compose.production.yml logs db
```

**File upload issues:**
```bash
# Check permissions
ls -la /opt/moct-data/
sudo chown -R 1001:1001 /opt/moct-data/
```

## 🔄 Updates and Rollbacks

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild and redeploy
./deploy-docker.sh
```

### Rollback
```bash
# Stop current services
./deploy-docker.sh stop

# Checkout previous version
git checkout <previous-commit>

# Redeploy
./deploy-docker.sh
```

## 🌐 Production Considerations

### SSL Certificate
```bash
# Add SSL certificates to ./ssl/ directory
mkdir -p ssl
# Copy your cert.pem and key.pem files
```

### Domain Configuration
Update `nginx-secure-latest.conf` with your domain:
```nginx
server_name tawasal.moct.gov.sy;
```

### Resource Limits
Adjust container resources in `docker-compose.production.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
```

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale application instances
docker-compose -f docker-compose.production.yml up -d --scale app=3
```

### Load Balancing
Add multiple app instances behind Nginx:
```nginx
upstream app_servers {
    server app_1:5000;
    server app_2:5000;
    server app_3:5000;
}
```

## 🎯 Summary

Docker deployment gives you:

- **🚀 One-command deployment**: `./deploy-docker.sh`
- **🔒 Enhanced security**: Container isolation
- **📊 Built-in monitoring**: Health checks and logging
- **🔄 Easy management**: Simple commands for all operations
- **💾 Automatic backups**: Daily database backups
- **🌐 Production-ready**: SSL, caching, and optimization
- **📈 Scalable**: Easy horizontal scaling

Your Syrian Ministry platform is now enterprise-ready with Docker! 🇸🇾 