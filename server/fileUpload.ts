import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import { v4 as uuidv4 } from 'uuid';
import sanitize from 'sanitize-filename';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define allowed file types and size limits
const ALLOWED_FILE_TYPES = new Map([
  ['image/jpeg', { extensions: ['.jpg', '.jpeg'], maxSize: 5 * 1024 * 1024 }],
  ['image/png', { extensions: ['.png'], maxSize: 5 * 1024 * 1024 }],
  ['image/gif', { extensions: ['.gif'], maxSize: 5 * 1024 * 1024 }],
  ['application/pdf', { extensions: ['.pdf'], maxSize: 10 * 1024 * 1024 }],
  ['application/msword', { extensions: ['.doc'], maxSize: 10 * 1024 * 1024 }],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', { extensions: ['.docx'], maxSize: 10 * 1024 * 1024 }],
  ['application/vnd.ms-powerpoint', { extensions: ['.ppt'], maxSize: 10 * 1024 * 1024 }],
  ['application/vnd.openxmlformats-officedocument.presentationml.presentation', { extensions: ['.pptx'], maxSize: 10 * 1024 * 1024 }],
  ['text/plain', { extensions: ['.txt'], maxSize: 2 * 1024 * 1024 }]
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB maximum
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.js', '.php', '.jsp', '.asp', '.aspx',
  '.scr', '.com', '.pif', '.vbs', '.jar', '.zip', '.rar', '.7z'
];

// MIME type validation patterns
const SCRIPT_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /eval\s*\(/gi,
  /document\.write/gi,
  /window\.location/gi
];

// Secure filename generation
const generateSecureFilename = (originalName: string): string => {
  const sanitizedName = sanitize(originalName);
  const uuid = uuidv4();
  const timestamp = Date.now();
  const ext = path.extname(sanitizedName).toLowerCase();
  
  // Use UUID + timestamp for uniqueness, ignore original name for security
  return `${uuid}_${timestamp}${ext}`;
};

// Configure multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const secureFilename = generateSecureFilename(file.originalname);
    cb(null, secureFilename);
  }
});

// Enhanced file validation function
const validateFileType = (file: Express.Multer.File): { valid: boolean; error?: string } => {
  const fileTypeConfig = ALLOWED_FILE_TYPES.get(file.mimetype);
  
  if (!fileTypeConfig) {
    return { valid: false, error: 'نوع الملف غير مسموح به' };
  }
  
  // Check file extension
  const fileExt = path.extname(file.originalname).toLowerCase();
  if (!fileTypeConfig.extensions.includes(fileExt)) {
    return { valid: false, error: 'امتداد الملف غير صحيح' };
  }
  
  // Check for dangerous extensions
  if (DANGEROUS_EXTENSIONS.includes(fileExt)) {
    return { valid: false, error: 'امتداد الملف خطير' };
  }
  
  // Check file size for specific type
  if (file.size > fileTypeConfig.maxSize) {
    return { valid: false, error: 'حجم الملف كبير جداً' };
  }
  
  return { valid: true };
};

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const validation = validateFileType(file);
    if (validation.valid) {
      cb(null, true);
    } else {
      cb(new Error(validation.error || 'نوع الملف غير مسموح به'));
    }
  }
});

// Middleware for file upload
export const uploadMiddleware = upload.single('attachment');

// Advanced MIME type detection using file headers
const validateMimeType = async (filePath: string, declaredMimeType: string): Promise<boolean> => {
  try {
    const buffer = fs.readFileSync(filePath);
    const fileType = await fileTypeFromBuffer(buffer);
    
    if (!fileType) {
      // For text files, this might be normal
      return declaredMimeType === 'text/plain';
    }
    
    // Check if detected MIME type matches declared type
    return fileType.mime === declaredMimeType;
  } catch (error) {
    console.error('MIME type validation error:', error);
    return false;
  }
};

// Content scanning for malicious patterns
const scanFileContent = (filePath: string, mimeType: string): boolean => {
  try {
    // Only scan text-based files
    if (!mimeType.includes('text/') && !mimeType.includes('application/')) {
      return true; // Skip binary files
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for script patterns
    for (const pattern of SCRIPT_PATTERNS) {
      if (pattern.test(content)) {
        console.log('Malicious pattern detected:', pattern);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Content scanning error:', error);
    return false;
  }
};

// Comprehensive security scanning middleware
export const securityScanMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;
  
  if (!file) {
    return next();
  }
  
  try {
    // 1. Validate MIME type using file headers
    const mimeValid = await validateMimeType(file.path, file.mimetype);
    if (!mimeValid) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ 
        message: 'نوع الملف الحقيقي لا يطابق النوع المعلن',
        error: 'MIME_TYPE_MISMATCH'
      });
    }
    
    // 2. Check file extension security
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (DANGEROUS_EXTENSIONS.includes(fileExt)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ 
        message: 'امتداد الملف خطير وغير مسموح',
        error: 'DANGEROUS_EXTENSION'
      });
    }
    
    // 3. Scan file content for malicious patterns
    if (!scanFileContent(file.path, file.mimetype)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ 
        message: 'تم اكتشاف محتوى خطير في الملف',
        error: 'MALICIOUS_CONTENT'
      });
    }
    
    // 4. Additional size validation
    const stats = fs.statSync(file.path);
    if (stats.size !== file.size) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ 
        message: 'حجم الملف غير متطابق',
        error: 'SIZE_MISMATCH'
      });
    }
    
    // File passed all security checks
    next();
    
  } catch (error) {
    console.error('Security scan error:', error);
    
    // Clean up file on error
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    res.status(500).json({ 
      message: 'خطأ في فحص أمان الملف',
      error: 'SECURITY_SCAN_ERROR'
    });
  }
};

// Handler for file upload with enhanced response
export const handleFileUpload = (req: Request, res: Response) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ 
        message: 'لم يتم تحميل أي ملف',
        error: 'NO_FILE_UPLOADED'
      });
    }
    
    // Log successful upload for audit
    console.log(`File uploaded successfully: ${file.originalname} -> ${file.filename}`);
    
    // Return secure file information for client
    res.status(200).json({
      message: 'تم تحميل الملف بنجاح وفحصه أمنياً',
      file: {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: `/api/files/${file.filename}`, // Serve through secure endpoint
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ 
      message: 'حدث خطأ أثناء تحميل الملف',
      error: 'UPLOAD_ERROR'
    });
  }
};

// Secure file serving endpoint
export const serveFile = (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    
    // Validate filename format (UUID-based)
    const filenamePattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}_\d+\.[a-z0-9]+$/i;
    if (!filenamePattern.test(filename)) {
      return res.status(400).json({ message: 'اسم الملف غير صحيح' });
    }
    
    const filePath = path.join(uploadDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'الملف غير موجود' });
    }
    
    // Get file stats for security headers
    const stats = fs.statSync(filePath);
    const fileExt = path.extname(filename).toLowerCase();
    
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    
    // Set appropriate content type based on extension
    let contentType = 'application/octet-stream';
    if (fileExt === '.pdf') {
      contentType = 'application/pdf';
    } else if (['.jpg', '.jpeg'].includes(fileExt)) {
      contentType = 'image/jpeg';
    } else if (fileExt === '.png') {
      contentType = 'image/png';
    } else if (fileExt === '.gif') {
      contentType = 'image/gif';
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${sanitize(filename)}"`);
    
    // Stream file securely
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ message: 'خطأ في تحميل الملف' });
  }
};