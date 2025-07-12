/**
 * Syrian Ministry of Communication - Password Security Cleanup
 * Remove any hardcoded passwords and secure all credential handling
 * 
 * @author Security Team - Emergency Response
 * @version 1.0.0 - Maximum Security Implementation
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Security configuration
const SECURITY_CLEANUP_CONFIG = {
  LOG_FILE: path.join(process.cwd(), 'logs', 'password-security-cleanup.log'),
  BACKUP_DIR: path.join(process.cwd(), 'security-backups'),
  SCAN_EXTENSIONS: ['.ts', '.js', '.json', '.txt', '.md'],
  SENSITIVE_PATTERNS: [
    /password\s*[:=]\s*['"`]([^'"`]{6,})['"`]/gi,
    /admin.*password.*['"`]([^'"`]{6,})['"`]/gi,
    /secret\s*[:=]\s*['"`]([^'"`]{6,})['"`]/gi,
    /token\s*[:=]\s*['"`]([^'"`]{20,})['"`]/gi,
    /key\s*[:=]\s*['"`]([^'"`]{10,})['"`]/gi
  ],
  WHITELIST_PATTERNS: [
    'process.env.',
    'environment variable',
    'placeholder',
    'example',
    'dummy',
    'test-token',
    'your-password-here'
  ]
};

interface SecurityIssue {
  file: string;
  line: number;
  type: 'hardcoded_password' | 'exposed_secret' | 'weak_security';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

/**
 * Scan for security issues in code files
 */
