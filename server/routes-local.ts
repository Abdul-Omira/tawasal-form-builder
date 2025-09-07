/**
 * TAWASAL.MOCT.GOV.SY - Local Development Routes
 * Syrian Ministry of Communication Platform
 * Simplified API routes for local development using SQLite
 * 
 * @author Abdulwahab Omira <abdulwahab.omira@moct.gov.sy>
 * @version 1.0.0
 * @license Government of Syria - Ministry of Communications
 * @copyright 2025 Syrian Ministry of Communications and Information Technology
 */

import type { Express, Request, Response, NextFunction } from "express";
import { db } from "./db-local";
import { db as formBuilderDb } from "./db-form-builder";
import { citizenCommunications, businessSubmissions, users } from "@shared/schema-local";
import { users as formBuilderUsers } from "@shared/schema-form-builder";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Import form builder routes
import formsRouter from "./routes/forms";
import responsesRouter from "./routes/responses";
import analyticsRouter from "./routes/analytics";

export async function registerRoutes(app: Express): Promise<void> {
  console.log("🔧 Setting up local development routes...");

  // Basic health check
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ 
      status: "healthy", 
      message: "Syrian Ministry Platform - Local Development",
      timestamp: new Date().toISOString()
    });
  });

  // Authentication routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      // Find user in form builder database
      const user = await formBuilderDb.select().from(formBuilderUsers).where(eq(formBuilderUsers.username, username)).get();
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Create JWT token
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          role: user.is_admin ? 'admin' : 'user'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          isAdmin: user.is_admin
        },
        token
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Citizen communication form submission
  app.post("/api/citizen-communication", async (req: Request, res: Response) => {
    try {
      const { fullName, email, phone, governorate, communicationType, subject, message, captchaAnswer, consentToDataUse } = req.body;
      
      // Basic validation
      if (!fullName || !email || !communicationType || !subject || !message || !captchaAnswer || !consentToDataUse) {
        return res.status(400).json({ error: "All required fields must be provided" });
      }

      // Insert into database
      const result = await db.insert(citizenCommunications).values({
        fullName,
        email,
        phone,
        governorate,
        communicationType,
        subject,
        message,
        captchaAnswer,
        consentToDataUse: Boolean(consentToDataUse),
        wantsUpdates: false,
        status: "pending"
      });

      res.json({
        success: true,
        message: "تم إرسال رسالتك بنجاح. سنقوم بالرد عليك في أقرب وقت ممكن.",
        submissionId: result.lastInsertRowid
      });

    } catch (error) {
      console.error("Citizen communication error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Business submission form
  app.post("/api/business-submission", async (req: Request, res: Response) => {
    try {
      const { 
        businessName, businessType, establishmentDate, employeesCount, address, governorate,
        registrationNumber, contactName, position, email, phone, alternativeContact, website,
        challenges, challengeDetails, techNeeds, techDetails, consentToDataUse, wantsUpdates,
        additionalComments, captchaAnswer 
      } = req.body;
      
      // Basic validation
      if (!employeesCount || !address || !governorate || !contactName || !position || !email || !phone || !challenges || !challengeDetails || !techNeeds || !consentToDataUse || !captchaAnswer) {
        return res.status(400).json({ error: "All required fields must be provided" });
      }

      // Insert into database
      const result = await db.insert(businessSubmissions).values({
        businessName,
        businessType,
        establishmentDate,
        employeesCount,
        address,
        governorate,
        registrationNumber,
        contactName,
        position,
        email,
        phone,
        alternativeContact,
        website,
        challenges: Array.isArray(challenges) ? challenges.join(',') : challenges,
        challengeDetails,
        techNeeds: Array.isArray(techNeeds) ? techNeeds.join(',') : techNeeds,
        techDetails,
        consentToDataUse: Boolean(consentToDataUse),
        wantsUpdates: Boolean(wantsUpdates),
        additionalComments,
        status: "pending"
      });

      res.json({
        success: true,
        message: "تم إرسال طلبك بنجاح. سنقوم بمراجعته والرد عليك في أقرب وقت ممكن.",
        submissionId: result.lastInsertRowid
      });

    } catch (error) {
      console.error("Business submission error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Form Builder API Routes
  app.use("/api/forms", formsRouter);
  app.use("/api/responses", responsesRouter);
  app.use("/api/analytics", analyticsRouter);

  // Admin routes (protected)
  app.get("/api/admin/submissions", async (req: Request, res: Response) => {
    try {
      // Simple admin check (in production, use proper JWT validation)
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get all submissions
      const citizenSubmissions = await db.select().from(citizenCommunications).all();
      const businessSubmissions = await db.select().from(businessSubmissions).all();

      res.json({
        citizenSubmissions,
        businessSubmissions
      });

    } catch (error) {
      console.error("Admin submissions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve static files for development
  app.get("/", (req: Request, res: Response) => {
    res.json({
      message: "Syrian Ministry of Communication Platform",
      status: "Local Development Server",
      endpoints: {
        health: "/api/health",
        login: "/api/auth/login",
        citizenForm: "/api/citizen-communication",
        businessForm: "/api/business-submission",
        admin: "/api/admin/submissions"
      }
    });
  });

  console.log("✅ Local development routes configured");
}

