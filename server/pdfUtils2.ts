// Enhanced PDF utility with better styling, more information, and embedded Syrian emblem
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

// Embedded emblem image as base64 (can be used if file access fails)
const SYRIAN_EMBLEM_BASE64 = `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`;

/**
 * Enhanced PDF with more detail, Arabic text, and Syrian emblem
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
    // Create a PDF document with simple settings
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Try to add the emblem - first check local paths, then use embedded base64
    try {
      let emblemAdded = false;
      
      // Try various paths to find the emblem
      const possiblePaths = [
        '/tmp/assets/emblem.png',
        '/home/runner/workspace/assets/syrian_emblem.png',
        path.join(process.cwd(), 'attached_assets', 'Emblem_of_Syria.svg.png')
      ];
      
      for (const imgPath of possiblePaths) {
        if (fs.existsSync(imgPath)) {
          try {
            doc.addImage(imgPath, 'PNG', pageWidth / 2 - 15, 5, 30, 30);
            emblemAdded = true;
            break;
          } catch (err) {
            console.log(`Could not add image from ${imgPath}: ${err.message}`);
          }
        }
      }
      
      // If no file paths worked, use the embedded base64 image
      if (!emblemAdded) {
        doc.addImage(SYRIAN_EMBLEM_BASE64, 'PNG', pageWidth / 2 - 15, 5, 30, 30);
      }
    } catch (err) {
      console.error('Error adding emblem:', err);
      // Continue without the emblem if there was an error
    }
    
    // Add colored header bar
    doc.setFillColor(0, 110, 81); // Ministry green
    doc.rect(0, 40, pageWidth, 10, 'F');
    
    // Add ministry name in white
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('وزارة الاتصالات', pageWidth / 2, 47, { align: 'center' });
    
    // Reset to dark green text for the header
    doc.setTextColor(0, 110, 81);
    
    // Add title in both languages
    doc.setFontSize(16);
    doc.text('Ministry of Communications and Technology', pageWidth / 2, 60, { align: 'center' });
    doc.text('تقرير معلومات الأعمال', pageWidth / 2, 67, { align: 'center' });
    
    // Add the report purpose description
    doc.setFontSize(12);
    doc.text('Syrian Arab Republic - الجمهورية العربية السورية', pageWidth / 2, 75, { align: 'center' });
    
    // Add metadata in both languages
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Black
    doc.text(`تاريخ التقرير: ${dateStr}`, 20, 85);
    doc.text(`Report Date: ${dateStr}`, 20, 90);
    
    doc.text(`رقم المرجع: ${refNumber}`, pageWidth - 20, 85, { align: 'right' });
    doc.text(`Reference #: ${refNumber}`, pageWidth - 20, 90, { align: 'right' });
    
    // Create bilingual headers - show both Arabic and English
    const bilingualHeaders = headers.map(header => {
      const headerMap: {[key: string]: string} = {
        'تاريخ التقديم': 'Submission Date',
        'الحالة': 'Status',
        'المحافظة': 'Province',
        'رقم الهاتف': 'Phone',
        'البريد الإلكتروني': 'Email',
        'اسم المسؤول': 'Contact Name',
        'نوع النشاط': 'Business Type',
        'اسم الشركة': 'Company Name',
        'رقم الطلب': 'ID'
      };
      
      const englishHeader = headerMap[header] || header;
      return `${englishHeader}\n${header}`;
    });
    
    // Create table with enhanced styling
    autoTable(doc, {
      startY: 100,
      head: [bilingualHeaders],
      body: data,
      headStyles: { 
        fillColor: [0, 110, 81], // Ministry green
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: 4
      },
      theme: 'grid',
      styles: { 
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'right',
        lineWidth: 0.1,
        lineColor: [80, 80, 80]
      },
      alternateRowStyles: {
        fillColor: [240, 245, 245]
      }
    });
    
    // Add signature and stamp areas
    doc.setDrawColor(0, 0, 0);
    doc.setFontSize(10);
    
    // Left signature area
    doc.text('Official Signature / التوقيع الرسمي:', 30, pageHeight - 25);
    doc.line(30, pageHeight - 20, 100, pageHeight - 20);
    
    // Right stamp area
    doc.text('Official Stamp / الختم الرسمي:', pageWidth - 100, pageHeight - 25);
    doc.line(pageWidth - 100, pageHeight - 20, pageWidth - 30, pageHeight - 20);
    
    // Add footer with green accent line
    doc.setDrawColor(0, 110, 81);
    doc.setLineWidth(0.5);
    doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15);
    
    // Add bilingual confidentiality notice
    doc.setFontSize(8);
    doc.setTextColor(0, 110, 81);
    doc.text('CONFIDENTIAL - OFFICIAL USE ONLY / سري - للاستخدام الرسمي فقط', 
             pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Generate PDF buffer
    return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}