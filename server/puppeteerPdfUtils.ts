import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

/**
 * Creates a PDF using puppeteer which can properly render Arabic text
 * by generating an HTML document and converting it to PDF
 * 
 * @param title PDF document title
 * @param data Table data rows
 * @param headers Table headers
 * @param dateStr Date string to display
 * @param refNumber Reference number to display
 * @returns PDF buffer
 */
export async function createArabicPDF(
  title: string,
  data: any[],
  headers: string[],
  dateStr: string,
  refNumber: string
): Promise<Buffer> {
  try {
    // Create HTML content with proper Arabic support
    const htmlContent = generateHtml(title, data, headers, dateStr, refNumber);
    
    // Launch puppeteer with chromium path
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/nix/store/p6s9v8kp640jdyj7a82vmxyr5pbqxsrh-chromium-112.0.5615.121/bin/chromium',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process'
      ]
    });
    
    try {
      const page = await browser.newPage();
      
      // Set content and wait for rendering
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        }
      });
      
      // Convert to proper NodeJS Buffer
      return Buffer.from(pdfBuffer as Buffer);
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Error generating PDF with puppeteer:', error);
    throw error;
  }
}

/**
 * Generates HTML content with Arabic support for the PDF
 */
function generateHtml(
  title: string,
  data: any[],
  headers: string[],
  dateStr: string,
  refNumber: string
): string {
  // Format the data for the table
  const tableRows = data.map(row => {
    return `<tr>
      ${row.map((cell: any) => `<td dir="auto">${escapeHtml(String(cell || ''))}</td>`).join('')}
    </tr>`;
  }).join('');
  
  // Format the headers
  const tableHeaders = headers.map(header => {
    return `<th dir="rtl">${escapeHtml(header)}</th>`;
  }).join('');
  
  // Read emblem image if available
  let emblemHtml = '';
  try {
    const emblemPath = path.join(process.cwd(), 'assets', 'syrian_emblem.png');
    if (fs.existsSync(emblemPath)) {
      // Convert to base64
      const emblemData = fs.readFileSync(emblemPath);
      const base64Emblem = emblemData.toString('base64');
      emblemHtml = `<img src="data:image/png;base64,${base64Emblem}" class="emblem" alt="Syrian Emblem" />`;
    }
  } catch (error) {
    console.error('Error with emblem:', error);
    // Continue without emblem if there's an error
  }
  
  // Generate full HTML document with Arabic support
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>تقرير معلومات الأعمال</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    body {
      font-family: Arial, sans-serif;
      direction: rtl;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 100%;
      margin: 0 auto;
    }
    .header {
      background-color: #006E51;
      color: white;
      padding: 15px 0;
      text-align: center;
      position: relative;
    }
    .emblem {
      width: 80px;
      height: auto;
      display: block;
      margin: 0 auto 10px;
    }
    h1, h2 {
      margin: 5px 0;
      text-align: center;
    }
    .info {
      display: flex;
      justify-content: space-between;
      margin: 15px 0;
      padding: 0 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: right;
    }
    th {
      background-color: #006E51;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    .footer {
      margin-top: 20px;
      border-top: 2px solid #006E51;
      padding-top: 10px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .signature {
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
      padding: 0 50px;
    }
    .signature-box {
      border-top: 1px solid #000;
      width: 200px;
      text-align: center;
      padding-top: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${emblemHtml}
      <h1>وزارة الاتصالات وتقانة المعلومات</h1>
      <h2>الجمهورية العربية السورية</h2>
    </div>
    
    <h2>${escapeHtml(title)}</h2>
    
    <div class="info">
      <div>تاريخ التقرير: ${escapeHtml(dateStr)}</div>
      <div>رقم المرجع: ${escapeHtml(refNumber)}</div>
    </div>
    
    <table>
      <thead>
        <tr>
          ${tableHeaders}
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
    
    <div class="signature">
      <div class="signature-box">
        التوقيع الرسمي
      </div>
      <div class="signature-box">
        الختم الرسمي
      </div>
    </div>
    
    <div class="footer">
      سري - للاستخدام الرسمي فقط
    </div>
  </div>
</body>
</html>`;
}

/**
 * Helper function to escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}