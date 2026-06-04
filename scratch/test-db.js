const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Read .env.local
const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    let value = parts.slice(1).join('=').trim();
    // remove quotes
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value;
  }
});

const mongoUrl = env.MONGODB_URL || env.MONGODB_URI;
console.log('Connecting to:', mongoUrl);

mongoose.connect(mongoUrl)
  .then(async () => {
    console.log('Connected to MongoDB successfully!');
    
    // Define a simple schema or access existing one
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema, 'users');
    
    const users = await User.find({}).lean();
    console.log('Users found:', users.map(u => ({
      _id: u._id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      roleTier: u.roleTier,
      teamId: u.teamId,
      orgId: u.orgId
    })));
    
    const teamSchema = new mongoose.Schema({}, { strict: false });
    const Team = mongoose.model('Team', teamSchema, 'teams');
    const teams = await Team.find({}).lean();
    console.log('Teams found:', teams);
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Connection failed:', err);
  });
