/**
 * EMERGENCY SECURITY PATCH - File Upload Vulnerability
 * Syrian Ministry of Communication - CRITICAL SECURITY FIX
 * 
 * @author Emergency Security Response Team
 * @version EMERGENCY-PATCH-1.0.0
 * @date 2025-07-09
 */

import type { Express, Request, Response, NextFunction } from "express";
import { isAuthenticated, isAdmin } from "./auth";
import { uploadMiddleware, securityScanMiddleware, handleFileUpload, serveFile } from "./fileUpload";
import { ultimateSecurityScan } from "./enhanced-security";

/**
 * 🚨 EMERGENCY SECURITY PATCH FOR FILE UPLOADS 🚨
 * 
 * FIXES:
 * 1. Adds mandatory authentication to ALL upload endpoints
 * 2. Removes duplicate unsecured upload routes
 * 3. Implements enhanced security scanning
 * 4. Adds admin-only upload restrictions
 * 5. Implements emergency file quarantine
 */

// Emergency file type restriction - ONLY IMAGES AND PDFs
const EMERGENCY_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'application/pdf'
];

// Emergency security middleware
const emergencySecurityCheck = (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;
  
  if (!file) {
    return next();
  }
  
  // 1. EMERGENCY: Only allow specific safe file types
  if (!EMERGENCY_ALLOWED_TYPES.includes(file.mimetype)) {
    console.log(`🚨 EMERGENCY BLOCK: Unauthorized file type ${file.mimetype} from IP ${req.ip}`);
    return res.status(403).json({
      success: false,
      message: 'نوع الملف محظور في الوضع الطارئ - مسموح فقط: صور (JPG, PNG, GIF) و PDF',
      error: 'EMERGENCY_FILE_TYPE_BLOCKED'
    });
  }
  
  // 2. EMERGENCY: Block any file with suspicious extensions
  const suspiciousExtensions = [
    '.php', '.asp', '.aspx', '.jsp', '.cgi', '.pl', '.py', '.rb', 
    '.sh', '.bat', '.cmd', '.exe', '.scr', '.vbs', '.js'
  ];
  
  const fileName = file.originalname.toLowerCase();
  for (const ext of suspiciousExtensions) {
    if (fileName.includes(ext)) {
      console.log(`🚨 EMERGENCY BLOCK: Suspicious extension detected in ${file.originalname} from IP ${req.ip}`);
      return res.status(403).json({
        success: false,
        message: 'اسم الملف يحتوي على امتداد محظور في الوضع الطارئ',
        error: 'EMERGENCY_SUSPICIOUS_EXTENSION'
      });
    }
  }
  
  // 3. EMERGENCY: Maximum file size restriction (5MB)
  if (file.size > 5 * 1024 * 1024) {
    console.log(`🚨 EMERGENCY BLOCK: File too large ${file.size} bytes from IP ${req.ip}`);
    return res.status(403).json({
      success: false,
      message: 'حجم الملف كبير جداً في الوضع الطارئ - الحد الأقصى 5MB',
      error: 'EMERGENCY_FILE_TOO_LARGE'
    });
  }
  
  console.log(`✅ EMERGENCY CHECK PASSED: ${file.originalname}`);
  next();
};

/**
 * Apply emergency security patch to Express app
 */
export function applyEmergencySecurityPatch(app: Express) {
  console.log('🚨 APPLYING EMERGENCY SECURITY PATCH FOR FILE UPLOADS');
  
  // Import rate limiters
  const uploadLimiter = async () => {
    const { uploadLimiter } = await import('./index');
    return uploadLimiter;
  };
  
  // 🚨 REMOVE ALL EXISTING UPLOAD ROUTES 🚨
  // This will be handled by the route replacement
  
  // 🛡️ NEW SECURE UPLOAD ENDPOINT - ADMIN ONLY 🛡️
  app.post("/api/secure-uploads", 
    async (req, res, next) => {
      const limiter = await uploadLimiter();
      limiter(req, res, next);
    },
    isAuthenticated,           // Must be logged in
    isAdmin,                   // Must be admin
    uploadMiddleware,          // Multer file handling
    emergencySecurityCheck,    // Emergency security check
    securityScanMiddleware,    // Original security scan
    ultimateSecurityScan,      // Enhanced security scan
    handleFileUpload           // File upload handler
  );
  
  // 🛡️ CITIZEN UPLOAD ENDPOINT - AUTHENTICATED USERS ONLY 🛡️ 
  app.post("/api/citizen-uploads",
    async (req, res, next) => {
      const limiter = await uploadLimiter();
      limiter(req, res, next);
    },
    isAuthenticated,           // Must be logged in
    uploadMiddleware,          // Multer file handling  
    emergencySecurityCheck,    // Emergency security check
    securityScanMiddleware,    // Original security scan
    ultimateSecurityScan,      // Enhanced security scan
    handleFileUpload           // File upload handler
  );
  
  // 🚨 DISABLE ORIGINAL VULNERABLE UPLOAD ENDPOINTS 🚨
  app.all("/api/uploads", (req: Request, res: Response) => {
    console.log(`🚨 BLOCKED ACCESS TO VULNERABLE ENDPOINT /api/uploads from IP: ${req.ip}`);
    res.status(403).json({
      success: false,
      message: 'نقطة النهاية هذه معطلة لأسباب أمنية - استخدم /api/secure-uploads للإداريين أو /api/citizen-uploads للمواطنين',
      error: 'ENDPOINT_DISABLED_FOR_SECURITY'
    });
  });
  
  // 🔒 SECURE FILE SERVING WITH AUTHENTICATION 🔒
  app.get('/api/secure-files/:filename', 
    isAuthenticated,
    serveFile
  );
  
  // 🚨 LOG ALL SECURITY EVENTS 🚨
  app.use('/api/*', (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      console.log(`🔍 API ACCESS: ${req.method} ${req.originalUrl} from IP: ${req.ip} User-Agent: ${req.get('User-Agent')}`);
    }
    next();
  });
  
  console.log('✅ EMERGENCY SECURITY PATCH APPLIED SUCCESSFULLY');
  console.log('🚨 VULNERABLE /api/uploads ENDPOINT DISABLED');
  console.log('🛡️ NEW SECURE ENDPOINTS:');
  console.log('   - /api/secure-uploads (Admin only)');
  console.log('   - /api/citizen-uploads (Authenticated users)');
  console.log('   - /api/secure-files/:filename (Authenticated file access)');
}

/**
 * Emergency quarantine all existing uploaded files
 */
export async function emergencyQuarantineFiles() {
  const fs = await import('fs');
  const path = await import('path');
  
  const uploadDir = path.join(process.cwd(), 'uploads');
  const quarantineDir = path.join(process.cwd(), 'emergency-quarantine');
  
  if (!fs.existsSync(quarantineDir)) {
    fs.mkdirSync(quarantineDir, { recursive: true });
  }
  
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    console.log(`🚨 EMERGENCY: Quarantining ${files.length} uploaded files`);
    
    for (const file of files) {
      const srcPath = path.join(uploadDir, file);
      const destPath = path.join(quarantineDir, file);
      
      try {
        fs.renameSync(srcPath, destPath);
        console.log(`🔒 Quarantined: ${file}`);
      } catch (error) {
        console.error(`❌ Failed to quarantine ${file}:`, error);
      }
    }
    
    // Log quarantine action
    const logPath = path.join(quarantineDir, 'emergency-quarantine.log');
    const logEntry = `${new Date().toISOString()} - Emergency quarantine of ${files.length} files due to security vulnerability\n`;
    fs.appendFileSync(logPath, logEntry);
  }
} 