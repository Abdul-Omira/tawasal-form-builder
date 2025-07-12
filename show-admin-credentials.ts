import { storage } from './server/storage';

async function showAdminCredentials() {
  try {
    console.log('🇸🇾 SYRIAN MINISTRY PLATFORM - ADMIN ACCESS');
    console.log('='.repeat(60));
    
    // For development/testing, let's set known credentials
    const testCredentials = {
      admin: {
        username: 'admin',
        password: 'Admin2024Ministry',
        name: 'مدير منصة وزارة الاتصالات'
      },
      employee: {
        username: 'employee', 
        password: 'Employee2024Ministry',
        name: 'موظف منصة وزارة الاتصالات'
      }
    };
    
    console.log('🔑 ADMIN CREDENTIALS FOR TESTING:');
    console.log('');
    console.log('1. PRIMARY ADMIN:');
    console.log(`   Username: ${testCredentials.admin.username}`);
    console.log(`   Password: ${testCredentials.admin.password}`);
    console.log('');
    console.log('2. SECONDARY ADMIN:');
    console.log(`   Username: ${testCredentials.employee.username}`);
    console.log(`   Password: ${testCredentials.employee.password}`);
    console.log('');
    console.log('🌐 ACCESS INFORMATION:');
    console.log('   Admin Panel: http://localhost:3000/admin');
    console.log('   Login URL: http://localhost:3000/admin');
    console.log('');
    console.log('📋 TESTING CHECKLIST:');
    console.log('   □ Login to admin panel');
    console.log('   □ View citizen communications');
    console.log('   □ Test pagination');
    console.log('   □ Test filtering and search');
    console.log('   □ Update communication status');
    console.log('   □ Test email functionality');
    console.log('   □ Check statistics dashboard');
    console.log('');
    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   • These are test credentials');
    console.log('   • Change passwords after testing');
    console.log('   • Use strong passwords in production');
    console.log('   • Enable 2FA if available');
    console.log('='.repeat(60));
    
    // Try to update the database with these test credentials
    try {
      const { hashPassword } = await import('./server/auth');
      
      // Hash the passwords
      const hashedAdminPassword = await hashPassword(testCredentials.admin.password);
      const hashedEmployeePassword = await hashPassword(testCredentials.employee.password);
      
      // Check if users exist and update/create them
      const existingAdmin = await storage.getUserByUsername('admin');
      if (existingAdmin) {
        await storage.updateUserPassword('admin', testCredentials.admin.password);
        console.log('✅ Admin password updated in database');
      } else {
        await storage.createUser({
          username: 'admin',
          password: hashedAdminPassword,
          name: testCredentials.admin.name,
          isAdmin: true
        });
        console.log('✅ Admin user created in database');
      }
      
      const existingEmployee = await storage.getUserByUsername('employee');
      if (existingEmployee) {
        await storage.updateUserPassword('employee', testCredentials.employee.password);
        console.log('✅ Employee password updated in database');
      } else {
        await storage.createUser({
          username: 'employee',
          password: hashedEmployeePassword,
          name: testCredentials.employee.name,
          isAdmin: true
        });
        console.log('✅ Employee user created in database');
      }
      
      console.log('');
      console.log('✅ DATABASE UPDATED - You can now login with the credentials above!');
      
    } catch (dbError) {
      console.log('⚠️  Database update failed, but you can still try the credentials above');
      console.log('   The server will create/update users on startup');
    }
    
  } catch (error) {
    console.error('Error showing admin credentials:', error);
  }
}

showAdminCredentials();