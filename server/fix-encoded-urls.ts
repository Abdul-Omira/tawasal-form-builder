/**
 * Script to fix encoded attachment URLs in the database
 * This will decode HTML entities in attachment URLs that were incorrectly encoded
 */

import { db } from "./db";
import { citizenCommunications } from "@shared/schema";
import { sql } from "drizzle-orm";

async function fixEncodedUrls() {
  console.log("🔧 Starting to fix encoded attachment URLs...");
  
  try {
    // Get all citizen communications with attachment URLs
    const communications = await db
      .select({
        id: citizenCommunications.id,
        attachmentUrl: citizenCommunications.attachmentUrl
      })
      .from(citizenCommunications)
      .where(sql`${citizenCommunications.attachmentUrl} IS NOT NULL`);
    
    console.log(`📊 Found ${communications.length} communications with attachments`);
    
    let fixedCount = 0;
    
    for (const comm of communications) {
      if (comm.attachmentUrl && comm.attachmentUrl.includes('&#x2F;')) {
        // Decode HTML entities
        const decodedUrl = comm.attachmentUrl
          .replace(/&#x2F;/g, '/')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'");
        
        console.log(`🔄 Fixing URL for communication #${comm.id}:`);
        console.log(`   Old: ${comm.attachmentUrl}`);
        console.log(`   New: ${decodedUrl}`);
        
        // Update the URL in the database
        await db
          .update(citizenCommunications)
          .set({ attachmentUrl: decodedUrl })
          .where(sql`${citizenCommunications.id} = ${comm.id}`);
        
        fixedCount++;
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} encoded URLs`);
    console.log("🎉 Database cleanup complete!");
    
  } catch (error) {
    console.error("❌ Error fixing URLs:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the fix
fixEncodedUrls();