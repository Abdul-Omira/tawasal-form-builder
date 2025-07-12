/**
 * Syrian Ministry of Communication - Military-Grade Password Security
 * Additional Password Protection and Security Hardening
 * 
 * @author Security Team - Emergency Response
 * @version 1.0.0 - Maximum Security Implementation
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

// Password security configuration
const PASSWORD_SECURITY_CONFIG = {
  // Account lockout settings
  MAX_FAILED_ATTEMPTS: 3,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  PROGRESSIVE_LOCKOUT: true,
  
  // Session security
  SESSION_TIMEOUT: 60 * 60 * 1000, // 1 hour
  FORCE_LOGOUT_ON_SUSPICIOUS: true,
  
  // Password policy
  MIN_PASSWORD_LENGTH: 16,
  REQUIRE_COMPLEX_PASSWORD: true,
  PASSWORD_HISTORY_SIZE: 10,
  
  // Security monitoring
  LOG_ALL_AUTH_ATTEMPTS: true,
  ALERT_ON_SUSPICIOUS_ACTIVITY: true,
  REAL_TIME_MONITORING: true
};

// Account lockout tracking
interface AccountLockout {
  username: string;
  failedAttempts: number;
  lockedUntil?: Date;
  lastAttempt: Date;
  ipAddresses: string[];
  suspiciousPatterns: string[];
}

// Session tracking for security
interface SecureSession {
  userId: number;
  username: string;
  ipAddress: string;
  userAgent: string;
  loginTime: Date;
  lastActivity: Date;
  deviceFingerprint: string;
  isSecure: boolean;
  riskScore: number;
}

// In-memory stores (use Redis in production)
const accountLockouts = new Map<string, AccountLockout>();
const activeSessions = new Map<string, SecureSession>();
const suspiciousActivities = new Map<string, number>();

/**
 * Enhanced password validation with entropy checking
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length >= 16) score += 25;
  else if (password.length >= 12) score += 15;
  else if (password.length >= 8) score += 5;
  else feedback.push('كلمة المرور قصيرة جداً - يجب أن تكون 16 حرف على الأقل');
  
  // Character variety
  if (/[a-z]/.test(password)) score += 10;
  else feedback.push('تحتاج إلى أحرف صغيرة');
  
  if (/[A-Z]/.test(password)) score += 10;
  else feedback.push('تحتاج إلى أحرف كبيرة');
  
  if (/\d/.test(password)) score += 10;
  else feedback.push('تحتاج إلى أرقام');
  
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;
  else feedback.push('تحتاج إلى رموز خاصة');
  
  // Pattern checking
  if (!/(.)\1{2,}/.test(password)) score += 10; // No repeated characters
  else feedback.push('تجنب تكرار الأحرف');
  
  if (!/123|abc|qwe|password|admin/.test(password.toLowerCase())) score += 10;
  else feedback.push('تجنب الكلمات الشائعة والأنماط المتوقعة');
  
  // Entropy calculation
  const entropy = calculatePasswordEntropy(password);
  if (entropy >= 80) score += 10;
  else if (entropy >= 60) score += 5;
  
  return {
    isValid: score >= 75,
    score,
    feedback
  };
}

/**
 * Calculate password entropy
 */
function calculatePasswordEntropy(password: string): number {
  const charset = new Set(password).size;
  const length = password.length;
  return Math.log2(Math.pow(charset, length));
}

/**
 * Generate cryptographically secure random password
 */
