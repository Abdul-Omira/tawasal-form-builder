import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { BusinessSubmissionSchema, BusinessSubmission, CitizenCommunicationSchema, CitizenCommunication } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";

// Helper function to translate status to Arabic
function getArabicStatus(status: string): string {
  switch(status) {
    case 'pending': return 'قيد المراجعة';
    case 'approved': return 'تمت الموافقة';
    case 'rejected': return 'مرفوض';
    default: return status;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple endpoint that just returns the CSRF token in the header
  // This helps with frontend CSRF token synchronization
  app.get('/api/csrf-token', (req: Request, res: Response) => {
    res.status(200).json({ message: 'CSRF token refreshed' });
  });
  
  // API Routes for citizen communications
  app.get("/api/citizen-communications", async (req: Request, res: Response) => {
    try {
      const communications = await storage.getAllCitizenCommunications();
      res.json(communications);
    } catch (error) {
      console.error("Error fetching communications:", error);
      res.status(500).json({ message: "حدث خطأ أثناء جلب البيانات" });
    }
  });

  app.get("/api/citizen-communications/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "معرف غير صالح" });
      }
      
      const communication = await storage.getCitizenCommunicationById(id);
      if (!communication) {
        return res.status(404).json({ message: "لم يتم العثور على الرسالة" });
      }
      
      res.json(communication);
    } catch (error) {
      console.error("Error fetching communication:", error);
      res.status(500).json({ message: "حدث خطأ أثناء جلب البيانات" });
    }
  });

  app.post("/api/citizen-communications", async (req: Request, res: Response) => {
    try {
      const communication = req.body;
      
      // Validate the submission data
      const validationResult = CitizenCommunicationSchema.safeParse(communication);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ 
          message: "بيانات غير صالحة", 
          errors: validationError.details 
        });
      }
      
      const createdCommunication = await storage.createCitizenCommunication(communication);
      res.status(201).json(createdCommunication);
    } catch (error) {
      console.error("Error creating communication:", error);
      res.status(500).json({ message: "حدث خطأ أثناء إنشاء الرسالة" });
    }
  });

  app.patch("/api/citizen-communications/:id/status", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "معرف غير صالح" });
      }
      
      const { status } = req.body;
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "الحالة مطلوبة" });
      }
      
      const updatedCommunication = await storage.updateCitizenCommunicationStatus(id, status);
      if (!updatedCommunication) {
        return res.status(404).json({ message: "لم يتم العثور على الرسالة" });
      }
      
      res.json(updatedCommunication);
    } catch (error) {
      console.error("Error updating communication status:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تحديث حالة الرسالة" });
    }
  });

  app.get("/api/admin/citizen-communications", isAdmin, async (req: Request, res: Response) => {
    try {
      const { 
        status, 
        communicationType,
        search, 
        page = '1', 
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query as Record<string, string>;
      
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      
      const result = await storage.getCitizenCommunicationsWithFilters({
        status,
        communicationType,
        search,
        page: pageNum,
        limit: limitNum,
        sortBy,
        sortOrder: (sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching filtered communications:", error);
      res.status(500).json({ message: "حدث خطأ أثناء جلب البيانات" });
    }
  });

  app.get("/api/admin/communication-statistics", isAdmin, async (req: Request, res: Response) => {
    try {
      const stats = await storage.getCitizenCommunicationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching communication statistics:", error);
      res.status(500).json({ message: "حدث خطأ أثناء جلب الإحصائيات" });
    }
  });
  // Set up authentication
  await setupAuth(app);
  
  // Create test users with proper password hashing
  try {
    // Import the createTestUsers function
    const { createTestUsers } = await import('./createTestUsers');
    
    // Create test users
    await createTestUsers();
    
    console.log("Test users created successfully. Use:");
    console.log("1. Admin: username='admin', password='m5wYJU_FaXhyu^F'");
    console.log("2. Employee: username='employee', password='employee123'");
  } catch (error) {
    console.error("Error creating test users:", error);
  }
  
  // API Routes for business submissions
  app.get("/api/business-submissions", async (req: Request, res: Response) => {
    try {
      const submissions = await storage.getAllBusinessSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "حدث خطأ أثناء جلب البيانات" });
    }
  });

  app.get("/api/business-submissions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "معرف غير صالح" });
      }

      const submission = await storage.getBusinessSubmissionById(id);
      if (!submission) {
        return res.status(404).json({ message: "لم يتم العثور على الطلب" });
      }

      res.json(submission);
    } catch (error) {
      console.error("Error fetching submission:", error);
      res.status(500).json({ message: "حدث خطأ أثناء جلب البيانات" });
    }
  });

  app.post("/api/business-submissions", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = BusinessSubmissionSchema.parse(req.body);
      
      // Collect device information
      const ipAddress = 
        req.headers['x-forwarded-for'] || 
        req.socket.remoteAddress || 
        req.ip || 
        '0.0.0.0';
      
      const userAgent = req.headers['user-agent'] || '';
      
      // Add device information to additionalComments
      const deviceInfo = `IP: ${Array.isArray(ipAddress) ? ipAddress[0] : ipAddress.toString()}\nالجهاز: ${userAgent}`;
      
      // If there are existing comments, preserve them
      const updatedComments = validatedData.additionalComments 
        ? `${validatedData.additionalComments}\n\n${deviceInfo}`
        : deviceInfo;
      
      // Update the submission data
      const enhancedData = {
        ...validatedData,
        additionalComments: updatedComments
      };
      
      // Create submission
      const submission = await storage.createBusinessSubmission(enhancedData);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof ZodError) {
        // Convert Zod error to a more user-friendly format
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: "خطأ في البيانات المدخلة", 
          errors: validationError.details 
        });
      }
      
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "حدث خطأ أثناء حفظ البيانات" });
    }
  });

  app.patch("/api/business-submissions/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "معرف غير صالح" });
      }

      const { status } = req.body;
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "حالة غير صالحة" });
      }

      const submission = await storage.updateBusinessSubmissionStatus(id, status);
      if (!submission) {
        return res.status(404).json({ message: "لم يتم العثور على الطلب" });
      }

      res.json(submission);
    } catch (error) {
      console.error("Error updating submission status:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تحديث الحالة" });
    }
  });

  // Our new auth.ts file handles these routes:
  // - /api/login
  // - /api/register
  // - /api/logout
  // - /api/user

  // Admin-only routes (protected)
  app.get("/api/admin/business-submissions", isAdmin, async (req: Request, res: Response) => {
    try {
      const { status, search, page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      const result = await storage.getBusinessSubmissionsWithFilters({
        status: status as string | undefined,
        search: search as string | undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc'
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching business submissions:", error);
      res.status(500).json({ message: "حدث خطأ أثناء جلب البيانات" });
    }
  });

  app.get("/api/admin/statistics", isAdmin, async (req: Request, res: Response) => {
    try {
      const stats = await storage.getBusinessSubmissionStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "حدث خطأ أثناء جلب الإحصائيات" });
    }
  });

  // Export functionality removed as requested

  // Make a specific user an admin (protected with admin auth)
  app.post("/api/admin/promote", isAdmin, async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "معرف المستخدم مطلوب" });
      }
      
      const user = await storage.setUserAsAdmin(userId);
      
      if (!user) {
        return res.status(404).json({ message: "لم يتم العثور على المستخدم" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error promoting user to admin:", error);
      res.status(500).json({ message: "حدث خطأ أثناء ترقية المستخدم إلى مدير" });
    }
  });

  // Password update route
  app.post("/api/user/change-password", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "كلمة المرور الحالية والجديدة مطلوبة" });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل" });
      }
      
      // Get user from the session
      const userId = (req.user as any).id;
      if (!userId) {
        return res.status(401).json({ message: "المستخدم غير مسجل الدخول" });
      }
      
      // Get user from database to verify current password
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      // Import the comparePasswords function from auth.ts
      const { comparePasswords } = await import('./auth');
      
      // Verify the current password
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "كلمة المرور الحالية غير صحيحة" });
      }
      
      // Update the password
      const updatedUser = await storage.updateUserPassword(user.username, newPassword);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "فشل تحديث كلمة المرور" });
      }
      
      res.status(200).json({ message: "تم تحديث كلمة المرور بنجاح" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تغيير كلمة المرور" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
