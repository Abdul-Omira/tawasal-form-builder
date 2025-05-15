import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { BusinessSubmissionSchema, BusinessSubmission } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import path from 'path';
import fs from 'fs';
import { setupAuth, isAuthenticated, isAdmin } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Data export routes
  app.get("/api/admin/export", isAdmin, async (req: Request, res: Response) => {
    try {
      const { format = 'xlsx', status } = req.query;
      
      // Get all submissions or filter by status if provided
      let submissions: BusinessSubmission[];
      if (status && ['pending', 'approved', 'rejected'].includes(status as string)) {
        const result = await storage.getBusinessSubmissionsWithFilters({
          status: status as string,
          limit: 10000 // High limit to get all records
        });
        submissions = result.data;
      } else {
        submissions = await storage.getAllBusinessSubmissions();
      }

      // Format data for export
      const exportData = submissions.map(sub => ({
        ID: sub.id,
        'اسم الشركة': sub.businessName,
        'نوع النشاط': sub.businessType,
        'اسم المسؤول': sub.contactName,
        'البريد الإلكتروني': sub.email,
        'رقم الهاتف': sub.phone,
        'العنوان': sub.address,
        'الحالة': sub.status,
        'تاريخ التقديم': new Date(sub.createdAt).toLocaleDateString('ar-SY')
      }));

      if (format === 'xlsx') {
        // Generate Excel file
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "بيانات الشركات");
        
        // Set column widths
        const colWidths = [
          { wch: 5 },   // ID
          { wch: 25 },  // Business Name
          { wch: 15 },  // Business Type
          { wch: 20 },  // Contact Name
          { wch: 25 },  // Email
          { wch: 15 },  // Phone
          { wch: 25 },  // Address
          { wch: 10 },  // Status
          { wch: 12 },  // Created At
        ];
        worksheet['!cols'] = colWidths;
        
        // Generate Excel buffer
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        
        // Set headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename=business-submissions.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        return res.send(excelBuffer);
      } else if (format === 'pdf') {
        // Create new PDF document with RTL support
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        
        // Add Ministry logo
        const logoPath = path.join(process.cwd(), 'client/src/assets/syria-logo.png');
        if (fs.existsSync(logoPath)) {
          const logoData = fs.readFileSync(logoPath);
          const logoBase64 = Buffer.from(logoData).toString('base64');
          doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', 10, 10, 30, 30);
        }
        
        // Add header text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('وزارة الاتصالات وتقانة المعلومات', 150, 20, { align: 'center' });
        doc.setFontSize(14);
        doc.text('تقرير طلبات الشركات', 150, 30, { align: 'center' });
        
        // Add generation date
        doc.setFontSize(10);
        doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-SY')}`, 150, 40, { align: 'center' });
        
        // Create table with Arabic column headers
        autoTable(doc, {
          startY: 50,
          head: [['تاريخ التقديم', 'الحالة', 'العنوان', 'رقم الهاتف', 'البريد الإلكتروني', 'اسم المسؤول', 'نوع النشاط', 'اسم الشركة', 'ID']],
          body: exportData.map(row => [
            row['تاريخ التقديم'],
            row['الحالة'],
            row['العنوان'],
            row['رقم الهاتف'],
            row['البريد الإلكتروني'],
            row['اسم المسؤول'],
            row['نوع النشاط'],
            row['اسم الشركة'],
            row['ID']
          ]),
          headStyles: { 
            fillColor: [0, 110, 81],
            textColor: [255, 255, 255], 
            fontSize: 10
          },
          bodyStyles: { fontSize: 9 },
          theme: 'grid',
          // RTL support
          styles: { 
            halign: 'right', 
            font: 'helvetica'
          },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 20 },
            2: { cellWidth: 30 },
            3: { cellWidth: 25 },
            4: { cellWidth: 35 },
            5: { cellWidth: 25 },
            6: { cellWidth: 25 },
            7: { cellWidth: 40 },
            8: { cellWidth: 10 }
          }
        });
        
        // Add footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(`وزارة الاتصالات وتقانة المعلومات - الجمهورية العربية السورية - صفحة ${i} من ${pageCount}`, 150, doc.internal.pageSize.height - 10, { align: 'center' });
        }
        
        // Generate PDF buffer
        const pdfBuffer = doc.output('arraybuffer');
        
        // Set headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename=business-submissions.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        
        return res.send(Buffer.from(pdfBuffer));
      } else if (format === 'csv') {
        // Generate CSV
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
        
        // Set headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename=business-submissions.csv');
        res.setHeader('Content-Type', 'text/csv');
        
        return res.send(csvOutput);
      } else {
        return res.status(400).json({ message: "تنسيق تصدير غير مدعوم. استخدم 'xlsx', 'pdf', أو 'csv'" });
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تصدير البيانات" });
    }
  });

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

  const httpServer = createServer(app);
  return httpServer;
}
