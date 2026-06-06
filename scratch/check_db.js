const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach(line => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      process.env[key] = val;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URL || process.env.MONGODB_URI;
console.log("Using URI:", MONGODB_URI);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB!");

    const UserSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model("User", UserSchema, "users");

    const TeamSchema = new mongoose.Schema({}, { strict: false });
    const Team = mongoose.model("Team", TeamSchema, "teams");

    const users = await User.find({}).lean();
    console.log("\n=== USERS ===");
    users.forEach(u => {
      console.log(`Email: ${u.email}, RoleTier: ${u.roleTier}, Role: ${u.role}, TeamId: ${u.teamId}`);
    });

    const teams = await Team.find({}).lean();
    console.log("\n=== TEAMS ===");
    teams.forEach(t => {
      console.log(`Name: ${t.name}, Permissions:`, JSON.stringify(t.permissions));
    });

  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
