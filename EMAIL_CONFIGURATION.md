# Email Configuration Guide

This guide explains how to configure email notifications for the Syrian Ministry Communication Platform.

## Quick Setup

The new email service supports multiple providers and automatically falls back to test mode if no configuration is provided.

### 1. Environment Variables

Add these environment variables to your `.env` file or production environment:

#### Option A: Custom SMTP Server
```env
# Custom SMTP Configuration
SMTP_HOST=mail.your-domain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@your-domain.com
SMTP_PASS=your-password
SMTP_TLS_REJECT_UNAUTHORIZED=true

# Email Recipients
MINISTER_EMAIL=minister@moct.gov.sy
DIRECTOR_EMAIL=director@moct.gov.sy
ADMIN_EMAIL=admin@moct.gov.sy
BACKUP_EMAIL=backup@moct.gov.sy
FROM_EMAIL="وزارة الاتصالات وتقانة المعلومات" <noreply@moct.gov.sy>

# Admin Panel URL (optional)
ADMIN_PANEL_URL=https://ministry.local/admin
```

#### Option B: Gmail Setup
```env
# Gmail Configuration (requires App Password)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Recipients
MINISTER_EMAIL=minister@moct.gov.sy
TEST_EMAIL=test@example.com  # For development
```

#### Option C: Outlook/Hotmail
```env
# Outlook Configuration
OUTLOOK_USER=your-email@outlook.com
OUTLOOK_PASSWORD=your-password

# Recipients
MINISTER_EMAIL=minister@moct.gov.sy
```

#### Option D: SendGrid
```env
# SendGrid Configuration
SENDGRID_API_KEY=your-sendgrid-api-key

# Recipients
MINISTER_EMAIL=minister@moct.gov.sy
```

### 2. Gmail App Password Setup

If using Gmail:

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account settings → Security → App passwords
3. Generate a new app password for "Mail"
4. Use this 16-character password as `GMAIL_APP_PASSWORD`

### 3. Development Mode

If no email configuration is provided, the system automatically uses Ethereal Email for testing:

- Test emails are sent to https://ethereal.email
- Check console logs for preview URLs
- No real emails are sent

## How It Works

### Automatic Configuration Detection

The service tries configurations in this order:
1. Custom SMTP (if `SMTP_HOST` is set)
2. Gmail (if `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set)
3. Outlook (if `OUTLOOK_USER` and `OUTLOOK_PASSWORD` are set)
4. SendGrid (if `SENDGRID_API_KEY` is set)
5. Fallback to Ethereal Email for testing

### Email Notifications

The system sends email notifications for:

1. **New Citizen Submissions**: Sent to minister and admin team
2. **Status Updates**: Sent to the citizen who submitted the message
3. **Test Emails**: For testing the configuration

### Security Features

- Automatic SMTP connection verification
- Secure TLS/SSL support
- HTML and text email formats
- Professional email templates
- Error handling and fallback

## Testing

### Test Email Endpoint

You can test email functionality by calling:

```bash
curl -X POST http://localhost:5000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test@example.com"}'
```

### Console Logs

Check the console for email status:
- ✅ Success messages with message IDs
- ❌ Error messages if sending fails
- 🔗 Preview URLs for test emails

## Production Setup

For production deployment:

1. Set `NODE_ENV=production`
2. Configure a reliable SMTP provider
3. Set proper recipient email addresses
4. Monitor logs for delivery status

## Troubleshooting

### Common Issues

1. **Gmail "Less secure app access"**: Use App Passwords instead
2. **SMTP connection timeout**: Check firewall/network settings
3. **Authentication failed**: Verify credentials
4. **TLS errors**: Set `SMTP_TLS_REJECT_UNAUTHORIZED=false` for testing

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=nodemailer:*
```

### Fallback Mode

If all configurations fail, the system automatically:
- Uses Ethereal Email for testing
- Logs all attempts
- Continues to function without breaking

## Features

✅ **Multiple Provider Support**: Gmail, Outlook, SendGrid, Custom SMTP  
✅ **Automatic Fallback**: Never breaks the application  
✅ **Professional Templates**: Arabic RTL support with ministry branding  
✅ **Security**: TLS/SSL encryption and secure authentication  
✅ **Testing**: Built-in test mode with preview URLs  
✅ **Monitoring**: Comprehensive logging and error handling  

## Migration from Old System

The new email service is fully backward compatible. No code changes are required in other files - just update your environment variables and restart the application.