import { 
  BusinessSubmission, 
  InsertBusinessSubmission, 
  User,
  InsertUser,
  LoginCredentials,
  businessSubmissions,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, like, or } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { 
  encrypt, 
  decrypt, 
  encryptSensitiveFields, 
  decryptSensitiveFields,
  SENSITIVE_BUSINESS_FIELDS
} from "./encryption";

const scryptAsync = promisify(scrypt);

/**
 * Helper function to safely decrypt business submission data
 * Uses a more resilient approach with detailed error handling
 */
function safelyDecryptBusinessSubmission(submission: any): any {
  if (!submission) return submission;
  
  const decryptedSubmission = { ...submission };
  
  // Process each sensitive field
  for (const field of SENSITIVE_BUSINESS_FIELDS) {
    if (decryptedSubmission[field] && typeof decryptedSubmission[field] === 'string') {
      try {
        // Store original value
        const originalValue = decryptedSubmission[field];
        
        // Skip obviously non-encrypted values to avoid errors
        if (originalValue.length < 20 || !originalValue.includes('.')) {
          continue;
        }
        
        // Try to decrypt
        const decryptedValue = decrypt(originalValue);
        
        // Only use decrypted value if it's valid
        if (decryptedValue !== null && 
            decryptedValue !== undefined && 
            (typeof decryptedValue !== 'string' || decryptedValue.trim() !== '')) {
          decryptedSubmission[field] = decryptedValue;
        }
      } catch (error) {
        console.error(`Error decrypting field ${field}:`, error);
        // Keep original value if decryption fails
      }
    }
  }
  
  return decryptedSubmission;
}

/**
 * Prepares business submissions for export in a standardized format
 * This handles proper decryption and ensures consistent data formatting
 */
export function prepareBusinessSubmissionsForExport(submissions: BusinessSubmission[]): any[] {
  return submissions.map(submission => {
    const decrypted = safelyDecryptBusinessSubmission(submission);
    
    // Format for export with standardized properties
    return {
      'ID': decrypted.id,
      'اسم الشركة': decrypted.businessName || '',
      'نوع النشاط': decrypted.businessType || '',
      'اسم المسؤول': decrypted.ownerName || '',
      'البريد الإلكتروني': decrypted.email || '',
      'رقم الهاتف': decrypted.phone || '',
      'المحافظة': decrypted.province || '',
      'الحالة': decrypted.status || 'قيد المراجعة',
      'تاريخ التقديم': decrypted.createdAt ? new Date(decrypted.createdAt).toLocaleDateString('ar-SY') : '',
      'ملاحظات': decrypted.notes || ''
    };
  });
}

// Interface for storage operations
export interface IStorage {
  // User operations for local authentication
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(username: string, password: string): Promise<User | undefined>;
  validateUser(credentials: LoginCredentials): Promise<User | null>;
  isUserAdmin(id: number): Promise<boolean>;
  setUserAsAdmin(id: number): Promise<User>;
  
  // Business submission operations
  getAllBusinessSubmissions(): Promise<BusinessSubmission[]>;
  getBusinessSubmissionById(id: number): Promise<BusinessSubmission | undefined>;
  createBusinessSubmission(submission: InsertBusinessSubmission): Promise<BusinessSubmission>;
  updateBusinessSubmissionStatus(id: number, status: string): Promise<BusinessSubmission | undefined>;
  
  // Advanced business submission operations for admin panel
  getBusinessSubmissionsWithFilters(options: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: BusinessSubmission[]; total: number }>;
  getBusinessSubmissionStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byBusinessType: Record<string, number>;
  }>;
}

// Helper functions for password hashing
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Storage class for database operations
export class DatabaseStorage implements IStorage {
  // User operations for local authentication
  async getUserById(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results.length > 0 ? results[0] : undefined;
  }

  async updateUserPassword(username: string, password: string): Promise<User | undefined> {
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Update the user's password
    const results = await db
      .update(users)
      .set({ 
        password: hashedPassword
      })
      .where(eq(users.username, username))
      .returning();
    
    return results.length > 0 ? results[0] : undefined;
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    // Hash the password before storing if it's not already hashed
    let password = userData.password;
    if (!password.includes('.')) { // Simple check to see if already hashed
      password = await hashPassword(userData.password);
    }
    
    const results = await db
      .insert(users)
      .values({
        ...userData,
        password,
      })
      .returning();
    
    return results[0];
  }

