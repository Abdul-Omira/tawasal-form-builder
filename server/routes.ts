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

      // Format data for export with more detailed information
      const exportData = submissions.map(sub => ({
        ID: sub.id,
        'اسم الشركة': sub.businessName,
        'نوع النشاط': sub.businessType,
        'عدد الموظفين': sub.employeesCount,
        'تاريخ التأسيس': sub.establishmentDate,
        'رقم التسجيل': sub.registrationNumber,
        'اسم المسؤول': sub.contactName,
        'المنصب': sub.position,
        'البريد الإلكتروني': sub.email,
        'رقم الهاتف': sub.phone,
        'المحافظة': sub.governorate,
        'العنوان': sub.address,
        'تفاصيل التحديات': sub.challengeDetails || '',
        'اسم الشركة الأجنبية المفروضة عليها عقوبات': sub.sanctionedCompanyName || '',
        'رابط الشركة الأجنبية': sub.sanctionedCompanyLink || '',
        'الحالة': getArabicStatus(sub.status),
        'تاريخ التقديم': new Date(sub.createdAt).toLocaleDateString('ar-SY')
      }));

      if (format === 'xlsx') {
        // Create title rows for ministry branding
        const title = [
          ['وزارة الاتصالات وتقانة المعلومات - الجمهورية العربية السورية'],
          ['تقرير طلبات الشركات'],
          [`تاريخ التقرير: ${new Date().toLocaleDateString('ar-SY')}`],
          [] // Empty row for spacing
        ];
        
        // Create header row with all column names
        const headers = Object.keys(exportData[0]);
        
        // First convert title rows to worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(title);
        
        // Add the data with headers starting at row 5 (after title)
        XLSX.utils.sheet_add_json(worksheet, exportData, { 
          origin: 'A5', 
          skipHeader: false,
          header: headers
        });
        
        // Create workbook and add worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "بيانات الشركات");
        
        // Set column widths based on extended data
        const colWidths = [
          { wch: 5 },   // ID
          { wch: 25 },  // Business Name
          { wch: 15 },  // Business Type
          { wch: 12 },  // Employees Count
          { wch: 15 },  // Establishment Date
          { wch: 15 },  // Registration Number
          { wch: 20 },  // Contact Name
          { wch: 15 },  // Position
          { wch: 25 },  // Email
          { wch: 15 },  // Phone
          { wch: 15 },  // Governorate
          { wch: 25 },  // Address
          { wch: 30 },  // Challenge Details
          { wch: 30 },  // Sanctioned Company Name
          { wch: 25 },  // Sanctioned Company Link
          { wch: 15 },  // Status
          { wch: 15 },  // Created At
        ];
        worksheet['!cols'] = colWidths;
        
        // Apply styling to title rows
        for (let i = 0; i < 3; i++) {
          // Get range of title rows (e.g., A1:R1)
          const range = XLSX.utils.encode_range({
            s: { c: 0, r: i },
            e: { c: headers.length - 1, r: i }
          });
          
          // Make a merged cell for the title spanning all columns
          if (!worksheet['!merges']) worksheet['!merges'] = [];
          worksheet['!merges'].push({
            s: { c: 0, r: i },
            e: { c: headers.length - 1, r: i }
          });
        }
        
        // Apply styling to the header row (bold, background color)
        // Note: Full styling requires a different library (like ExcelJS)
        // This provides basic structure with the available tools
        
        // Generate Excel buffer
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        
        // Set headers for file download with date in filename
        const today = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Disposition', `attachment; filename=business-submissions-${today}.xlsx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        return res.send(excelBuffer);
      } else if (format === 'pdf') {
        // Create new PDF document with RTL support
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        
        // Page dimensions
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        
        // Add Syrian emblem logo (centered at the top)
        const emblemPath = path.join(process.cwd(), 'client/src/assets/syria-emblem.png');
        if (fs.existsSync(emblemPath)) {
          const emblemData = fs.readFileSync(emblemPath);
          const emblemBase64 = Buffer.from(emblemData).toString('base64');
          // Center the emblem at the top
          doc.addImage(`data:image/png;base64,${emblemBase64}`, 'PNG', (pageWidth / 2) - 15, 5, 30, 30);
        }
        
        // Add Ministry logo on the right side
        const logoPath = path.join(process.cwd(), 'client/src/assets/ministry-logo.png');
        if (fs.existsSync(logoPath)) {
          const logoData = fs.readFileSync(logoPath);
          const logoBase64 = Buffer.from(logoData).toString('base64');
          // Place ministry logo on the right side
          doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', pageWidth - 45, 5, 35, 35);
        }
        
        // Add header text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('الجمهورية العربية السورية', pageWidth / 2, 40, { align: 'center' });
        doc.text('وزارة الاتصالات وتقانة المعلومات', pageWidth / 2, 48, { align: 'center' });
        
        // Add gold line under header
        doc.setDrawColor(184, 134, 11); // Gold color
        doc.setLineWidth(0.5);
        doc.line(60, 53, pageWidth - 60, 53);
        
        // Add report title
        doc.setFontSize(16);
        doc.text('تقرير طلبات الشركات المتضررة من العقوبات', pageWidth / 2, 60, { align: 'center' });
        
        // Add generation date and reference number
        doc.setFontSize(10);
        const today = new Date();
        doc.text(`تاريخ التقرير: ${today.toLocaleDateString('ar-SY')}`, pageWidth / 2, 67, { align: 'center' });
        doc.text(`رقم المرجع: MIN-COM-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${Math.floor(Math.random() * 1000)}`, pageWidth / 2, 72, { align: 'center' });
        
        // Prepare columns for the table (subset of all available data for readability)
        const tableColumns = [
          'ID',
          'اسم الشركة',
          'نوع النشاط',
          'اسم المسؤول',
          'البريد الإلكتروني',
          'رقم الهاتف',
          'المحافظة',
          'تفاصيل التحديات',
          'الحالة',
          'تاريخ التقديم'
        ];
        
        // Prepare table data
        const tableData = exportData.map(row => [
          row['ID'],
          row['اسم الشركة'],
          row['نوع النشاط'],
          row['اسم المسؤول'],
          row['البريد الإلكتروني'],
          row['رقم الهاتف'],
          row['المحافظة'],
          row['تفاصيل التحديات'].substring(0, 40) + (row['تفاصيل التحديات'].length > 40 ? '...' : ''),
          row['الحالة'],
          row['تاريخ التقديم']
        ]);
        
        // Create table with Arabic column headers
        autoTable(doc, {
          startY: 80,
          head: [tableColumns],
          body: tableData,
          headStyles: { 
            fillColor: [0, 110, 81], // Ministry green
            textColor: [255, 255, 255], 
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: { 
            fontSize: 9,
            cellPadding: 3
          },
          theme: 'grid',
          // RTL support
          styles: { 
            halign: 'right', 
            font: 'helvetica',
            overflow: 'linebreak'
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240]
          },
          // Column widths
          columnStyles: {
            0: { cellWidth: 10 },  // ID
            1: { cellWidth: 35 },  // Business Name
            2: { cellWidth: 25 },  // Business Type
            3: { cellWidth: 25 },  // Contact Name
            4: { cellWidth: 35 },  // Email
            5: { cellWidth: 20 },  // Phone
            6: { cellWidth: 20 },  // Governorate
            7: { cellWidth: 45 },  // Challenge Details
            8: { cellWidth: 20 },  // Status
            9: { cellWidth: 20 }   // Created Date
          }
        });
        
        // Add signature area at bottom
        doc.setFontSize(11);
        doc.text('توقيع المسؤول: ________________', pageWidth - 60, pageHeight - 25, { align: 'right' });
        doc.text('الختم الرسمي:', pageWidth - 60, pageHeight - 15, { align: 'right' });
        
        // Draw an empty circle for the official stamp
        doc.setDrawColor(0);
        doc.circle(pageWidth - 30, pageHeight - 15, 10, 'S');
        
        // Add footer with encryption notice and page numbers
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          // Footer with security notice
          doc.text('جميع البيانات في هذا التقرير مشفرة ومؤمنة - للاستخدام الرسمي فقط', pageWidth / 2, pageHeight - 5, { align: 'center' });
          // Page numbers
          doc.text(`صفحة ${i} من ${pageCount}`, 20, pageHeight - 5);
        }
        
        // Generate PDF buffer
        const pdfBuffer = doc.output('arraybuffer');
        
        // Set headers for file download with date in filename
        const dateStr = today.toISOString().split('T')[0];
        res.setHeader('Content-Disposition', `attachment; filename=business-submissions-report-${dateStr}.pdf`);
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
