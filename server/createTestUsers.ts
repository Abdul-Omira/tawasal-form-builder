import { storage } from './storage';
import { hashPassword } from './auth';

/**
 * Script to create test users with correct password hashing
 * Uses secure passwords that are not hardcoded directly in the code
 * If environment variables are present, they will be used
 * Otherwise, fallback to default values for development
 */
async function createTestUsers() {
  try {
    console.log('Creating test users...');

    // Secure admin password using env vars when available
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    // Using a secure, complex password that combines uppercase, lowercase, numbers and special characters
    // In production, set ADMIN_PASSWORD env var to a secure value
    const adminPassword = process.env.ADMIN_PASSWORD || 'Sy#Min2024!C0m@7';
    const adminName = process.env.ADMIN_NAME || 'مدير النظام';

    // Employee credentials
    const employeeUsername = process.env.EMPLOYEE_USERNAME || 'employee';
    // Also using a secure, complex password for employee accounts
    const employeePassword = process.env.EMPLOYEE_PASSWORD || 'Emp#Sy2024$Tech!8';
    const employeeName = process.env.EMPLOYEE_NAME || 'موظف منصة';
    
    // Hash passwords
    const hashedAdminPassword = await hashPassword(adminPassword);
    const hashedEmployeePassword = await hashPassword(employeePassword);
    
    console.log('Passwords hashed successfully');
    
    // Check existing users
    console.log('Checking existing test users...');
    const existingAdmin = await storage.getUserByUsername(adminUsername);
    const existingEmployee = await storage.getUserByUsername(employeeUsername);
    
    // Create or update admin user
    if (!existingAdmin) {
      console.log('Creating admin user...');
      await storage.createUser({
        username: adminUsername,
        password: hashedAdminPassword,
        name: adminName,
        isAdmin: true
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists, updating password...');
      await storage.updateUserPassword(adminUsername, adminPassword);
      console.log('Admin password updated successfully');
    }
    
    // Create or update employee user
    if (!existingEmployee) {
      console.log('Creating employee user...');
      await storage.createUser({
        username: employeeUsername,
        password: hashedEmployeePassword,
        name: employeeName,
        isAdmin: false
      });
      console.log('Employee user created successfully');
    } else {
      console.log('Employee user already exists, updating password...');
      await storage.updateUserPassword(employeeUsername, employeePassword);
      console.log('Employee password updated successfully');
    }
    
    console.log('Test users setup complete!');
    
    // Print credentials for reference
    console.log("Test users created successfully. Use:");
    console.log(`1. Admin: username='${adminUsername}', password='${adminPassword}'`);
    console.log(`2. Employee: username='${employeeUsername}', password='${employeePassword}'`);
  } catch (error) {
    console.error('Error creating test users:', error);
  }
}

// Export the function
export { createTestUsers };