# Security Configuration Guide

## Critical Security Checklist for Production

### 1. Environment Variables
- [ ] **NEVER commit .env files to version control**
- [ ] Set strong `MINISTRY_SMTP_PASSWORD` 
- [ ] Set strong `COOKIE_SECRET` (32+ random characters)
- [ ] Set strong `JWT_SECRET` (32+ random characters)
- [ ] Set `NODE_ENV=production`
- [ ] Set `DEBUG=false`

### 2. Before Deployment
```bash
# Check for hardcoded credentials
grep -r "password\|secret\|key" --include="*.ts" --include="*.js" .

# Update all dependencies
npm audit fix

# Build for production
NODE_ENV=production npm run build
```

### 3. Server Security
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall to only allow ports 80/443
- [ ] Disable SSH password authentication
- [ ] Set up fail2ban for brute force protection
- [ ] Regular security updates

### 4. Database Security
- [ ] Use strong database passwords
- [ ] Restrict database access to localhost only
- [ ] Regular database backups
- [ ] Enable database encryption at rest

### 5. File Upload Security
- [ ] Implement virus scanning (ClamAV recommended)
- [ ] Restrict file types to necessary ones only
- [ ] Store uploads outside web root
- [ ] Scan all files before serving

### 6. Monitoring
- [ ] Set up application monitoring
- [ ] Monitor failed login attempts
- [ ] Alert on suspicious activities
- [ ] Regular security audits

### 7. Privacy Compliance
- [ ] Review data collection practices
- [ ] Implement data retention policies
- [ ] Provide privacy policy
- [ ] Allow users to request data deletion

## Security Headers (Already Configured)
- ✅ Content Security Policy (CSP)
- ✅ HTTP Strict Transport Security (HSTS)
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection

## Rate Limiting (Already Configured)
- ✅ General API: 50 requests/15min (production)
- ✅ Login: 3 attempts/15min
- ✅ File upload: 5 files/hour
- ✅ Forms: 2 submissions/10min (production)

## Additional Recommendations
1. Use a Web Application Firewall (WAF)
2. Implement DDoS protection (Cloudflare recommended)
3. Regular penetration testing
4. Security training for administrators
5. Incident response plan