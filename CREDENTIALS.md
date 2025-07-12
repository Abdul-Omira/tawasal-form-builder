# System Credentials (KEEP SECURE!)

## Admin Access
- **Username**: admin
- **Password**: Syria@MOCT#2024$Admin!

## Employee Access
- **Username**: employee  
- **Password**: MOCT@Employee#2024!Secure

## Email System
- **SMTP Server**: mail.moct.gov.sy
- **Email**: tawasal@moct.gov.sy
- **Password**: P@ssw0rd2026

## Security Keys (Already Set in .env)
- **JWT_SECRET**: j9fI6hjMHjJwMdB3mekRDC3gBpt2wOnK9KOeylrOvPM=
- **COOKIE_SECRET**: uAWas9813JOAdKNQiW9Zn8jobZYIBMA+1GXgFpSPTAE=
- **SESSION_SECRET**: j9fI6hjMHjJwMdB3mekRDC3gBpt2wOnK9KOeylrOvPM=

## Important Security Notes
1. **NEVER share these credentials**
2. **Change passwords regularly**
3. **Use different passwords in production**
4. **Store this file securely offline**
5. **Delete this file after memorizing**

## Login URLs
- Admin Panel: http://localhost:5173/mgt-system-2024
- Public Form: http://localhost:5173/

## Security Features Active
- ✅ Strong password policy enforced
- ✅ Brute force protection (3 attempts/15min)
- ✅ Session timeout after inactivity
- ✅ All passwords hashed with bcrypt
- ✅ JWT tokens expire after 24 hours