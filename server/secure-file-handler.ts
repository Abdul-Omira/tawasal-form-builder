import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Secure file storage configuration
const SECURE_UPLOADS_DIR = process.env.SECURE_UPLOADS_DIR || '/var/secure-uploads';
const FILE_ACCESS_SECRET = process.env.FILE_ACCESS_SECRET || crypto.randomBytes(32).toString('hex');

// Ensure FILE_ACCESS_SECRET is consistent
if (!process.env.FILE_ACCESS_SECRET) {
  console.warn('FILE_ACCESS_SECRET not set in environment, using generated key. This may cause issues in clustered environments.');
}

// Create secure uploads directory
if (!fs.existsSync(SECURE_UPLOADS_DIR)) {
  fs.mkdirSync(SECURE_UPLOADS_DIR, { recursive: true, mode: 0o700 });
}

// File access token interface
interface FileAccessToken {
  fileId: string;
  originalName: string;
  expiresAt: number;
  ipAddress: string;
}

// Generate secure file ID (unpredictable)
export function generateSecureFileId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(timestamp + randomPart).digest('hex').substring(0, 16);
  return `${timestamp}_${hash}_${randomPart}`;
}

// Generate file access token
export function generateFileAccessToken(fileId: string, originalName: string, ipAddress: string): string {
  const payload: FileAccessToken = {
    fileId,
    originalName,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    ipAddress
  };
  
  return jwt.sign(payload, FILE_ACCESS_SECRET, { expiresIn: '24h' });
}

// Verify file access token
export function verifyFileAccessToken(token: string, ipAddress: string): FileAccessToken | null {
  try {
    const decoded = jwt.verify(token, FILE_ACCESS_SECRET) as FileAccessToken;
    
    // Check if token is expired
    if (decoded.expiresAt < Date.now()) {
      return null;
    }
    
    // Check if IP matches (prevent token sharing)
    if (decoded.ipAddress !== ipAddress) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

// Store file securely
export function storeFileSecurely(fileBuffer: Buffer, originalName: string, mimeType: string): string {
  const secureFileId = generateSecureFileId();
  const fileExtension = path.extname(originalName);
  const secureFileName = `${secureFileId}${fileExtension}`;
  const secureFilePath = path.join(SECURE_UPLOADS_DIR, secureFileName);
  
  // Encrypt file content
  const encryptionKey = crypto.scryptSync(FILE_ACCESS_SECRET, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
  
  let encrypted = cipher.update(fileBuffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  // Store encrypted file with IV
  const finalBuffer = Buffer.concat([iv, encrypted]);
  fs.writeFileSync(secureFilePath, finalBuffer, { mode: 0o600 });
  
  return secureFileId;
}

// Retrieve file securely
export function retrieveFileSecurely(fileId: string): Buffer | null {
  try {
    const files = fs.readdirSync(SECURE_UPLOADS_DIR);
    const targetFile = files.find(f => f.startsWith(fileId));
    
    if (!targetFile) {
      return null;
    }
    
    const filePath = path.join(SECURE_UPLOADS_DIR, targetFile);
    const encryptedData = fs.readFileSync(filePath);
    
    // Extract IV and encrypted content
    const iv = encryptedData.slice(0, 16);
    const encrypted = encryptedData.slice(16);
    
    // Decrypt file
    const encryptionKey = crypto.scryptSync(FILE_ACCESS_SECRET, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted;
  } catch (error) {
    return null;
  }
}

// Secure file serving endpoint
export function serveSecureFile(req: Request, res: Response): void {
  const { token } = req.params;
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Verify access token
  const tokenData = verifyFileAccessToken(token, clientIP);
  if (!tokenData) {
    res.status(403).json({ error: 'Invalid or expired file access token' });
    return;
  }
  
  // Retrieve file
  const fileBuffer = retrieveFileSecurely(tokenData.fileId);
  if (!fileBuffer) {
    res.status(404).json({ error: 'File not found' });
    return;
  }
  
  // Serve file with security headers
  res.setHeader('Content-Disposition', `attachment; filename="${tokenData.originalName}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  res.send(fileBuffer);
}

// Clean up expired files
export function cleanupExpiredFiles(): void {
  try {
    const files = fs.readdirSync(SECURE_UPLOADS_DIR);
    const now = Date.now();
    
    files.forEach(file => {
      const filePath = path.join(SECURE_UPLOADS_DIR, file);
      const stats = fs.statSync(filePath);
      
      // Delete files older than 30 days
      if (now - stats.mtime.getTime() > 30 * 24 * 60 * 60 * 1000) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.error('Error cleaning up expired files:', error);
  }
}

// Schedule cleanup every 24 hours
setInterval(cleanupExpiredFiles, 24 * 60 * 60 * 1000); 