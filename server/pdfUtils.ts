import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';

// Path to IBM Plex Sans Arabic fonts in node_modules
const IBM_PLEX_SANS_ARABIC_REGULAR_PATH = path.join(
  process.cwd(),
  'node_modules/@ibm/plex/IBM-Plex-Sans-Arabic/fonts/complete/woff/IBMPlexSansArabic-Regular.woff'
);

const IBM_PLEX_SANS_ARABIC_BOLD_PATH = path.join(
  process.cwd(),
  'node_modules/@ibm/plex/IBM-Plex-Sans-Arabic/fonts/complete/woff/IBMPlexSansArabic-Bold.woff'
);

/**
 * Adds IBM Plex Sans Arabic fonts to a jsPDF document
 * @param doc The jsPDF document
 * @returns The jsPDF document with IBM Plex Sans Arabic fonts added
 */
export function addIBMPlexSansArabicFonts(doc: jsPDF): jsPDF {
  try {
    // Check if font files exist
    if (fs.existsSync(IBM_PLEX_SANS_ARABIC_REGULAR_PATH)) {
      // Add regular font
      const regularFontData = fs.readFileSync(IBM_PLEX_SANS_ARABIC_REGULAR_PATH);
      doc.addFileToVFS('IBMPlexSansArabic-Regular.woff', Buffer.from(regularFontData).toString('base64'));
      doc.addFont('IBMPlexSansArabic-Regular.woff', 'IBMPlexSansArabic', 'normal');
      
      console.log('IBM Plex Sans Arabic Regular font loaded successfully');
    } else {
      console.warn('IBM Plex Sans Arabic Regular font file not found at:', IBM_PLEX_SANS_ARABIC_REGULAR_PATH);
    }
    
    // Add bold font if it exists
    if (fs.existsSync(IBM_PLEX_SANS_ARABIC_BOLD_PATH)) {
      const boldFontData = fs.readFileSync(IBM_PLEX_SANS_ARABIC_BOLD_PATH);
      doc.addFileToVFS('IBMPlexSansArabic-Bold.ttf', Buffer.from(boldFontData).toString('base64'));
      doc.addFont('IBMPlexSansArabic-Bold.ttf', 'IBMPlexSansArabic', 'bold');
      
      console.log('IBM Plex Sans Arabic Bold font loaded successfully');
    } else {
      console.warn('IBM Plex Sans Arabic Bold font file not found at:', IBM_PLEX_SANS_ARABIC_BOLD_PATH);
    }
  } catch (error) {
    console.error('Error adding IBM Plex Sans Arabic fonts:', error);
    // Continue without custom fonts if there's an error
  }
  
  return doc;
}

/**
 * Creates a PDF document with proper Arabic text support
 * @returns A jsPDF document with Arabic support
 */
export function createArabicSupportedPDF(options: any = {}): jsPDF {
  // Create PDF with default settings for Arabic
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    ...options,
  });
  
  // Setup for RTL text
  doc.setR2L(true);
  
  // Add IBM Plex Sans Arabic fonts
  try {
    addIBMPlexSansArabicFonts(doc);
    
    // Set the font to IBM Plex Sans Arabic if available
    doc.setFont('IBMPlexSansArabic');
  } catch (error) {
    console.error('Error setting up Arabic fonts:', error);
    // Fallback to default font if there's an error
  }
  
  return doc;
}