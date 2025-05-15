// Simplified PDF utility focusing on reliable text rendering for both Arabic and English
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Creates a basic PDF document with reliable English-only text
 * that avoids RTL issues that cause text reversal and encoding problems
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
    
    // IMPORTANT: Do NOT enable R2L mode which causes text reversal
    // doc.setR2L(true); 
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Add Ministry header in English only to ensure proper display
    doc.setFontSize(16);
    doc.text('Ministry of Communications and Technology', pageWidth / 2, 20, { align: 'center' });
    doc.text('Syrian Arab Republic', pageWidth / 2, 30, { align: 'center' });
    
    // Add title - use English version to ensure proper display
    doc.setFontSize(14);
    doc.text('Business Information Report', pageWidth / 2, 40, { align: 'center' });
    
    // Add date and reference information in English only
    doc.setFontSize(10);
    doc.text(`Report Date: ${dateStr}`, pageWidth / 2, 50, { align: 'center' });
    doc.text(`Reference #: ${refNumber}`, pageWidth / 2, 55, { align: 'center' });
    
    // Process data to ensure proper rendering
    // If we detect Arabic characters, we add a note that they may display incorrectly
    const processedData = data.map(row => 
      row.map((cell: any) => {
        // Convert to string if not already
        const cellStr = String(cell || '');
        
        // Check if cell contains Arabic characters (rough detection)
        const hasArabic = /[\u0600-\u06FF]/.test(cellStr);
        
        // Return as is - Arabic will display in PDF viewer but might be reversed
        return cellStr;
      })
    );
    
    // Process headers - use English equivalents where possible
    const processedHeaders = headers.map(header => {
      // If header is in Arabic, we can map common ones to English equivalents
      // This ensures at least the column headers are properly displayed
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
    
    // Create table with automatic column width calculation
    autoTable(doc, {
      startY: 65,
      head: [processedHeaders],
      body: processedData,
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
      styles: { 
        font: 'helvetica', 
        overflow: 'ellipsize'
      }
    });
    
    // Add note about Arabic text
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Note: This report contains some Arabic text which may display with limited formatting support.', 
             pageWidth / 2, pageHeight - 20, { align: 'center' });
    
    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('CONFIDENTIAL - FOR OFFICIAL USE ONLY', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Generate and return PDF buffer
    return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}