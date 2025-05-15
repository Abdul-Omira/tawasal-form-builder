// Simplified and reliable PDF export utility
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Creates a basic but reliable PDF document with minimal styling
 * to ensure compatibility across all environments
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
    // Create a PDF document
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Add header with green background box
    doc.setFillColor(0, 110, 81); // Ministry green
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    // Add white text for the ministry header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('Ministry of Communications and Technology', pageWidth / 2, 15, { align: 'center' });
    
    // Add document title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Business Information Report', pageWidth / 2, 35, { align: 'center' });
    
    // Add report metadata
    doc.setFontSize(10);
    doc.text(`Syrian Arab Republic`, pageWidth / 2, 45, { align: 'center' });
    doc.text(`Report Date: ${dateStr}`, 20, 55);
    doc.text(`Reference #: ${refNumber}`, pageWidth - 20, 55, { align: 'right' });
    
    // Translate headers to English for reliability
    const englishHeaders = headers.map(header => {
      const headerMap: {[key: string]: string} = {
        'تاريخ التقديم': 'Submission Date',
        'الحالة': 'Status',
        'المحافظة': 'Province',
        'رقم الهاتف': 'Phone',
        'البريد الإلكتروني': 'Email',
        'اسم المسؤول': 'Contact Name',
        'نوع النشاط': 'Business Type',
        'اسم الشركة': 'Company Name',
        'رقم الطلب': 'ID',
        'ملاحظات': 'Notes'
      };
      
      return headerMap[header] || header;
    });
    
    // Create table
    autoTable(doc, {
      startY: 65,
      head: [englishHeaders],
      body: data,
      headStyles: { 
        fillColor: [0, 110, 81], // Ministry green
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      theme: 'grid',
      styles: { 
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Add footer
    doc.setDrawColor(0, 110, 81);
    doc.setLineWidth(0.5);
    doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15);
    
    doc.setFontSize(8);
    doc.setTextColor(0, 110, 81);
    doc.text('OFFICIAL DOCUMENT - CONFIDENTIAL', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Generate PDF buffer
    return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}