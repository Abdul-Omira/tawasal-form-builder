# 🚀 Quick Deployment Instructions

## Option 1: Deploy on Your Current Machine
```bash
# The application is already built and ready!
# Start it with:
NODE_ENV=production npm start

# Or use PM2 for better process management:
npm install -g pm2
pm2 start dist/index.js --name moct-platform
```

## Option 2: Deploy to a VPS (DigitalOcean, Linode, etc.)

### 1. Get a VPS
- **Recommended**: DigitalOcean $20/month droplet
- **OS**: Ubuntu 22.04 LTS
- **Specs**: 2GB RAM, 2 CPU cores

### 2. Initial Server Setup
```bash
# SSH to your server
ssh root@your-server-ip

# Create user
adduser moct
usermod -aG sudo moct
su - moct

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt-get install git -y

# Install Nginx
sudo apt-get install nginx -y
```

### 3. Deploy Application
```bash
# Clone your code
cd /home/moct
git clone [your-repo] moct-platform
cd moct-platform

# Install dependencies
npm install

# Copy your .env.production file
# Make sure to update MINISTRY_SMTP_PASSWORD
nano .env.production

# Build application
npm run build

# Install PM2
sudo npm install -g pm2

# Start application
pm2 start dist/index.js --name moct-platform
pm2 save
pm2 startup
```

### 4. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/moct-platform
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name tawasal.moct.gov.sy;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/moct-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Add SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tawasal.moct.gov.sy
```

## Option 3: Deploy to Heroku (Easiest)

### 1. Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Ubuntu/Debian
curl https://cli-assets.heroku.com/install.sh | sh
```

### 2. Create Heroku App
```bash
heroku create syria-moct-platform
heroku addons:create heroku-postgresql:mini
```

### 3. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=j9fI6hjMHjJwMdB3mekRDC3gBpt2wOnK9KOeylrOvPM=
heroku config:set MINISTRY_SMTP_PASSWORD=P@ssw0rd2026
# Set all other variables from .env.production
```

### 4. Deploy
```bash
git push heroku main
```

## 🎯 Your Application is Ready!

**Frontend URL**: https://your-domain.com
**Admin Panel**: https://your-domain.com/mgt-system-2024

**Login Credentials**:
- Admin: `admin` / `Syria@MOCT#2024$Admin!`
- Employee: `employee` / `MOCT@Employee#2024!Secure`

## Need Help?

1. **Email not working?** Check MINISTRY_SMTP_PASSWORD is correct
2. **Can't access?** Check firewall allows ports 80/443
3. **Database error?** Run migrations: `npm run db:migrate`

## Monitoring

- View logs: `pm2 logs`
- Check status: `pm2 status`
- Monitor resources: `pm2 monit`