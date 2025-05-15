import { 
  BusinessSubmission, 
  InsertBusinessSubmission, 
  User, 
  InsertUser,
  businessSubmissions,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Business submission operations
  getAllBusinessSubmissions(): Promise<BusinessSubmission[]>;
  getBusinessSubmissionById(id: number): Promise<BusinessSubmission | undefined>;
  createBusinessSubmission(submission: InsertBusinessSubmission): Promise<BusinessSubmission>;
  updateBusinessSubmissionStatus(id: number, status: string): Promise<BusinessSubmission | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results.length > 0 ? results[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const results = await db.insert(users).values(insertUser).returning();
    return results[0];
  }
  
  async getAllBusinessSubmissions(): Promise<BusinessSubmission[]> {
    return await db.select().from(businessSubmissions);
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
      .set({ status })
      .where(eq(businessSubmissions.id, id))
      .returning();
    
    return results.length > 0 ? results[0] : undefined;
  }
}

// Initialize the database with a default admin user
async function initializeDatabase() {
  try {
    // Check if admin user exists
    const adminCheck = await db
      .select()
      .from(users)
      .where(eq(users.username, "admin"));
    
    // Create admin user if not exists
    if (adminCheck.length === 0) {
      await db.insert(users).values({
        username: "admin",
        password: "admin123" // In a real app, this would be hashed
      });
      console.log("Created default admin user");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

initializeDatabase();

export const storage = new DatabaseStorage();
