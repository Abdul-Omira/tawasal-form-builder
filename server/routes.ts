import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { BusinessSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
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
      
      // Create submission
      const submission = await storage.createBusinessSubmission(validatedData);
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
      if (!status || !["pending", "processed", "needs_info"].includes(status)) {
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

  // Simple authentication for the admin panel
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "اسم المستخدم وكلمة المرور مطلوبان" });
      }

      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) { // In a real app, passwords should be hashed
        return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      // In a real app, generate a JWT token here
      res.json({ 
        message: "تم تسجيل الدخول بنجاح",
        user: { id: user.id, username: user.username }
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
