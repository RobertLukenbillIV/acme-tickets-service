// Quick script to generate bcrypt password hash for demo user
// Run: node demo-site/generate-password-hash.js

const bcrypt = require('bcrypt');

const password = 'SecurePass123!';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  
  console.log('\n=== Password Hash Generated ===\n');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nUse this SQL to create the demo user:\n');
  console.log(`INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "tenantId", "isActive", "createdAt", "updatedAt")`);
  console.log(`VALUES (`);
  console.log(`  '2fcbb813-1e3f-41cf-b81a-2d404f891e12',`);
  console.log(`  'admin@demo.com',`);
  console.log(`  '${hash}',`);
  console.log(`  'Admin',`);
  console.log(`  'User',`);
  console.log(`  'ADMIN',`);
  console.log(`  '550e8400-e29b-41d4-a716-446655440000',`);
  console.log(`  true,`);
  console.log(`  NOW(),`);
  console.log(`  NOW()`);
  console.log(`);\n`);
});
