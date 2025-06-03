# Syrian Ministry of Communication Platform - Deployment Guide

**Author:** Abdulwahab Omira <abdul@omiratech.com>  
**Version:** 1.0.0  
**License:** MIT

## Server Requirements

- Ubuntu 20.04+ or similar Linux distribution
- Node.js 20+
- PostgreSQL 12+
- Nginx
- PM2 for process management
- 2GB+ RAM
- 20GB+ storage

## Deployment Steps

### 1. Connect to your server
```bash
ssh root@185.216.134.79 -p 3322
# Password: P@ssw0rd@moct123@!
```

### 2. Upload application files
```bash
# Create application directory
mkdir -p /var/www/ministry-app
cd /var/www/ministry-app

# Upload all project files to this directory
# You can use scp, rsync, or git clone
```

### 3. Run the deployment script
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 4. Configure environment variables
```bash
# Edit the production environment file
nano .env

# Update these critical values:
DATABASE_URL=postgresql://ministry_user:YOUR_DB_PASSWORD@localhost:5432/ministry_communication
SESSION_SECRET=YOUR_SECURE_SESSION_SECRET
CSRF_SECRET=YOUR_SECURE_CSRF_SECRET
JWT_SECRET=YOUR_JWT_SECRET
APP_DOMAIN=your-actual-domain.com
```

### 5. Update Nginx configuration
```bash
# Edit the nginx configuration
nano /etc/nginx/sites-available/ministry-app

# Update server_name with your actual domain
server_name your-actual-domain.com www.your-actual-domain.com;

# Test and reload nginx
nginx -t
systemctl reload nginx
```

### 6. Start the application
```bash
# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs
```

## Security Configuration

### Database Security
```sql
-- Connect to PostgreSQL and secure the database
sudo -u postgres psql

-- Create secure database user
CREATE USER ministry_user WITH PASSWORD 'YOUR_SECURE_PASSWORD';
CREATE DATABASE ministry_communication OWNER ministry_user;
GRANT ALL PRIVILEGES ON DATABASE ministry_communication TO ministry_user;
```

### Firewall Configuration
```bash
# Configure UFW firewall
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### SSL Certificate (Recommended)
```bash
# Install Certbot for Let's Encrypt SSL
apt install certbot python3-certbot-nginx

# Obtain SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Post-Deployment Verification

1. **Check application status:**
   ```bash
   pm2 status
   pm2 logs ministry-app
   ```

2. **Test database connection:**
   ```bash
   npm run db:push
   ```

3. **Verify web access:**
   - Visit: http://your-domain.com
   - Test form submissions
   - Check admin panel access

4. **Monitor logs:**
   ```bash
   tail -f logs/combined.log
   nginx access logs: /var/log/nginx/access.log
   nginx error logs: /var/log/nginx/error.log
   ```

## Maintenance Commands

```bash
# Restart application
pm2 restart ministry-app

# Update application
git pull origin main
npm install
npm run build
pm2 restart ministry-app

# Database backup
pg_dump ministry_communication > backup_$(date +%Y%m%d_%H%M%S).sql

# View application logs
pm2 logs ministry-app --lines 100
```

## Troubleshooting

### Common Issues

1. **Port 5000 already in use:**
   ```bash
   lsof -i :5000
   kill -9 PID_NUMBER
   ```

2. **Database connection failed:**
   - Check PostgreSQL service: `systemctl status postgresql`
   - Verify credentials in .env file
   - Check database exists: `sudo -u postgres psql -l`

3. **Nginx configuration errors:**
   ```bash
   nginx -t
   systemctl status nginx
   ```

4. **Permission issues:**
   ```bash
   chown -R www-data:www-data /var/www/ministry-app
   chmod -R 755 /var/www/ministry-app
   ```

## File Structure
```
/var/www/ministry-app/
├── client/               # Frontend React application
├── server/               # Backend Express server
├── shared/               # Shared types and schemas
├── uploads/              # User uploaded files
├── logs/                 # Application logs
├── .env                  # Environment configuration
├── nginx.conf            # Nginx configuration
├── deploy.sh            # Deployment script
├── ecosystem.config.js   # PM2 configuration
└── package.json         # Dependencies
```

## Default Admin Credentials

**Username:** admin  
**Password:** m5wYJU_FaXhyu^F  

**Important:** Change these credentials immediately after first login.

## Support

For technical support or deployment issues, contact:  
**Abdulwahab Omira** - abdul@omiratech.com