export function generateSecurePassword(length: number = 20): string {
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
 * Account lockout protection
 */
export function checkAccountLockout(username: string, ipAddress: string): {
  isLocked: boolean;
  remainingTime?: number;
  failedAttempts: number;
} {
  const lockout = accountLockouts.get(username);
  
  if (!lockout) {
    return { isLocked: false, failedAttempts: 0 };
  }
  
  // Check if lockout has expired
  if (lockout.lockedUntil && new Date() > lockout.lockedUntil) {
    accountLockouts.delete(username);
    return { isLocked: false, failedAttempts: 0 };
  }
  
  // Check if currently locked
  if (lockout.lockedUntil && new Date() <= lockout.lockedUntil) {
    const remainingTime = Math.ceil((lockout.lockedUntil.getTime() - Date.now()) / 1000);
    return { 
      isLocked: true, 
      remainingTime,
      failedAttempts: lockout.failedAttempts 
    };
  }
  
  return { 
    isLocked: false, 
    failedAttempts: lockout.failedAttempts 
  };
}

/**
 * Record failed login attempt
 */
export function recordFailedAttempt(username: string, ipAddress: string, reason: string): void {
  let lockout = accountLockouts.get(username);
  
  if (!lockout) {
    lockout = {
      username,
      failedAttempts: 0,
      lastAttempt: new Date(),
      ipAddresses: [],
      suspiciousPatterns: []
    };
  }
  
  lockout.failedAttempts++;
  lockout.lastAttempt = new Date();
  
  if (!lockout.ipAddresses.includes(ipAddress)) {
    lockout.ipAddresses.push(ipAddress);
  }
  
  if (!lockout.suspiciousPatterns.includes(reason)) {
    lockout.suspiciousPatterns.push(reason);
  }
  
  // Progressive lockout
  if (lockout.failedAttempts >= PASSWORD_SECURITY_CONFIG.MAX_FAILED_ATTEMPTS) {
    const lockoutMultiplier = Math.min(lockout.failedAttempts - 2, 8); // Max 8x
    const lockoutDuration = PASSWORD_SECURITY_CONFIG.LOCKOUT_DURATION * lockoutMultiplier;
    lockout.lockedUntil = new Date(Date.now() + lockoutDuration);
    
    console.log(`🔒 [PASSWORD-SECURITY] Account ${username} locked for ${lockoutDuration / 60000} minutes (attempt ${lockout.failedAttempts})`);
  }
  
  accountLockouts.set(username, lockout);
  
  // Log security event
  logSecurityEvent('FAILED_LOGIN_ATTEMPT', {
    username,
    ipAddress,
    reason,
    failedAttempts: lockout.failedAttempts,
    timestamp: new Date().toISOString()
  });
}

/**
 * Clear failed attempts on successful login
 */
export function clearFailedAttempts(username: string): void {
  accountLockouts.delete(username);
}

/**
 * Advanced session security
 */
export function createSecureSession(user: any, req: Request): string {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const deviceFingerprint = generateDeviceFingerprint(req);
  
  const session: SecureSession = {
    userId: user.id,
    username: user.username,
    ipAddress: req.ip || 'unknown',
    userAgent: req.get('user-agent') || 'unknown',
    loginTime: new Date(),
    lastActivity: new Date(),
    deviceFingerprint,
    isSecure: true,
    riskScore: 0
  };
  
  activeSessions.set(sessionId, session);
  
  // Auto-expire session
  setTimeout(() => {
    activeSessions.delete(sessionId);
  }, PASSWORD_SECURITY_CONFIG.SESSION_TIMEOUT);
  
  return sessionId;
}

/**
 * Generate device fingerprint for session tracking
 */
function generateDeviceFingerprint(req: Request): string {
  const components = [
    req.get('user-agent') || '',
    req.get('accept-language') || '',
    req.get('accept-encoding') || '',
    req.ip || ''
  ];
  
  return crypto.createHash('sha256')
    .update(components.join('|'))
    .digest('hex');
}

/**
 * Validate session security
 */
export function validateSessionSecurity(sessionId: string, req: Request): {
  isValid: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  shouldTerminate: boolean;
} {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return { isValid: false, riskLevel: 'critical', shouldTerminate: true };
  }
  
  // Check session timeout
  const timeSinceActivity = Date.now() - session.lastActivity.getTime();
  if (timeSinceActivity > PASSWORD_SECURITY_CONFIG.SESSION_TIMEOUT) {
    activeSessions.delete(sessionId);
    return { isValid: false, riskLevel: 'medium', shouldTerminate: true };
  }
  
  // Check IP consistency
  const currentIP = req.ip || 'unknown';
  if (session.ipAddress !== currentIP) {
    session.riskScore += 30;
    console.log(`⚠️ [SESSION-SECURITY] IP change detected for ${session.username}: ${session.ipAddress} -> ${currentIP}`);
  }
  
  // Check device fingerprint
  const currentFingerprint = generateDeviceFingerprint(req);
  if (session.deviceFingerprint !== currentFingerprint) {
    session.riskScore += 40;
    console.log(`⚠️ [SESSION-SECURITY] Device fingerprint change for ${session.username}`);
  }
  
  // Update activity
  session.lastActivity = new Date();
  
  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (session.riskScore >= 70) riskLevel = 'critical';
  else if (session.riskScore >= 50) riskLevel = 'high';
  else if (session.riskScore >= 30) riskLevel = 'medium';
  
  // Terminate high-risk sessions
  const shouldTerminate = riskLevel === 'critical' || 
    (riskLevel === 'high' && PASSWORD_SECURITY_CONFIG.FORCE_LOGOUT_ON_SUSPICIOUS);
  
  if (shouldTerminate) {
    activeSessions.delete(sessionId);
    logSecurityEvent('SUSPICIOUS_SESSION_TERMINATED', {
      username: session.username,
      sessionId,
      riskScore: session.riskScore,
      riskLevel,
      timestamp: new Date().toISOString()
    });
  }
  
  return { isValid: !shouldTerminate, riskLevel, shouldTerminate };
}

