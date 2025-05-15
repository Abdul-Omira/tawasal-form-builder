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
    // Create a PDF document with simple settings
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Add header bar with simple color
    doc.setFillColor(0, 110, 81); // Ministry green
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    // Add title text in white
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('Ministry of Communications', pageWidth / 2, 12, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Syrian Arab Republic', pageWidth / 2, 20, { align: 'center' });
    
    // Reset to black text
    doc.setTextColor(0, 0, 0);
    
    // Add report title
    doc.setFontSize(16);
    doc.text('Business Information Report', pageWidth / 2, 45, { align: 'center' });
    
    // Add metadata in English only for reliability
    doc.setFontSize(11);
    doc.text(`Report Date: ${dateStr}`, 20, 55);
    doc.text(`Reference #: ${refNumber}`, pageWidth - 20, 55, { align: 'right' });
    
    // Create simple English headers and use built-in fonts
    const simpleHeaders = headers.map(header => {
      // Transliteration mapping for common Arabic headers
      const headerMap: Record<string, string> = {
        // Arabic headers
        'تاريخ التقديم': 'Date Submitted',
        'الحالة': 'Status',
        'المحافظة': 'Province',
        'رقم الهاتف': 'Phone',
        'البريد الإلكتروني': 'Email',
        'اسم المسؤول': 'Contact Name',
        'نوع النشاط': 'Business Type',
        'اسم الشركة': 'Company Name',
        'رقم الطلب': 'ID',
        'معلومات العقوبات': 'Sanctions Information',
        'تفاصيل التحديات': 'Challenge Details',
        'الشركة الأجنبية التي لا يمكن التعامل معها': 'Foreign Company Blocked by Sanctions',
        
        // Database field names
        'businessName': 'Business Name (اسم الشركة)',
        'businessType': 'Business Type (نوع النشاط)',
        'establishmentDate': 'Est. Date (تاريخ التأسيس)',
        'employeesCount': 'Employees (عدد الموظفين)',
        'address': 'Address (العنوان)',
        'governorate': 'Governorate (المحافظة)',
        'registrationNumber': 'Reg. Number (رقم التسجيل)',
        'contactName': 'Contact Name (اسم المسؤول)',
        'position': 'Position (المنصب)',
        'email': 'Email (البريد الإلكتروني)',
        'phone': 'Phone (رقم الهاتف)',
        'alternativeContact': 'Alt. Contact (الاتصال البديل)',
        'website': 'Website (الموقع الإلكتروني)',
        'challenges': 'Challenges (التحديات)',
        'challengeDetails': 'Challenge Details (تفاصيل التحديات)',
        'techNeeds': 'Tech Needs (الاحتياجات التقنية)',
        'techDetails': 'Tech Details (تفاصيل الاحتياجات)',
        'consentToDataUse': 'Data Consent (الموافقة على استخدام البيانات)',
        'wantsUpdates': 'Wants Updates (يرغب في التحديثات)',
        'additionalComments': 'Comments (تعليقات إضافية)',
        'sanctionedCompanyName': 'Sanctioned Company (الشركة الخاضعة للعقوبات)',
        'sanctionedCompanyLink': 'Sanction Link (رابط العقوبات)',
        'status': 'Status (الحالة)',
        'createdAt': 'Created At (تاريخ الإنشاء)',
        'id': 'ID (رقم الطلب)'
      };
      
      return headerMap[header] || header;
    });
    
    // Use autoTable with reliable settings
    autoTable(doc, {
      startY: 65,
      head: [simpleHeaders],
      body: data,
      theme: 'grid',
      headStyles: { 
        fillColor: [0, 110, 81],
        textColor: [255, 255, 255],
        halign: 'center',
        valign: 'middle',
        fontStyle: 'bold'
      },
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 3
      }
    });
    
    // Add footer with green line
    doc.setDrawColor(0, 110, 81);
    doc.setLineWidth(1);
    doc.line(10, pageHeight - 20, pageWidth - 10, pageHeight - 20);
    
    // Add confidential text
    doc.setFontSize(8);
    doc.setTextColor(0, 110, 81);
    doc.text('CONFIDENTIAL - MINISTRY OF COMMUNICATIONS - SYRIAN ARAB REPUBLIC', 
             pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.text('سري - للاستخدام الرسمي فقط - وزارة الاتصالات - الجمهورية العربية السورية', 
             pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Convert to buffer
    return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}