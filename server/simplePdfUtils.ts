// Enhanced PDF utility with bilingual support and proper styling
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

// Header translations for bilingual support
const headerTranslations: Record<string, string> = {
  'تاريخ التقديم': 'Submission Date',
  'الحالة': 'Status',
  'المحافظة': 'Province',
  'رقم الهاتف': 'Phone',
  'البريد الإلكتروني': 'Email',
  'اسم المسؤول': 'Contact Name',
  'نوع النشاط': 'Business Type',
  'اسم الشركة': 'Company Name',
  'رقم الطلب': 'ID Number',
  'ملاحظات': 'Notes'
};

/**
 * Creates a professionally styled bilingual (Arabic/English) PDF document
 * 
 * @param title PDF document title 
 * @param data Table data rows
 * @param headers Table headers
 * @param dateStr Date string to display
 * @param refNumber Reference number to display
 * @returns PDF buffer
 */
export function createArabicPDF(
  title: string,
  data: any[],
  headers: string[],
  dateStr: string,
  refNumber: string
): Buffer {
  try {
    // Create a PDF document - using landscape for more column space
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Try to add the Syrian emblem
    try {
      const emblemPath = path.join(process.cwd(), 'assets', 'syrian_emblem.png');
      if (fs.existsSync(emblemPath)) {
        // Add logo centered at the top
        doc.addImage(emblemPath, 'PNG', (pageWidth / 2) - 15, 10, 30, 30);
      }
    } catch (error) {
      console.error('Error adding emblem:', error);
      // Continue even if we can't add the emblem
    }
    
    // Add Ministry headers (bilingual)
    doc.setFontSize(16);
    doc.setTextColor(0, 110, 81); // Ministry green
    doc.text('Ministry of Communications and Technology', pageWidth / 2, 45, { align: 'center' });
    doc.text('وزارة الاتصالات وتقانة المعلومات', pageWidth / 2, 52, { align: 'center' });
    
    // Add title and subtitle (bilingual)
    doc.setFontSize(14);
    doc.text('Syrian Arab Republic - Business Information Report', pageWidth / 2, 60, { align: 'center' });
    doc.text('الجمهورية العربية السورية - تقرير معلومات الأعمال', pageWidth / 2, 67, { align: 'center' });
    
    // Add date and reference information (bilingual)
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Black
    doc.text(`Report Date: ${dateStr}`, 20, 75);
    doc.text(`Reference #: ${refNumber}`, pageWidth - 20, 75, { align: 'right' });
    
    // Create bilingual headers - both Arabic and English for better comprehension
    const bilingualHeaders = headers.map(header => {
      const englishHeader = headerTranslations[header] || header;
      // Return bilingual header with both languages
      return `${englishHeader}\n${header}`;
    });
    
    // Process data to preserve Arabic content
    const processedData = data.map(row => 
      row.map((cell: any) => {
        // Convert to string if not already
        return String(cell || '');
      })
    );
    
    // Create table with bilingual headers and improved styling
    autoTable(doc, {
      startY: 80,
      head: [bilingualHeaders],
      body: processedData,
      headStyles: { 
        fillColor: [0, 110, 81], // Ministry green
        textColor: [255, 255, 255], 
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: 4
      },
      bodyStyles: { 
        fontSize: 9,
        cellPadding: 3,
        valign: 'middle'
      },
      theme: 'grid',
      styles: { 
        font: 'helvetica', 
        overflow: 'linebreak',
        lineWidth: 0.1,
        lineColor: [80, 80, 80]
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      // Customize columns to fit content
      columnStyles: {
        0: { cellWidth: 20 }, // ID
        1: { cellWidth: 'auto' }, // Business Name
        2: { cellWidth: 'auto' } // Others will auto-size
      },
      // Ensure table spans the whole width
      tableWidth: 'auto',
      margin: { left: 10, right: 10 }
    });
    
    // Add official signature areas (bilingual)
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Official Signature / التوقيع الرسمي: ________________', 30, pageHeight - 20);
    doc.text('Official Stamp / الختم الرسمي', 30, pageHeight - 15);
    
    // Add security and confidentiality notice (bilingual)
    doc.setDrawColor(0, 110, 81); // Ministry green
    doc.setLineWidth(0.5);
    doc.line(10, pageHeight - 10, pageWidth - 10, pageHeight - 10);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('CONFIDENTIAL - FOR OFFICIAL USE ONLY / سري - للاستخدام الرسمي فقط', 
             pageWidth / 2, pageHeight - 5, { align: 'center' });
    
    // Generate and return PDF buffer
    return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}