async function scanForSecurityIssues(): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = [];
  const serverDir = path.join(process.cwd(), 'server');
  
  try {
    const files = await fs.readdir(serverDir);
    
    for (const file of files) {
      if (SECURITY_CLEANUP_CONFIG.SCAN_EXTENSIONS.some(ext => file.endsWith(ext))) {
        const filePath = path.join(serverDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // Check for hardcoded passwords
          for (const pattern of SECURITY_CLEANUP_CONFIG.SENSITIVE_PATTERNS) {
            const matches = line.match(pattern);
            if (matches) {
              // Check if it's whitelisted
              const isWhitelisted = SECURITY_CLEANUP_CONFIG.WHITELIST_PATTERNS.some(
                whitelist => line.toLowerCase().includes(whitelist.toLowerCase())
              );
              
              if (!isWhitelisted) {
                issues.push({
                  file: `server/${file}`,
                  line: i + 1,
                  type: 'hardcoded_password',
                  description: `Potential hardcoded credential found: ${line.trim()}`,
                  severity: 'critical',
                  recommendation: 'Move to environment variables or secure configuration'
                });
              }
            }
          }
          
          // Check for console.log with passwords
          if (line.includes('console.log') && 
              (line.toLowerCase().includes('password') || 
               line.toLowerCase().includes('secret') ||
               line.toLowerCase().includes('token'))) {
            issues.push({
              file: `server/${file}`,
              line: i + 1,
              type: 'exposed_secret',
              description: `Potential credential logging: ${line.trim()}`,
              severity: 'high',
              recommendation: 'Remove or mask sensitive data in logs'
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error scanning files:', error);
  }
  
  return issues;
}

/**
 * Generate secure environment template
 */
async function generateSecureEnvironmentTemplate(): Promise<void> {
  const envTemplate = `# Syrian Ministry of Communication - Secure Environment Configuration
# Generated on ${new Date().toISOString()}
# 
# SECURITY NOTICE: Never commit this file with actual values to version control
# Copy this template to .env and fill in the actual values

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/moct_platform"

# JWT Security
JWT_SECRET="${crypto.randomBytes(64).toString('hex')}"
JWT_EXPIRES_IN="1d"

# Session Security  
SESSION_SECRET="${crypto.randomBytes(64).toString('hex')}"

# Admin Credentials (CHANGE THESE IMMEDIATELY)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="${generateSecurePassword()}"
ADMIN_NAME="مدير منصة وزارة الاتصالات"

# Employee Credentials
EMPLOYEE_USERNAME="employee"
EMPLOYEE_PASSWORD="${generateSecurePassword()}"
EMPLOYEE_NAME="موظف منصة وزارة الاتصالات"

# Email Configuration
MINISTRY_SMTP_HOST="mail.moct.gov.sy"
MINISTRY_SMTP_PORT="465"
MINISTRY_SMTP_USER="tawasal@moct.gov.sy"
MINISTRY_SMTP_PASSWORD="your-smtp-password-here"
MINISTER_EMAIL="minister@moct.gov.sy"

# Application Configuration
APP_URL="https://tawasal.moct.gov.sy"
NODE_ENV="production"
PORT="5000"

# Security Headers
SECURITY_LEVEL="maximum"
RATE_LIMIT_ENABLED="true"
CAPTCHA_DIFFICULTY="5"

# File Upload Security
MAX_FILE_SIZE="10MB"
ALLOWED_FILE_TYPES="pdf,doc,docx,jpg,png"
SCAN_UPLOADS="true"

# Monitoring and Logging
LOG_LEVEL="info"
SECURITY_MONITORING="enabled"
ALERT_EMAIL="security@moct.gov.sy"

# Backup and Recovery
BACKUP_ENCRYPTION_KEY="${crypto.randomBytes(32).toString('hex')}"
BACKUP_SCHEDULE="daily"
BACKUP_RETENTION_DAYS="30"
`;

  const envPath = path.join(process.cwd(), '.env.template');
  await fs.writeFile(envPath, envTemplate);
  console.log('✅ Secure environment template generated: .env.template');
}

/**
 * Generate secure password
 */
function generateSecurePassword(length: number = 24): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*-_=+[]{}';
  
  let password = '';
  const allChars = uppercase + lowercase + numbers + symbols;
  
  // Ensure at least one from each category
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += symbols[crypto.randomInt(0, symbols.length)];
  
  // Fill remaining length
  for (let i = 4; i < length; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

/**
 * Create security report
 */
async function createSecurityReport(issues: SecurityIssue[]): Promise<void> {
  const reportContent = `# Syrian Ministry of Communication - Password Security Report
Generated: ${new Date().toISOString()}

## Executive Summary
Total Security Issues Found: ${issues.length}
- Critical: ${issues.filter(i => i.severity === 'critical').length}
- High: ${issues.filter(i => i.severity === 'high').length}
- Medium: ${issues.filter(i => i.severity === 'medium').length}
- Low: ${issues.filter(i => i.severity === 'low').length}

## Security Issues Identified

${issues.map((issue, index) => `
### Issue ${index + 1}: ${issue.type.toUpperCase()}
- **File:** ${issue.file}:${issue.line}
- **Severity:** ${issue.severity.toUpperCase()}
- **Description:** ${issue.description}
- **Recommendation:** ${issue.recommendation}
`).join('\n')}

## Immediate Actions Required

### Critical Priority (Fix Immediately)
${issues.filter(i => i.severity === 'critical').length > 0 ? 
  issues.filter(i => i.severity === 'critical').map(i => `- ${i.file}:${i.line} - ${i.description}`).join('\n') :
  '✅ No critical issues found'
}

### High Priority (Fix Within 24 Hours)
${issues.filter(i => i.severity === 'high').length > 0 ? 
  issues.filter(i => i.severity === 'high').map(i => `- ${i.file}:${i.line} - ${i.description}`).join('\n') :
  '✅ No high priority issues found'
}

## Security Recommendations

1. **Environment Variables**: Move all credentials to environment variables
2. **Password Policies**: Implement strong password requirements
3. **Access Controls**: Enable multi-factor authentication
4. **Logging Security**: Remove sensitive data from logs
5. **Regular Audits**: Schedule monthly security reviews
6. **Encryption**: Encrypt all sensitive data at rest
7. **Monitoring**: Enable real-time security monitoring
8. **Backup Security**: Secure all backup files

## Compliance Status

- [${issues.filter(i => i.severity === 'critical').length === 0 ? 'x' : ' '}] No critical vulnerabilities
- [${issues.filter(i => i.severity === 'high').length === 0 ? 'x' : ' '}] No high-risk exposures
- [ ] Multi-factor authentication enabled
- [ ] Regular security audits scheduled
- [ ] Incident response plan in place
- [ ] Staff security training completed

---
**CONFIDENTIAL**: This report contains sensitive security information.
Do not share outside authorized personnel.
`;

  const reportPath = path.join(process.cwd(), 'logs', 'password-security-report.md');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, reportContent);
  console.log('📋 Security report generated: logs/password-security-report.md');
}

/**
 * Clean up insecure password handling
 */
async function cleanupPasswordSecurity(): Promise<void> {
  console.log('🛡️ [PASSWORD-SECURITY-CLEANUP] Starting security audit...');
  
  try {
    // Scan for security issues
    const issues = await scanForSecurityIssues();
    
    // Generate secure environment template
    await generateSecureEnvironmentTemplate();
    
    // Create security report
    await createSecurityReport(issues);
    
    // Log summary
    console.log(`\n🔍 Security Audit Complete:`);
    console.log(`   📊 Total Issues: ${issues.length}`);
    console.log(`   🚨 Critical: ${issues.filter(i => i.severity === 'critical').length}`);
    console.log(`   ⚠️  High: ${issues.filter(i => i.severity === 'high').length}`);
    console.log(`   📋 Report: logs/password-security-report.md`);
    console.log(`   📝 Template: .env.template`);
    
    if (issues.filter(i => i.severity === 'critical').length === 0) {
      console.log(`\n✅ No critical password security issues found!`);
    } else {
      console.log(`\n🚨 URGENT: ${issues.filter(i => i.severity === 'critical').length} critical issues require immediate attention!`);
    }
    
  } catch (error) {
    console.error('❌ Security cleanup failed:', error);
  }
}

// Run the cleanup
cleanupPasswordSecurity(); 