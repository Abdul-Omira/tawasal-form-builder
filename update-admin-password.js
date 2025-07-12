import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, 64)).toString('hex');
  return `${hash}.${salt}`;
}

async function updateAdminPassword() {
  try {
    const password = 'Syria@MOCT#2024$Admin!';
    const hashedPassword = await hashPassword(password);
    
    console.log('Hashed password:', hashedPassword);
    
    // Connect to database and update
    const { Client } = await import('pg');
    const client = new Client({
      connectionString: 'postgres://postgres:SyriaDB@2024!Secure@localhost:5432/ministry_communication'
    });
    
    await client.connect();
    
    const result = await client.query(
      'UPDATE users SET password = $1 WHERE username = $2',
      [hashedPassword, 'admin']
    );
    
    console.log('Admin password updated successfully');
    await client.end();
    
  } catch (error) {
    console.error('Error updating password:', error);
  }
}

updateAdminPassword(); 