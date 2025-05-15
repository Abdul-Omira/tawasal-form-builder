import { 
  BusinessSubmission, 
  InsertBusinessSubmission, 
  User, 
  UpsertUser,
  businessSubmissions,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, like, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  isUserAdmin(id: string): Promise<boolean>;
  setUserAsAdmin(id: string): Promise<User>;
  
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

// Storage class for database operations
export class DatabaseStorage implements IStorage {
  // User operations (for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const results = await db
      .insert(users)
      .values({
        ...userData,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return results[0];
  }

  async isUserAdmin(id: string): Promise<boolean> {
    const user = await this.getUser(id);
    return user?.isAdmin || false;
  }

  async setUserAsAdmin(id: string): Promise<User> {
    const results = await db
      .update(users)
      .set({ 
        isAdmin: true,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return results[0];
  }

  // Business submission operations
  async getAllBusinessSubmissions(): Promise<BusinessSubmission[]> {
    return await db
      .select()
      .from(businessSubmissions)
      .orderBy(desc(businessSubmissions.createdAt));
  }
  
  async getBusinessSubmissionById(id: number): Promise<BusinessSubmission | undefined> {
    const results = await db.select().from(businessSubmissions).where(eq(businessSubmissions.id, id));
    return results.length > 0 ? results[0] : undefined;
  }
  
  async createBusinessSubmission(insertSubmission: InsertBusinessSubmission): Promise<BusinessSubmission> {
    const results = await db.insert(businessSubmissions).values({
      ...insertSubmission,
      status: "pending",
      createdAt: new Date()
    }).returning();
    return results[0];
  }
  
  async updateBusinessSubmissionStatus(id: number, status: string): Promise<BusinessSubmission | undefined> {
    const results = await db
      .update(businessSubmissions)
      .set({ 
        status,
        updatedAt: new Date() 
      })
      .where(eq(businessSubmissions.id, id))
      .returning();
    
    return results.length > 0 ? results[0] : undefined;
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
    
    // Determine sort column and direction
    let query = db.select().from(businessSubmissions).where(whereClause);
    
    if (sortBy === 'businessName') {
      query = sortOrder === 'asc' 
        ? query.orderBy(businessSubmissions.businessName)
        : query.orderBy(desc(businessSubmissions.businessName));
    } else if (sortBy === 'businessType') {
      query = sortOrder === 'asc'
        ? query.orderBy(businessSubmissions.businessType)
        : query.orderBy(desc(businessSubmissions.businessType));
    } else if (sortBy === 'status') {
      query = sortOrder === 'asc'
        ? query.orderBy(businessSubmissions.status)
        : query.orderBy(desc(businessSubmissions.status));
    } else if (sortBy === 'updatedAt') {
      query = sortOrder === 'asc'
        ? query.orderBy(businessSubmissions.updatedAt)
        : query.orderBy(desc(businessSubmissions.updatedAt));
    } else {
      // Default to createdAt
      query = sortOrder === 'asc'
        ? query.orderBy(businessSubmissions.createdAt)
        : query.orderBy(desc(businessSubmissions.createdAt));
    }
    
    const data = await query.limit(limit).offset(offset);
    
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
