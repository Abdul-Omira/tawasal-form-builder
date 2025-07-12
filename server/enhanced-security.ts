/**
 * Enhanced Security Layer for File Uploads
 * Specifically designed to prevent PHP backdoors, webshells, and malicious scripts
 * 
 * @author Security Enhancement for MOCT Platform
 * @version 2.0.0 - Enhanced Security
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// 🚨 COMPREHENSIVE PHP BACKDOOR DETECTION PATTERNS 🚨
const PHP_BACKDOOR_PATTERNS = [
  // Common PHP backdoor functions
  /eval\s*\(/gi,
  /exec\s*\(/gi,
  /system\s*\(/gi,
  /shell_exec\s*\(/gi,
  /passthru\s*\(/gi,
  /proc_open\s*\(/gi,
  /popen\s*\(/gi,
  /file_get_contents\s*\(/gi,
  /file_put_contents\s*\(/gi,
  /fwrite\s*\(/gi,
  /fputs\s*\(/gi,
  /fopen\s*\(/gi,
  /readfile\s*\(/gi,
  /include\s*\(/gi,
  /require\s*\(/gi,
  /include_once\s*\(/gi,
  /require_once\s*\(/gi,
  
  // Base64 decode patterns (common in backdoors)
  /base64_decode\s*\(/gi,
  /gzinflate\s*\(/gi,
  /str_rot13\s*\(/gi,
  /gzuncompress\s*\(/gi,
  /gzdecode\s*\(/gi,
  /bzdecompress\s*\(/gi,
  /convert_uudecode\s*\(/gi,
  
  // Common backdoor variable names
  /\$_GET\s*\[/gi,
  /\$_POST\s*\[/gi,
  /\$_REQUEST\s*\[/gi,
  /\$_COOKIE\s*\[/gi,
  /\$_SESSION\s*\[/gi,
  /\$_SERVER\s*\[/gi,
  /\$_FILES\s*\[/gi,
  /\$GLOBALS\s*\[/gi,
  
  // Webshell specific patterns
  /assert\s*\(/gi,
  /create_function\s*\(/gi,
  /call_user_func\s*\(/gi,
  /call_user_func_array\s*\(/gi,
  /array_map\s*\(/gi,
  /array_filter\s*\(/gi,
  /preg_replace\s*\(/gi,
  /preg_replace_callback\s*\(/gi,
  
  // Common webshell names and patterns
  /c99/gi,
  /r57/gi,
  /b374k/gi,
  /wso/gi,
  /webshell/gi,
  /backdoor/gi,
  /shell/gi,
  /cmd/gi,
  /phpshell/gi,
  /adminer/gi,
  /bypass/gi,
  
  // Suspicious PHP tags
  /<\?php/gi,
  /<\?\s/gi,
  /<\?=/gi,
  /<%/gi,
  /%>/gi,
  /<script\s+language\s*=\s*["']?php["']?/gi,
  
  // File operation patterns
  /move_uploaded_file\s*\(/gi,
  /copy\s*\(/gi,
  /rename\s*\(/gi,
  /unlink\s*\(/gi,
  /rmdir\s*\(/gi,
  /mkdir\s*\(/gi,
  /chmod\s*\(/gi,
  /chown\s*\(/gi,
  
  // Network operation patterns
  /fsockopen\s*\(/gi,
  /socket_create\s*\(/gi,
  /curl_exec\s*\(/gi,
  /wget/gi,
  /download/gi,
  
  // Obfuscation patterns
  /chr\s*\(/gi,
  /ord\s*\(/gi,
  /hex2bin\s*\(/gi,
  /bin2hex\s*\(/gi,
  /pack\s*\(/gi,
  /unpack\s*\(/gi
];

// 🚨 EXTENDED DANGEROUS EXTENSIONS 🚨
const ULTRA_DANGEROUS_EXTENSIONS = [
  // Web script extensions
  '.php', '.php3', '.php4', '.php5', '.php7', '.phtml', '.phps',
  '.asp', '.aspx', '.asa', '.asax', '.ascx', '.ashx', '.asmx',
  '.jsp', '.jspx', '.jsw', '.jsv', '.jspf',
  '.cfm', '.cfml', '.cfc', '.dbm',
  
  // Server-side includes
  '.shtml', '.shtm', '.stm', '.inc',
  
  // Script extensions
  '.js', '.vbs', '.vbe', '.jse', '.ws', '.wsf', '.wsc', '.wsh',
  '.ps1', '.ps2', '.psc1', '.psc2', '.psm1', '.psd1',
  '.pl', '.pm', '.t', '.pod',
  '.py', '.pyc', '.pyo', '.pyw', '.pyz',
  '.rb', '.rbw',
  '.tcl', '.tk',
  '.cgi', '.fcgi',
  
  // Executable extensions
  '.exe', '.scr', '.bat', '.cmd', '.com', '.pif',
  '.msi', '.msp', '.mst',
  '.dll', '.ocx', '.sys', '.drv',
  '.bin', '.run', '.app', '.deb', '.rpm', '.dmg', '.pkg',
  
  // Archive extensions that can contain malware
  '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz',
  '.cab', '.iso', '.img',
  
  // Database and backup files (can contain sensitive data)
  '.sql', '.db', '.sqlite', '.mdb', '.accdb',
  '.bak', '.backup', '.old', '.orig', '.tmp',
  
  // Configuration files
  '.ini', '.conf', '.config', '.cfg', '.properties',
  '.htaccess', '.htpasswd',
  
  // Other dangerous types
  '.jar', '.war', '.ear',
  '.gadget', '.workflow', '.action', '.command', '.tool'
];

// 🚨 WEBSHELL SIGNATURE DETECTION 🚨
const WEBSHELL_SIGNATURES = [
  // Common webshell hex signatures
  '3c3f706870', // <?php
  '3c3f20', // <? 
  '3c253d', // <%=
  '3c25', // <%
  '253e', // %>
  
  // Base64 encoded common backdoor strings
  'ZXZhbCg=', // eval(
  'c3lzdGVt', // system
  'ZXhlYyg=', // exec(
  'c2hlbGxfZXhlYyg=', // shell_exec(
  'cGFzc3RocnU=', // passthru
  'YmFzZTY0X2RlY29kZQ==', // base64_decode
  
  // Common backdoor variable names in hex
  '245f474554', // $_GET
  '245f504f5354', // $_POST
  '245f524551554553', // $_REQUEST
  '245f434f4f4b4945', // $_COOKIE
  '245f53455353494f4e', // $_SESSION
  '245f5345525645', // $_SERVER
  '245f46494c4553', // $_FILES
];

// 🚨 ADVANCED SCRIPT CONTENT ANALYSIS 🚨
export const detectPHPBackdoor = (filePath: string, content?: string): boolean => {
  try {
    const fileContent = content || fs.readFileSync(filePath, 'utf8');
    
    // Check for PHP backdoor patterns
    for (const pattern of PHP_BACKDOOR_PATTERNS) {
      if (pattern.test(fileContent)) {
        console.log(`🚨 PHP BACKDOOR PATTERN DETECTED: ${pattern}`);
        return true;
      }
    }
    
    // Check for suspicious function combinations
    const suspiciousCombinations = [
      ['eval', 'base64_decode'],
      ['system', '$_GET'],
      ['exec', '$_POST'],
      ['shell_exec', '$_REQUEST'],
      ['file_get_contents', 'php://input'],
      ['assert', '$_'],
      ['create_function', '$_']
    ];
    
    for (const combo of suspiciousCombinations) {
      const hasAll = combo.every(keyword => 
        new RegExp(keyword, 'gi').test(fileContent)
      );
      if (hasAll) {
        console.log(`🚨 SUSPICIOUS FUNCTION COMBINATION: ${combo.join(' + ')}`);
        return true;
      }
    }
    
    // Check for obfuscated code patterns
    const obfuscationPatterns = [
      /\$[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*['"]\w{20,}['"];.*eval/gi,
      /str_replace\s*\(\s*['"]\w['"],\s*['"]['"]\s*,.*\)/gi,
      /preg_replace\s*\(\s*['"][^'"]+['"],.*,.*\)/gi,
      /gzinflate\s*\(\s*base64_decode\s*\(/gi,
      /eval\s*\(\s*gzinflate\s*\(/gi,
      /eval\s*\(\s*str_rot13\s*\(/gi
    ];
    
    for (const pattern of obfuscationPatterns) {
      if (pattern.test(fileContent)) {
        console.log(`🚨 OBFUSCATED CODE DETECTED: ${pattern}`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('PHP backdoor detection error:', error);
    return true; // Err on the side of caution
  }
};

// 🚨 WEBSHELL SIGNATURE DETECTION 🚨
export const detectWebshellSignatures = (filePath: string): boolean => {
  try {
    const buffer = fs.readFileSync(filePath);
    const hexContent = buffer.toString('hex').toLowerCase();
    
    // Check for webshell signatures
    for (const signature of WEBSHELL_SIGNATURES) {
      if (hexContent.includes(signature.toLowerCase())) {
        console.log(`🚨 WEBSHELL SIGNATURE DETECTED: ${signature}`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Webshell signature detection error:', error);
    return true; // Err on the side of caution
  }
};

// 🚨 ENHANCED FILENAME VALIDATION 🚨
export const validateSecureFilename = (filename: string): { valid: boolean; error?: string } => {
  // Check for dangerous extensions
  const fileExt = path.extname(filename).toLowerCase();
  if (ULTRA_DANGEROUS_EXTENSIONS.includes(fileExt)) {
    return { 
      valid: false, 
      error: `امتداد الملف ${fileExt} محظور بشكل صارم لأسباب أمنية - هذا النوع يستخدم في الهجمات الإلكترونية` 
    };
  }
  
  // Check for double extensions (common in malware)
  const doubleExtPattern = /\.(php|asp|jsp|pl|py|rb|cgi)\.(jpg|png|gif|pdf|txt|doc|docx)$/gi;
  if (doubleExtPattern.test(filename)) {
    return { 
      valid: false, 
      error: 'اسم الملف يحتوي على امتداد مزدوج مشبوه - محاولة تنكر ملف خطير' 
    };
  }
  
  // Check for null bytes (directory traversal attempt)
  if (filename.includes('\0') || filename.includes('%00')) {
    return { 
      valid: false, 
      error: 'اسم الملف يحتوي على بايتات فارغة - محاولة اختراق' 
    };
  }
  
  // Check for directory traversal patterns
  const traversalPatterns = ['../', '..\\', '../', '..\\', './', '.\\'];
  for (const pattern of traversalPatterns) {
    if (filename.includes(pattern)) {
      return { 
        valid: false, 
        error: 'اسم الملف يحتوي على مسار مشبوه - محاولة الوصول لملفات النظام' 
      };
    }
  }
  
  // Check for suspicious keywords in filename
  const suspiciousKeywords = [
    'shell', 'backdoor', 'webshell', 'cmd', 'eval', 'exec',
    'bypass', 'exploit', 'payload', 'trojan', 'virus',
    'c99', 'r57', 'b374k', 'wso', 'adminer', 'phpshell'
  ];
  
  const lowerFilename = filename.toLowerCase();
  for (const keyword of suspiciousKeywords) {
    if (lowerFilename.includes(keyword)) {
      return { 
        valid: false, 
        error: `اسم الملف يحتوي على كلمة مشبوهة: ${keyword}` 
      };
    }
  }
  
  return { valid: true };
};

// 🚨 COMPREHENSIVE IMAGE STEGANOGRAPHY DETECTION 🚨
export const detectImageSteganography = (filePath: string, mimeType: string): boolean => {
  if (!mimeType.startsWith('image/')) {
    return false;
  }
  
  try {
    const buffer = fs.readFileSync(filePath);
    const hexContent = buffer.toString('hex').toLowerCase();
    
    // Check for embedded PHP code in images
    const phpInImagePatterns = [
      '3c3f706870', // <?php
      '3c3f20', // <? 
      '6576616c28', // eval(
      '73797374656d28', // system(
      '6578656328', // exec(
      '7368656c6c5f6578656328' // shell_exec(
    ];
    
    for (const pattern of phpInImagePatterns) {
      if (hexContent.includes(pattern)) {
        console.log(`🚨 PHP CODE EMBEDDED IN IMAGE: ${pattern}`);
        return true;
      }
    }
    
    // Check for suspicious text patterns in image metadata
    const textContent = buffer.toString('ascii');
    if (detectPHPBackdoor(filePath, textContent)) {
      console.log('🚨 PHP BACKDOOR IN IMAGE METADATA');
      return true;
    }
    
    // Check for high entropy at the end of file (appended data)
    const endBuffer = buffer.slice(-1024); // Last 1KB
    const entropy = calculateEntropy(endBuffer);
    if (entropy > 7.5) { // High entropy in image tail suggests appended data
      console.log(`🚨 HIGH ENTROPY IN IMAGE TAIL: ${entropy}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Image steganography detection error:', error);
    return true; // Err on the side of caution
  }
};

// Helper function to calculate entropy
const calculateEntropy = (buffer: Buffer): number => {
  const frequencies = new Array(256).fill(0);
  
  for (let i = 0; i < buffer.length; i++) {
    frequencies[buffer[i]]++;
  }
  
  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (frequencies[i] > 0) {
      const probability = frequencies[i] / buffer.length;
      entropy -= probability * Math.log2(probability);
    }
  }
  
  return entropy;
};

// 🚨 ULTIMATE SECURITY SCAN FUNCTION 🚨
export const ultimateSecurityScan = (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;
  
  if (!file) {
    return next();
  }
  
  try {
    console.log(`🔍 STARTING ULTIMATE SECURITY SCAN: ${file.originalname}`);
    
    // 1. Enhanced filename validation
    const filenameValidation = validateSecureFilename(file.originalname);
    if (!filenameValidation.valid) {
      console.log(`🚨 FILENAME SECURITY VIOLATION: ${filenameValidation.error}`);
      return res.status(400).json({ 
        success: false,
        message: filenameValidation.error,
        error: 'FILENAME_SECURITY_VIOLATION'
      });
    }
    
    // 2. Webshell signature detection
    if (detectWebshellSignatures(file.path)) {
      console.log('🚨 WEBSHELL SIGNATURES DETECTED');
      return res.status(400).json({ 
        success: false,
        message: 'تم اكتشاف توقيعات ويب شل في الملف - ملف خطير محظور',
        error: 'WEBSHELL_DETECTED'
      });
    }
    
    // 3. PHP backdoor detection (for all files, not just PHP)
    if (detectPHPBackdoor(file.path)) {
      console.log('🚨 PHP BACKDOOR CODE DETECTED');
      return res.status(400).json({ 
        success: false,
        message: 'تم اكتشاف كود PHP خطير في الملف - محاولة رفع باك دور',
        error: 'PHP_BACKDOOR_DETECTED'
      });
    }
    
    // 4. Image steganography detection
    if (detectImageSteganography(file.path, file.mimetype)) {
      console.log('🚨 STEGANOGRAPHY OR EMBEDDED CODE DETECTED');
      return res.status(400).json({ 
        success: false,
        message: 'تم اكتشاف كود مخفي أو مدمج في الملف',
        error: 'STEGANOGRAPHY_DETECTED'
      });
    }
    
    // 5. File size anomaly detection
    const stats = fs.statSync(file.path);
    if (file.mimetype.startsWith('image/')) {
      // Images shouldn't be too small (could be 1px tracking images) or too large
      if (stats.size < 100) {
        console.log('🚨 SUSPICIOUS TINY IMAGE FILE');
        return res.status(400).json({ 
          success: false,
          message: 'حجم ملف الصورة صغير جداً ومشبوه',
          error: 'SUSPICIOUS_FILE_SIZE'
        });
      }
    }
    
    // 6. Additional text-based file scanning
    if (file.mimetype.includes('text/') || 
        file.mimetype.includes('application/json') ||
        file.mimetype.includes('application/xml')) {
      
      const content = fs.readFileSync(file.path, 'utf8');
      
             // Check for script injections in text files
       const scriptInjectionPatterns = [
         /<script[^>]*>[\s\S]*?<\/script>/gi,
         /javascript\s*:/gi,
         /vbscript\s*:/gi,
         /data\s*:\s*text\/html/gi,
         /data\s*:\s*image\/svg\+xml/gi
       ];
      
      for (const pattern of scriptInjectionPatterns) {
        if (pattern.test(content)) {
          console.log(`🚨 SCRIPT INJECTION IN TEXT FILE: ${pattern}`);
          return res.status(400).json({ 
            success: false,
            message: 'تم اكتشاف حقن سكريبت في الملف النصي',
            error: 'SCRIPT_INJECTION_DETECTED'
          });
        }
      }
    }
    
    console.log(`✅ FILE PASSED ULTIMATE SECURITY SCAN: ${file.originalname}`);
    next();
    
  } catch (error) {
    console.error('Ultimate security scan error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'فشل في الفحص الأمني للملف - تم رفض الملف كإجراء احترازي',
      error: 'SECURITY_SCAN_ERROR'
    });
  }
};

// 🚨 SECURITY AUDIT LOG 🚨
export const logSecurityEvent = (eventType: string, details: any, req: Request) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    details,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    headers: req.headers
  };
  
  const logFile = path.join(process.cwd(), 'logs', 'security-audit.log');
  
  // Ensure logs directory exists
  const logsDir = path.dirname(logFile);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  console.log(`🔒 SECURITY EVENT LOGGED: ${eventType}`);
}; 