  async validateUser(credentials: LoginCredentials): Promise<User | null> {
    const user = await this.getUserByUsername(credentials.username);
    
    if (!user) {
      return null;
    }
    
    const isValid = await comparePasswords(credentials.password, user.password);
    
    return isValid ? user : null;
  }

  async isUserAdmin(id: number): Promise<boolean> {
    const user = await this.getUserById(id);
    return user?.isAdmin || false;
  }

  async setUserAsAdmin(id: number): Promise<User> {
    const results = await db
      .update(users)
      .set({ 
        isAdmin: true
      })
      .where(eq(users.id, id))
      .returning();
    
    return results[0];
  }

  // Business submission operations
  async getAllBusinessSubmissions(): Promise<BusinessSubmission[]> {
    const submissions = await db
      .select()
      .from(businessSubmissions)
      .orderBy(desc(businessSubmissions.createdAt));
    
    // Use our helper function to safely decrypt all submissions
    return submissions.map(submission => safelyDecryptBusinessSubmission(submission));
  }
  
  async getBusinessSubmissionById(id: number): Promise<BusinessSubmission | undefined> {
    const results = await db.select().from(businessSubmissions).where(eq(businessSubmissions.id, id));
    
    if (results.length === 0) {
      return undefined;
    }
    
    // Use our helper function to safely decrypt the submission
    return safelyDecryptBusinessSubmission(results[0]);
  }
  
  async createBusinessSubmission(insertSubmission: InsertBusinessSubmission): Promise<BusinessSubmission> {
    try {
      console.log("Creating business submission with data (sensitive info redacted)");
      
      // Only include fields that exist in the database schema
      const sanitizedData = {
        businessName: insertSubmission.businessName,
        businessType: insertSubmission.businessType,
        establishmentDate: insertSubmission.establishmentDate,
        employeesCount: insertSubmission.employeesCount,
        address: insertSubmission.address,
        governorate: insertSubmission.governorate,
        registrationNumber: insertSubmission.registrationNumber,
        contactName: insertSubmission.contactName,
        position: insertSubmission.position,
        email: insertSubmission.email,
        phone: insertSubmission.phone,
        alternativeContact: insertSubmission.alternativeContact,
        website: insertSubmission.website,
        challenges: insertSubmission.challenges,
        challengeDetails: insertSubmission.challengeDetails,
        techNeeds: insertSubmission.techNeeds,
        techDetails: insertSubmission.techDetails,
        consentToDataUse: insertSubmission.consentToDataUse,
        wantsUpdates: insertSubmission.wantsUpdates,
        additionalComments: insertSubmission.additionalComments,
        sanctionedCompanyName: insertSubmission.sanctionedCompanyName,
        sanctionedCompanyLink: insertSubmission.sanctionedCompanyLink,
        captchaAnswer: insertSubmission.captchaAnswer,
        status: "pending",
        createdAt: new Date()
      };
      
      // Encrypt sensitive fields before storing in database
      const encryptedData = { ...sanitizedData };
      
      // Encrypt each sensitive field
      for (const field of SENSITIVE_BUSINESS_FIELDS) {
        if (encryptedData[field] && typeof encryptedData[field] === 'string') {
          encryptedData[field] = encrypt(encryptedData[field]);
        }
      }
      
      const results = await db.insert(businessSubmissions).values(encryptedData).returning();
      
      // Decrypt the data before returning to client
      const decryptedSubmission = { ...results[0] };
      
      // Decrypt each sensitive field with improved error handling
      for (const field of SENSITIVE_BUSINESS_FIELDS) {
        try {
          // Only attempt to decrypt if the field exists and is a non-empty string
          if (decryptedSubmission[field] && 
              typeof decryptedSubmission[field] === 'string' && 
              decryptedSubmission[field].trim() !== '') {
            
            const encryptedValue = decryptedSubmission[field];
            const decryptedValue = decrypt(encryptedValue);
            
            // Only use decrypted value if it's not null and not empty
            if (decryptedValue !== null && 
                decryptedValue !== undefined && 
                (typeof decryptedValue !== 'string' || decryptedValue.trim() !== '')) {
              decryptedSubmission[field] = decryptedValue;
            }
          }
        } catch (error) {
          console.error(`Error handling decryption for field ${field}:`, error);
          // Keep the original value if anything goes wrong
        }
      }
      
      console.log("Business submission created successfully with encrypted sensitive data");
      return decryptedSubmission;
    } catch (error) {
      console.error("Database error creating submission:", error);
      throw error;
    }
  }
  
