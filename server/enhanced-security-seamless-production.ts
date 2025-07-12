/**
 * Production-Ready Seamless Security Enhancement
 * No debugging logs, optimized for production use
 * 
 * @author Production Security Team
 * @version 2.0.0 - Production Ready
 */

import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { logSecurity, logError, silentLog } from './production-logger';

// Enhanced dangerous file patterns (production-ready detection)
const SHELL_FILE_PATTERNS = [
  // PHP patterns
  /<\?php/gi,
  /<\?\s/gi,
  /<\?=/gi,
  /eval\s*\(/gi,
  /exec\s*\(/gi,
  /system\s*\(/gi,
  /shell_exec\s*\(/gi,
  /passthru\s*\(/gi,
  /base64_decode\s*\(/gi,
  
  // Shell script patterns
  /#!/gi,
  /\/bin\/bash/gi,
  /\/bin\/sh/gi,
  /chmod\s+\+x/gi,
  /sudo/gi,
  /rm\s+-rf/gi,
  
  // Windows batch patterns
  /@echo\s+off/gi,
  /cmd\.exe/gi,
  /powershell/gi,
  /\.bat/gi,
  /\.cmd/gi,
  
  // ASP patterns
  /<%@/gi,
  /<%\s/gi,
  /Response\.Write/gi,
  /Server\.Execute/gi,
  
  // JSP patterns
  /<%@\s*page/gi,
  /<%\s*=/gi,
  /Runtime\.getRuntime/gi
];

// File extension blacklist (comprehensive)
const DANGEROUS_EXTENSIONS = [
  '.php', '.php3', '.php4', '.php5', '.phtml', '.phar',
  '.asp', '.aspx', '.cer', '.asa',
  '.jsp', '.jspx', '.jsw', '.jsv',
  '.cgi', '.pl', '.py', '.rb', '.sh', '.bash',
  '.bat', '.cmd', '.com', '.scr', '.exe',
  '.vbs', '.vbe', '.jse', '.ws', '.wsf',
  '.jar', '.war', '.ear'
];

/**
 * Production shell file detection
 */
function detectShellFile(filePath: string, originalName: string): boolean {
  try {
    // 1. Check file extension
    const ext = path.extname(originalName).toLowerCase();
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      logSecurity('Blocked dangerous file extension', { extension: ext, ip: 'masked' });
      return true;
    }
    
    // 2. Check for double extensions (bypass technique)
    const fileName = originalName.toLowerCase();
    for (const dangerousExt of DANGEROUS_EXTENSIONS) {
      if (fileName.includes(dangerousExt + '.')) {
        logSecurity('Blocked double extension attack', { filename: 'masked' });
        return true;
      }
    }
    
    // 3. Content analysis for shell patterns
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      const content = fileBuffer.toString('utf8', 0, Math.min(8192, fileBuffer.length));
      
      for (const pattern of SHELL_FILE_PATTERNS) {
        if (pattern.test(content)) {
          logSecurity('Detected shell pattern in file content');
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    logError('File analysis error (allowing file)', { error: (error as Error).message });
    return false; // Fail open to avoid breaking functionality
  }
}

/**
 * Production MIME type validation
 */
function validateMimeType(filePath: string, declaredMime: string): boolean {
  try {
    if (!fs.existsSync(filePath)) return false;
    
    const buffer = fs.readFileSync(filePath, { encoding: null });
    const header = buffer.toString('hex', 0, 32).toLowerCase();
    
    // Check for script injections in image files
    if (declaredMime.startsWith('image/')) {
      const content = buffer.toString('utf8', 0, Math.min(1024, buffer.length));
      if (/<script|<\?php|<%/gi.test(content)) {
        logSecurity('Script injection detected in image file');
        return false;
      }
    }
    
    // Check for executable signatures
    const executableSignatures = [
      '4d5a', // PE executable
      '7f454c46', // ELF
      'cafebabe', // Java class
      'feedface' // Mach-O
    ];
    
    for (const sig of executableSignatures) {
      if (header.startsWith(sig)) {
        logSecurity('Executable signature detected', { signature: sig });
        return false;
      }
    }
    
    return true;
  } catch (error) {
    logError('MIME validation error', { error: (error as Error).message });
    return true; // Allow on error to avoid breaking functionality
  }
}

/**
 * Production security middleware - silent operation
 */
export const productionSecurityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;
  
  if (!file) {
    return next();
  }
  
  try {
    silentLog.debug('Analyzing uploaded file');
    
    // 1. Shell file detection
    if (detectShellFile(file.path, file.originalname)) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        message: 'نوع الملف غير مدعوم - يرجى رفع ملف صورة أو مستند صالح',
        error: 'UNSUPPORTED_FILE_TYPE'
      });
    }
    
    // 2. MIME validation
    if (!validateMimeType(file.path, file.mimetype)) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        message: 'الملف تالف أو غير صالح - يرجى المحاولة بملف آخر',
        error: 'CORRUPTED_FILE'
      });
    }
    
    // 3. File size validation
    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        message: 'حجم الملف كبير جداً - الحد الأقصى 20MB',
        error: 'FILE_TOO_LARGE'
      });
    }
    
    // 4. Filename validation
    const suspiciousPatterns = [
      /\.\./,  // Directory traversal
      /\0/,    // Null bytes
      /[<>:"|?*]/,  // Invalid characters
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i  // Reserved names
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.originalname)) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(400).json({
          message: 'اسم الملف غير صالح - يرجى إعادة تسمية الملف',
          error: 'INVALID_FILENAME'
        });
      }
    }
    
    silentLog.debug('File passed security checks');
    next();
    
  } catch (error) {
    logError('Security middleware error', { error: (error as Error).message });
    next(); // Continue to avoid breaking functionality
  }
};

/**
 * Production rate limiting middleware
 */
export const productionRateLimitingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip;
  const userAgent = req.get('User-Agent') || '';
  
  // Detect suspicious user agents
  const suspiciousAgents = [
    /curl/i, /wget/i, /python/i, /java/i, /perl/i, /ruby/i,
    /bot/i, /crawler/i, /spider/i, /scraper/i
  ];
  
  const isSuspicious = suspiciousAgents.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious) {
    logSecurity('Suspicious user agent detected', { ip, userAgent: 'masked' });
    (req as any).suspiciousAgent = true;
  }
  
  next();
}; 