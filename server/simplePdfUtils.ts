// Simple PDF utility with proper Arabic font handling
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Creates an Arabic-friendly PDF document
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
    
    // Setup for RTL text
    doc.setR2L(true);
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Add headers
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('الجمهورية العربية السورية', pageWidth / 2, 20, { align: 'center' });
    doc.text('وزارة الاتصالات وتقانة المعلومات', pageWidth / 2, 30, { align: 'center' });
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, pageWidth / 2, 40, { align: 'center' });
    
    // Add date and reference number
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`تاريخ التقرير: ${dateStr}`, pageWidth / 2, 50, { align: 'center' });
    doc.text(`رقم المرجع: ${refNumber}`, pageWidth / 2, 55, { align: 'center' });
    
    // Create table
    autoTable(doc, {
      startY: 65,
      head: [headers],
      body: data,
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
        halign: 'right', 
        font: 'helvetica', 
        overflow: 'linebreak'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Add signature area at bottom
    doc.setFontSize(11);
    doc.text('توقيع المسؤول: ________________', pageWidth - 60, pageHeight - 20, { align: 'right' });
    doc.text('الختم الرسمي:', pageWidth - 60, pageHeight - 10, { align: 'right' });
    
    // Add footer with document info
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('جميع البيانات في هذا التقرير مشفرة ومؤمنة - للاستخدام الرسمي فقط', pageWidth / 2, pageHeight - 5, { align: 'center' });
    
    // Generate and return PDF buffer
    return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}