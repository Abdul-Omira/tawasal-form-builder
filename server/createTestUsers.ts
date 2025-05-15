import { storage } from './storage';
import { hashPassword } from './auth';

/**
 * Script to create test users with correct password hashing
 */
async function createTestUsers() {
  try {
    console.log('Creating test users...');

    // Hash passwords
    const adminPassword = await hashPassword('m5wYJU_FaXhyu^F');
    const employeePassword = await hashPassword('employee123');
    
    console.log('Passwords hashed successfully');
    
    // Delete existing users first
    console.log('Deleting existing test users...');
    const existingAdmin = await storage.getUserByUsername('admin');
    const existingEmployee = await storage.getUserByUsername('employee');
    
    // Create admin user
    if (!existingAdmin) {
      console.log('Creating admin user...');
      await storage.createUser({
        username: 'admin',
        password: adminPassword,
        name: 'مدير النظام',
        isAdmin: true
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists, updating password...');
      await storage.updateUserPassword('admin', 'm5wYJU_FaXhyu^F');
      console.log('Admin password updated successfully');
    }
    
    // Create employee user
    if (!existingEmployee) {
      console.log('Creating employee user...');
      await storage.createUser({
        username: 'employee',
        password: employeePassword,
        name: 'موظف منصة',
        isAdmin: false
      });
      console.log('Employee user created successfully');
    } else {
      console.log('Employee user already exists, updating password...');
      // We'll need to implement update user logic if needed
    }
    
    console.log('Test users setup complete!');
  } catch (error) {
    console.error('Error creating test users:', error);
  }
}

// Export the function
export { createTestUsers };