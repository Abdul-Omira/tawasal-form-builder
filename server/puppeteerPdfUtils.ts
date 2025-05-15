import puppeteer from 'puppeteer';

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
    const htmlContent = generateHtml(title, data, headers, dateStr, refNumber);
    
    // Launch puppeteer with minimal settings for Replit environment
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set the content and wait for rendering
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    return Buffer.from(pdfBuffer);
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
  // Generate table rows
  const rows = data.map(row => {
    return `<tr>${row.map((cell: any) => `<td>${escapeHtml(String(cell))}</td>`).join('')}</tr>`;
  }).join('');
  
  // Generate table headers
  const headerRow = `<tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr>`;
  
  // Return the complete HTML document
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 0;
      padding: 0;
      direction: rtl;
      background-color: white;
    }
    .container {
      max-width: 100%;
      margin: 0 auto;
      padding: 10px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      position: relative;
    }
    .emblem {
      width: 80px;
      height: auto;
      margin: 0 auto;
      display: block;
    }
    .title-bar {
      background-color: #006E51;
      color: white;
      padding: 10px;
      margin: 20px 0;
      text-align: center;
    }
    .ministry-name {
      font-size: 22px;
      font-weight: bold;
      margin: 0;
    }
    .report-title {
      font-size: 18px;
      margin: 10px 0;
      color: #006E51;
    }
    .metadata {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .metadata div {
      font-size: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background-color: #006E51;
      color: white;
      text-align: right;
      padding: 8px;
    }
    td {
      padding: 8px;
      border: 1px solid #ddd;
      text-align: right;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    .footer {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 2px solid #006E51;
      display: flex;
      justify-content: space-between;
    }
    .signature-area {
      width: 40%;
    }
    .signature-area h4 {
      margin-bottom: 30px;
    }
    .confidential {
      text-align: center;
      font-size: 12px;
      color: #006E51;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="text-align: center;">الجمهورية العربية السورية</h1>
      <div class="title-bar">
        <h2 class="ministry-name">وزارة الاتصالات</h2>
      </div>
      <h3 class="report-title">${escapeHtml(title)}</h3>
    </div>
    
    <div class="metadata">
      <div>تاريخ التقرير: ${escapeHtml(dateStr)}</div>
      <div>رقم المرجع: ${escapeHtml(refNumber)}</div>
    </div>
    
    <table>
      <thead>
        ${headerRow}
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    
    <div class="footer">
      <div class="signature-area">
        <h4>التوقيع الرسمي:</h4>
        <div style="height: 30px;"></div>
      </div>
      <div class="signature-area">
        <h4>الختم الرسمي:</h4>
        <div style="height: 30px;"></div>
      </div>
    </div>
    
    <div class="confidential">
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