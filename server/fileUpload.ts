import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define allowed file types and size limits
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Configure multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a secure random filename to prevent path traversal attacks
    const randomName = crypto.randomBytes(16).toString('hex');
    const fileExt = path.extname(file.originalname);
    cb(null, `${randomName}${fileExt}`);
  }
});

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    // Check if file type is allowed
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مسموح به'));
    }
  }
});

// Middleware for file upload
export const uploadMiddleware = upload.single('attachment');

// Security scanning middleware (basic implementation)
export const securityScanMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;
  
  if (!file) {
    // No file uploaded, continue
    return next();
  }
  
  // Check file extension for basic security
  const fileExt = path.extname(file.originalname).toLowerCase();
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.js', '.php', '.jsp', '.asp'];
  
  if (dangerousExtensions.includes(fileExt)) {
    // Delete the malicious file
    fs.unlinkSync(file.path);
    return res.status(400).json({ message: 'ملف غير آمن' });
  }
  
  // Scan file content for scripts (basic implementation)
  if (file.mimetype.includes('text/') || file.mimetype.includes('application/')) {
    try {
      const content = fs.readFileSync(file.path, 'utf8');
      const scriptPatterns = [
        /<script>/i,
        /eval\(/i,
        /javascript:/i
      ];
      
      for (const pattern of scriptPatterns) {
        if (pattern.test(content)) {
          // Delete the malicious file with scripts
          fs.unlinkSync(file.path);
          return res.status(400).json({ message: 'محتوى الملف غير آمن' });
        }
      }
    } catch (error) {
      console.error('Error scanning file:', error);
    }
  }
  
  // File passed basic security checks
  next();
};

// Handler for file upload
export const handleFileUpload = (req: Request, res: Response) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'لم يتم تحميل أي ملف' });
    }
    
    // Return file information for client
    res.status(200).json({
      message: 'تم تحميل الملف بنجاح',
      file: {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: `/uploads/${file.filename}`
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تحميل الملف' });
  }
};