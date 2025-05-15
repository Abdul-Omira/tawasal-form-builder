import { 
  BusinessSubmission, 
  InsertBusinessSubmission, 
  User, 
  InsertUser
} from "@shared/schema";
import { generateId } from "../client/src/lib/utils";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private businessSubmissions: Map<number, BusinessSubmission>;
  private currentUserId: number;
  private currentSubmissionId: number;

  constructor() {
    this.users = new Map();
    this.businessSubmissions = new Map();
    this.currentUserId = 1;
    this.currentSubmissionId = 1;
    
    // Add a default admin user
    this.createUser({
      username: "admin",
      password: "admin123" // In a real app, this would be hashed
    });
    
    // Add some sample business submissions (for demo purposes)
    this.createBusinessSubmission({
      businessName: "شركة التقنية المتطورة",
      businessType: "technology",
      establishmentDate: "2020-01-01",
      employeesCount: "11-50",
      address: "شارع الحمراء، دمشق",
      governorate: "damascus",
      registrationNumber: "123456",
      contactName: "محمد أحمد",
      position: "المدير التنفيذي",
      email: "contact@techcompany.sy",
      phone: "0963123456789",
      alternativeContact: "",
      website: "https://techcompany.sy",
      challenges: ["challenge1", "challenge2", "challenge5"],
      challengeDetails: "نواجه تحديات في الوصول إلى الخدمات السحابية وتحديثات البرمجيات بسبب العقوبات.",
      techNeeds: ["techNeed1", "techNeed2"],
      techDetails: "نحتاج إلى حلول برمجية بديلة وخدمات استضافة محلية.",
      consentToDataUse: true,
      wantsUpdates: true,
      additionalComments: ""
    });
    
    this.createBusinessSubmission({
      businessName: "شركة الإنتاج الصناعي",
      businessType: "manufacturing",
      establishmentDate: "2015-05-10",
      employeesCount: "51-200",
      address: "المنطقة الصناعية، حلب",
      governorate: "aleppo",
      registrationNumber: "789012",
      contactName: "عمر خالد",
      position: "مدير العمليات",
      email: "info@industry.sy",
      phone: "0963987654321",
      alternativeContact: "",
      website: "https://industry.sy",
      challenges: ["challenge3", "challenge4"],
      challengeDetails: "نواجه صعوبة في استيراد المواد الخام والمعدات اللازمة للإنتاج.",
      techNeeds: ["techNeed3", "techNeed4"],
      techDetails: "نحتاج إلى حلول تقنية لتحسين كفاءة الإنتاج والتواصل مع الموردين.",
      consentToDataUse: true,
      wantsUpdates: true,
      additionalComments: ""
    });
    
    this.updateBusinessSubmissionStatus(2, "processed");
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Business submission operations
  async getAllBusinessSubmissions(): Promise<BusinessSubmission[]> {
    return Array.from(this.businessSubmissions.values());
  }
  
  async getBusinessSubmissionById(id: number): Promise<BusinessSubmission | undefined> {
    return this.businessSubmissions.get(id);
  }
  
  async createBusinessSubmission(insertSubmission: InsertBusinessSubmission): Promise<BusinessSubmission> {
    const id = this.currentSubmissionId++;
    const now = new Date();
    const submission: BusinessSubmission = { 
      ...insertSubmission, 
      id, 
      status: "pending",
      createdAt: now
    };
    this.businessSubmissions.set(id, submission);
    return submission;
  }
  
  async updateBusinessSubmissionStatus(id: number, status: string): Promise<BusinessSubmission | undefined> {
    const submission = this.businessSubmissions.get(id);
    if (!submission) return undefined;
    
    const updatedSubmission = { ...submission, status };
    this.businessSubmissions.set(id, updatedSubmission);
    return updatedSubmission;
  }
}

export const storage = new MemStorage();