/**
 * Log security events
 */
async function logSecurityEvent(eventType: string, data: any): Promise<void> {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    data,
    severity: getSeverityLevel(eventType)
  };
  
  // Log to console for immediate monitoring
  console.log(`🛡️ [PASSWORD-SECURITY] ${eventType}:`, JSON.stringify(data));
  
  // Write to security log file
  try {
    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, `password-security-${new Date().toISOString().split('T')[0]}.log`);
    
    await fs.mkdir(logDir, { recursive: true });
    await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('Failed to write security log:', error);
  }
}

/**
 * Get event severity level
 */
function getSeverityLevel(eventType: string): 'info' | 'warning' | 'error' | 'critical' {
  const criticalEvents = ['SUSPICIOUS_SESSION_TERMINATED', 'ACCOUNT_LOCKED', 'BRUTE_FORCE_DETECTED'];
  const errorEvents = ['FAILED_LOGIN_ATTEMPT', 'SESSION_HIJACK_ATTEMPT'];
  const warningEvents = ['IP_CHANGE_DETECTED', 'DEVICE_CHANGE_DETECTED'];
  
  if (criticalEvents.includes(eventType)) return 'critical';
  if (errorEvents.includes(eventType)) return 'error';
  if (warningEvents.includes(eventType)) return 'warning';
  return 'info';
}

/**
 * Real-time password security monitoring
 */
export function startPasswordSecurityMonitoring(): void {
  // Monitor suspicious activities every minute
  setInterval(() => {
    // Check for brute force patterns
    accountLockouts.forEach((lockout, username) => {
      if (lockout.failedAttempts >= 5 && lockout.ipAddresses.length > 1) {
        console.log(`🚨 [PASSWORD-SECURITY] Potential distributed brute force on ${username}`);
      }
    });
    
    // Monitor active sessions for anomalies
    activeSessions.forEach((session, sessionId) => {
      if (session.riskScore > 50) {
        console.log(`⚠️ [PASSWORD-SECURITY] High-risk session detected: ${session.username} (score: ${session.riskScore})`);
      }
    });
  }, 60000); // Every minute
  
  console.log('🛡️ [PASSWORD-SECURITY] Real-time monitoring started');
}

/**
 * Middleware for enhanced login security
 */
export const enhancedLoginSecurity = (req: Request, res: Response, next: NextFunction) => {
  const username = req.body.username;
  const ipAddress = req.ip || 'unknown';
  
  if (!username) {
    return next();
  }
  
  // Check account lockout
  const lockoutStatus = checkAccountLockout(username, ipAddress);
  
  if (lockoutStatus.isLocked) {
    const minutes = Math.ceil((lockoutStatus.remainingTime || 0) / 60);
    return res.status(423).json({
      message: `تم حظر الحساب مؤقتاً بسبب محاولات دخول فاشلة متعددة. المحاولة مرة أخرى خلال ${minutes} دقيقة`,
      error: 'ACCOUNT_LOCKED',
      remainingTime: lockoutStatus.remainingTime,
      failedAttempts: lockoutStatus.failedAttempts
    });
  }
  
  // Add lockout info to request for later use
  (req as any).lockoutStatus = lockoutStatus;
  
  next();
};

/**
 * Password change security validation
 */
export const securePasswordChange = async (req: Request, res: Response, next: NextFunction) => {
  const { newPassword, currentPassword } = req.body;
  
  if (!newPassword || !currentPassword) {
    return next();
  }
  
  // Validate new password strength
  const validation = validatePasswordStrength(newPassword);
  
  if (!validation.isValid) {
    return res.status(400).json({
      message: 'كلمة المرور الجديدة لا تلبي متطلبات الأمان',
      error: 'WEAK_PASSWORD',
      feedback: validation.feedback,
      score: validation.score
    });
  }
  
  next();
};

// Export all security functions
export default {
  validatePasswordStrength,
  generateSecurePassword,
  checkAccountLockout,
  recordFailedAttempt,
  clearFailedAttempts,
  createSecureSession,
  validateSessionSecurity,
  enhancedLoginSecurity,
  securePasswordChange,
  startPasswordSecurityMonitoring
}; 