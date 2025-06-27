const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Read existing data
const dataPath = path.join(__dirname, 'data.json');
let data;

try {
  const fileContent = fs.readFileSync(dataPath, 'utf8');
  data = JSON.parse(fileContent);
} catch (error) {
  console.error('Error reading data.json:', error);
  process.exit(1);
}

// Backup original data
const backupPath = path.join(__dirname, `data.backup.${Date.now()}.json`);
fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
console.log(`Backup created at: ${backupPath}`);

// Migrate passwords
let migratedCount = 0;
data.users = data.users.map(user => {
  // Check if password is already hashed (bcrypt hashes start with $2)
  if (user.password && !user.password.startsWith('$2')) {
    console.log(`Migrating password for user: ${user.username}`);
    user.password = bcrypt.hashSync(user.password, 10);
    migratedCount++;
  }
  return user;
});

// Save updated data
try {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log(`\nMigration complete! ${migratedCount} passwords hashed.`);
  
  // Show demo user passwords for reference
  console.log('\nDemo user credentials (save these, passwords are now hashed):');
  console.log('- demo-lead / lead123');
  console.log('- demo-senior / senior123');
  console.log('- demo-junior / junior123');
  console.log('- project-manager / pm123');
  console.log('- junior-qa / junior123');
} catch (error) {
  console.error('Error saving migrated data:', error);
  console.log('Restore from backup if needed:', backupPath);
  process.exit(1);
}