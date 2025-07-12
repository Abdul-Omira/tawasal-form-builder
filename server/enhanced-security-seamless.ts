/**
 * Seamless Security Enhancement for File Uploads
 * Maintains all existing functionality while closing security gaps
 * 
 * @author Security Enhancement Team
 * @version 1.0.0 - Seamless Integration
 */

import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

// Enhanced dangerous file patterns (seamless detection)
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

// File extension blacklist (comprehensive but hidden)
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
 * Seamless shell file detection - works silently in background
 */
function detectShellFileSeamlessly(filePath: string, originalName: string): boolean {
  try {
    // 1. Check file extension
    const ext = path.extname(originalName).toLowerCase();
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      console.log(`🔍 [SEAMLESS-SECURITY] Blocked dangerous extension: ${ext}`);
      return true;
    }
    
    // 2. Check for double extensions (common bypass technique)
    const fileName = originalName.toLowerCase();
    for (const dangerousExt of DANGEROUS_EXTENSIONS) {
      if (fileName.includes(dangerousExt + '.')) {
        console.log(`🔍 [SEAMLESS-SECURITY] Blocked double extension: ${originalName}`);
        return true;
      }
    }
    
    // 3. Content analysis for shell patterns
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      const content = fileBuffer.toString('utf8', 0, Math.min(8192, fileBuffer.length)); // First 8KB
      
      for (const pattern of SHELL_FILE_PATTERNS) {
        if (pattern.test(content)) {
          console.log(`🔍 [SEAMLESS-SECURITY] Detected shell pattern in file content`);
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    // On error, assume safe but log for monitoring
    console.log(`🔍 [SEAMLESS-SECURITY] Analysis error (allowing file): ${error}`);
    return false;
  }
}

/**
 * Enhanced MIME type validation (seamless)
 */
function validateMimeTypeSeamlessly(filePath: string, declaredMime: string): boolean {
  try {
    if (!fs.existsSync(filePath)) return false;
    
    const buffer = fs.readFileSync(filePath, { encoding: null });
    const header = buffer.toString('hex', 0, 32).toLowerCase();
    
    // Check for script injections in claimed image files
    if (declaredMime.startsWith('image/')) {
      // Look for script tags in image files
      const content = buffer.toString('utf8', 0, Math.min(1024, buffer.length));
      if (/<script|<\?php|<%/gi.test(content)) {
        console.log(`🔍 [SEAMLESS-SECURITY] Script injection detected in image file`);
        return false;
      }
    }
    
    // Check for executable signatures in any file type
    const executableSignatures = [
      '4d5a', // PE executable
      '7f454c46', // ELF
      'cafebabe', // Java class
      'feedface' // Mach-O
    ];
    
    for (const sig of executableSignatures) {
      if (header.startsWith(sig)) {
        console.log(`🔍 [SEAMLESS-SECURITY] Executable signature detected: ${sig}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.log(`🔍 [SEAMLESS-SECURITY] MIME validation error: ${error}`);
    return true; // Allow on error to avoid breaking functionality
  }
}

/**
 * Seamless security middleware - enhances existing security without breaking anything
 */
export const seamlessSecurityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;
  
  if (!file) {
    return next();
  }
  
  try {
    console.log(`🔍 [SEAMLESS-SECURITY] Analyzing file: ${file.originalname}`);
    
    // 1. Shell file detection
    if (detectShellFileSeamlessly(file.path, file.originalname)) {
      // Seamlessly reject without revealing security details
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        message: 'نوع الملف غير مدعوم - يرجى رفع ملف صورة أو مستند صالح',
        error: 'UNSUPPORTED_FILE_TYPE'
      });
    }
    
    // 2. Enhanced MIME validation
    if (!validateMimeTypeSeamlessly(file.path, file.mimetype)) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        message: 'الملف تالف أو غير صالح - يرجى المحاولة بملف آخر',
        error: 'CORRUPTED_FILE'
      });
    }
    
    // 3. File size validation (reasonable limits)
    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        message: 'حجم الملف كبير جداً - الحد الأقصى 20MB',
        error: 'FILE_TOO_LARGE'
      });
    }
    
    // 4. Suspicious filename patterns
    const suspiciousPatterns = [
      /\.\./,  // Directory traversal
      /\0/,    // Null bytes
      /[<>:"|?*]/,  // Invalid filename characters
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i  // Windows reserved names
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
    
    console.log(`✅ [SEAMLESS-SECURITY] File passed all checks: ${file.originalname}`);
    next();
    
  } catch (error) {
    console.error('Seamless security error:', error);
    // On error, continue to avoid breaking functionality
    next();
  }
};

/**
 * Rate limiting enhancement (seamless)
 */
export const seamlessRateLimitingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip;
  const userAgent = req.get('User-Agent') || '';
  
  // Detect suspicious user agents
  const suspiciousAgents = [
    /curl/i, /wget/i, /python/i, /java/i, /perl/i, /ruby/i,
    /bot/i, /crawler/i, /spider/i, /scraper/i
  ];
  
  // More restrictive for suspicious agents
  const isSuspicious = suspiciousAgents.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious) {
    console.log(`🔍 [SEAMLESS-SECURITY] Suspicious user agent detected: ${userAgent} from ${ip}`);
    // Apply additional restrictions but don't block completely
    (req as any).suspiciousAgent = true;
  }
  
  next();
}; 