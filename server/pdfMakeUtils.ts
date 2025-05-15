import * as pdfmake from 'pdfmake/build/pdfmake';
import fs from 'fs';
import path from 'path';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

// Initialize pdfMake with empty vfs
(pdfmake as any).vfs = {};

// Path to Amiri Arabic fonts (already in our assets)
const AMIRI_REGULAR_PATH = path.join(process.cwd(), 'client/src/assets/fonts/amiri-regular.ttf');
const AMIRI_BOLD_PATH = path.join(process.cwd(), 'client/src/assets/fonts/amiri-bold.ttf');

/**
 * Creates a PDF document with proper Arabic text support using pdfMake
 * @param options Options for the PDF document
 * @returns PDF document as Buffer
 */
export async function createArabicPDF(
  title: string,
  subtitle: string,
  tableData: any[],
  tableHeaders: string[],
  dateStr: string,
  refNumber: string
): Promise<Buffer> {
  try {
    // Register Amiri fonts for Arabic
    const fonts = {
      Amiri: {
        normal: AMIRI_REGULAR_PATH,
        bold: AMIRI_BOLD_PATH,
      },
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      }
    };

    // Configure PDF document
    const docDefinition: TDocumentDefinitions = {
      pageOrientation: 'landscape',
      pageMargins: [40, 60, 40, 60],
      defaultStyle: {
        font: 'Amiri',
        fontSize: 10,
        alignment: 'right',
      },
      content: [
        // Title section
        {
          text: 'الجمهورية العربية السورية',
          style: 'header',
          alignment: 'center',
        },
        {
          text: 'وزارة الاتصالات وتقانة المعلومات',
          style: 'header',
          alignment: 'center',
          margin: [0, 5, 0, 0],
        },
        {
          text: title,
          style: 'title',
          alignment: 'center',
          margin: [0, 20, 0, 0],
        },
        {
          columns: [
            {
              text: `تاريخ التقرير: ${dateStr}`,
              alignment: 'center',
              width: '*',
            },
            {
              text: `رقم المرجع: ${refNumber}`,
              alignment: 'center',
              width: '*',
            },
          ],
          margin: [0, 10, 0, 20],
        },
        // Table
        {
          table: {
            headerRows: 1,
            widths: Array(tableHeaders.length).fill('*'),
            body: [
              // Header row
              tableHeaders.map(header => ({
                text: header,
                style: 'tableHeader',
              })),
              // Data rows
              ...tableData
            ],
          },
          layout: {
            fillColor: function(rowIndex: number) {
              return (rowIndex % 2 === 0) ? '#FFFFFF' : '#F8F9FA';
            },
            hLineWidth: function() { return 1; },
            vLineWidth: function() { return 1; },
            hLineColor: function() { return '#E2E8F0'; },
            vLineColor: function() { return '#E2E8F0'; },
          }
        },
        // Signature area
        {
          text: 'توقيع المسؤول: ________________',
          alignment: 'right',
          margin: [0, 30, 0, 5],
        },
        {
          text: 'الختم الرسمي:',
          alignment: 'right',
          margin: [0, 0, 0, 0],
        },
        // Footer
        {
          text: 'جميع البيانات في هذا التقرير مشفرة ومؤمنة - للاستخدام الرسمي فقط',
          style: 'footer',
          alignment: 'center',
          margin: [0, 20, 0, 0],
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 5],
        },
        title: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: 'white',
          fillColor: '#006E51', // Ministry green
          alignment: 'center',
        },
        footer: {
          fontSize: 8,
          italics: true,
        },
      },
    };

    // Create the PDF document
    const pdfDoc = pdfmake.createPdf(docDefinition, undefined, fonts);
    
    // Convert to buffer and return
    return new Promise((resolve, reject) => {
      pdfDoc.getBuffer((buffer) => {
        resolve(buffer);
      });
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}