  async updateBusinessSubmissionStatus(id: number, status: string): Promise<BusinessSubmission | undefined> {
    const results = await db
      .update(businessSubmissions)
      .set({ 
        status
      })
      .where(eq(businessSubmissions.id, id))
      .returning();
    
    if (results.length === 0) {
      return undefined;
    }
    
    // Decrypt sensitive fields before returning
    const submission = results[0];
    const decryptedSubmission = { ...submission };
    
    // Decrypt each sensitive field
    for (const field of SENSITIVE_BUSINESS_FIELDS) {
      if (decryptedSubmission[field] && typeof decryptedSubmission[field] === 'string') {
        try {
          decryptedSubmission[field] = decrypt(decryptedSubmission[field]);
        } catch (error) {
          console.error(`Error decrypting field ${field}:`, error);
          // Keep the encrypted value if decryption fails
        }
      }
    }
    
    return decryptedSubmission;
  }

  // Advanced business submission operations for admin panel
  async getBusinessSubmissionsWithFilters(options: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: BusinessSubmission[]; total: number }> {
    const { 
      status, 
      search, 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = options;
    
    // Build the query conditions
    let conditions = [];
    
    if (status) {
      conditions.push(eq(businessSubmissions.status, status));
    }
    
    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(businessSubmissions.businessName, searchTerm),
          like(businessSubmissions.contactName, searchTerm),
          like(businessSubmissions.email, searchTerm),
          like(businessSubmissions.phone, searchTerm)
        )
      );
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Count total results
    const totalResults = await db
      .select({ count: sql<number>`count(*)` })
      .from(businessSubmissions)
      .where(whereClause);
    
    const total = Number(totalResults[0].count);
    
    // Get paginated data
    const offset = (page - 1) * limit;
    
    // Build the query with sorting
    let orderByField;
    switch (sortBy) {
      case 'businessName':
        orderByField = businessSubmissions.businessName;
        break;
      case 'businessType':
        orderByField = businessSubmissions.businessType;
        break;
      case 'status':
        orderByField = businessSubmissions.status;
        break;
      case 'date':
        orderByField = businessSubmissions.createdAt;
        break;
      default:
        orderByField = businessSubmissions.createdAt;
    }
    
    // Get the data with proper ordering
    const encryptedData = await db
      .select()
      .from(businessSubmissions)
      .where(whereClause)
      .orderBy(sortOrder === 'asc' ? orderByField : desc(orderByField))
      .limit(limit)
      .offset(offset);
    
    // Use our helper function to safely decrypt all submissions
    const data = encryptedData.map(submission => safelyDecryptBusinessSubmission(submission));
    
    return { data, total };
  }

  async getBusinessSubmissionStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byBusinessType: Record<string, number>;
  }> {
    // Get counts by status
    const totalResults = await db
      .select({ count: sql<number>`count(*)` })
      .from(businessSubmissions);
    
    const pendingResults = await db
      .select({ count: sql<number>`count(*)` })
      .from(businessSubmissions)
      .where(eq(businessSubmissions.status, 'pending'));
    
    const approvedResults = await db
      .select({ count: sql<number>`count(*)` })
      .from(businessSubmissions)
      .where(eq(businessSubmissions.status, 'approved'));
    
    const rejectedResults = await db
      .select({ count: sql<number>`count(*)` })
      .from(businessSubmissions)
      .where(eq(businessSubmissions.status, 'rejected'));
    
    // Get counts by business type
    const businessTypeResults = await db
      .select({
        type: businessSubmissions.businessType,
        count: sql<number>`count(*)`
      })
      .from(businessSubmissions)
      .groupBy(businessSubmissions.businessType);
    
    const byBusinessType: Record<string, number> = {};
    
    businessTypeResults.forEach(item => {
      byBusinessType[item.type] = Number(item.count);
    });
    
    return {
      total: Number(totalResults[0].count),
      pending: Number(pendingResults[0].count),
      approved: Number(approvedResults[0].count),
      rejected: Number(rejectedResults[0].count),
      byBusinessType
    };
  }
}

export const storage = new DatabaseStorage();
