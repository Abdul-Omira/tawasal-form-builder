/**
 * Database Export Script for Syrian Ministry of Communication
 * This script exports all citizen communications data to an encrypted backup
 * 
 * @author Abdulwahab Omira <abdul@omiratech.com>
 * @version 1.0.0
 */

import { storage } from "./server/storage";
import { db } from "./server/db";
import { citizenCommunications, businessSubmissions, users } from "@shared/schema";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import * as fs from "fs";
import * as path from "path";
import { sql } from "drizzle-orm";
import { fileURLToPath } from "url";

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BACKUP_DIR = path.join(__dirname, "backups");
const BACKUP_PASSWORD = process.env.BACKUP_PASSWORD || "CHANGE_ME_IN_PRODUCTION";
const ENCRYPTION_ALGORITHM = "aes-256-gcm";

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Encryption helper functions
function encrypt(text: string, password: string): { encrypted: string; salt: string; iv: string; authTag: string } {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 32);
  const iv = randomBytes(12);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

async function exportData() {
  try {
    console.log("🔷 Starting database export...");
    
    // Get all data from the database
    console.log("📊 Fetching citizen communications...");
    const citizenComms = await db.select().from(citizenCommunications);
    console.log(`  Found ${citizenComms.length} citizen communications`);
    
    console.log("📊 Fetching business submissions...");
    const businessSubs = await db.select().from(businessSubmissions);
    console.log(`  Found ${businessSubs.length} business submissions`);
    
    console.log("📊 Fetching users...");
    const usersList = await db.select().from(users);
    // Remove sensitive password data from export
    const sanitizedUsers = usersList.map(user => ({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    }));
    console.log(`  Found ${sanitizedUsers.length} users`);
    
    // Get database statistics
    console.log("📊 Calculating statistics...");
    const stats = {
      citizenCommunications: {
        total: citizenComms.length,
        byStatus: citizenComms.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byType: citizenComms.reduce((acc, item) => {
          acc[item.communicationType] = (acc[item.communicationType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      businessSubmissions: {
        total: businessSubs.length,
        byStatus: businessSubs.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byType: businessSubs.reduce((acc, item) => {
          acc[item.businessType] = (acc[item.businessType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      users: {
        total: sanitizedUsers.length,
        admins: sanitizedUsers.filter(u => u.isAdmin).length
      }
    };
    
    // Prepare the backup data
    const backupData = {
      metadata: {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        exportedBy: "Database Export Script",
        databaseInfo: {
          citizenCommunicationsCount: citizenComms.length,
          businessSubmissionsCount: businessSubs.length,
          usersCount: sanitizedUsers.length
        }
      },
      data: {
        citizenCommunications: citizenComms,
        businessSubmissions: businessSubs,
        users: sanitizedUsers
      },
      statistics: stats
    };
    
    // Convert to JSON
    const jsonData = JSON.stringify(backupData, null, 2);
    
    // Create timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    // Save unencrypted backup (for verification)
    const unencryptedPath = path.join(BACKUP_DIR, `backup_${timestamp}_unencrypted.json`);
    fs.writeFileSync(unencryptedPath, jsonData);
    console.log(`✅ Unencrypted backup saved to: ${unencryptedPath}`);
    console.log(`   File size: ${(fs.statSync(unencryptedPath).size / 1024 / 1024).toFixed(2)} MB`);
    
    // Create encrypted backup
    console.log("🔐 Encrypting backup...");
    const encryptedData = encrypt(jsonData, BACKUP_PASSWORD);
    
    const encryptedBackup = {
      algorithm: ENCRYPTION_ALGORITHM,
      salt: encryptedData.salt,
      iv: encryptedData.iv,
      authTag: encryptedData.authTag,
      data: encryptedData.encrypted,
      metadata: {
        exportDate: new Date().toISOString(),
        recordCounts: {
          citizenCommunications: citizenComms.length,
          businessSubmissions: businessSubs.length,
          users: usersList.length
        }
      }
    };
    
    const encryptedPath = path.join(BACKUP_DIR, `backup_${timestamp}_encrypted.json`);
    fs.writeFileSync(encryptedPath, JSON.stringify(encryptedBackup, null, 2));
    console.log(`✅ Encrypted backup saved to: ${encryptedPath}`);
    console.log(`   File size: ${(fs.statSync(encryptedPath).size / 1024 / 1024).toFixed(2)} MB`);
    
    // Print summary
    console.log("\n📊 Export Summary:");
    console.log("==================");
    console.log(`Citizen Communications: ${citizenComms.length}`);
    console.log(`  - Pending: ${stats.citizenCommunications.byStatus.pending || 0}`);
    console.log(`  - In Progress: ${stats.citizenCommunications.byStatus['in-progress'] || 0}`);
    console.log(`  - Completed: ${stats.citizenCommunications.byStatus.completed || 0}`);
    console.log(`  - Approved: ${stats.citizenCommunications.byStatus.approved || 0}`);
    console.log(`  - Rejected: ${stats.citizenCommunications.byStatus.rejected || 0}`);
    console.log("\nBusiness Submissions: " + businessSubs.length);
    console.log(`  - Pending: ${stats.businessSubmissions.byStatus.pending || 0}`);
    console.log(`  - Approved: ${stats.businessSubmissions.byStatus.approved || 0}`);
    console.log(`  - Rejected: ${stats.businessSubmissions.byStatus.rejected || 0}`);
    console.log("\nUsers: " + usersList.length);
    console.log(`  - Admins: ${stats.users.admins}`);
    console.log(`  - Regular Users: ${stats.users.total - stats.users.admins}`);
    
    console.log("\n✅ Export completed successfully!");
    console.log(`📁 Backup files saved in: ${BACKUP_DIR}`);
    
    // Close database connection
    await db.$client.end();
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Export failed:", error);
    process.exit(1);
  }
}

// Run the export
exportData();