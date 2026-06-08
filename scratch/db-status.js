const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Parse .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  lines.forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join('=').trim();
      // Remove surrounding quotes if any
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
  });
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not found in env!");
  process.exit(1);
}

// User Schema mapping
const UserSchema = new mongoose.Schema({
  clerkId: String,
  email: String,
  firstName: String,
  lastName: String,
  role: String,
  roleTier: String,
  isActive: Boolean,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
  try {
    await mongoose.connect(uri);
    const users = await User.find({});
    console.log("=== REGISTERED USERS ===");
    users.forEach(u => {
      console.log(`- ID: ${u._id}, Email: ${u.email}, Name: ${u.firstName} ${u.lastName}, Role: ${u.role}, RoleTier: ${u.roleTier}, clerkId: ${u.clerkId}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
