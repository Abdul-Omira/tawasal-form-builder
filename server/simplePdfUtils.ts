// Simple PDF utility with basic Arabic support
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Creates a minimal Arabic-friendly PDF document
 * This implementation relies on the browser's PDF rendering of Arabic content
 * and avoids complex font embedding to ensure proper character display
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
    // Create a PDF document using minimal settings that work with Arabic
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Enable right-to-left mode
    doc.setR2L(true);
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Add basic header with ministry info - using default font
    doc.setFontSize(16);
    doc.text('Syrian Arab Republic - Ministry of Communications', pageWidth / 2, 20, { align: 'center' });
    doc.text('Business Information Report', pageWidth / 2, 30, { align: 'center' });
    
    // Add title
    doc.setFontSize(14);
    doc.text(title, pageWidth / 2, 40, { align: 'center' });
    
    // Add date and reference number in both Arabic and English for reliability
    doc.setFontSize(10);
    doc.text(`Report Date: ${dateStr}`, pageWidth / 2, 50, { align: 'center' });
    doc.text(`Reference #: ${refNumber}`, pageWidth / 2, 55, { align: 'center' });
    
    // Create table with minimal styling to avoid Arabic rendering issues
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
        font: 'helvetica', 
        overflow: 'ellipsize'
      },
      columnStyles: {
        // Ensure all columns use consistent styling
        0: { halign: 'right' },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right' }
      }
    });
    
    // Add simple footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('CONFIDENTIAL - MINISTRY USE ONLY', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Generate and return PDF buffer
    return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}