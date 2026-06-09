const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Read .env.local
const envPath = path.join(__dirname, "../.env.local");
let mongodbUri = "";
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const urlMatch = envContent.match(/MONGODB_URL\s*=\s*([^\r\n]+)/) || envContent.match(/MONGODB_URI\s*=\s*([^\r\n]+)/);
  if (urlMatch) {
    mongodbUri = urlMatch[1].trim().replace(/['"]/g, "");
  }
}

if (!mongodbUri) {
  console.error("Could not find MONGODB_URL or MONGODB_URI in .env.local");
  process.exit(1);
}

console.log("Connecting to:", mongodbUri.split("@").pop()); // Log only the host part for security

const UserSchema = new mongoose.Schema({
  email: String,
  roleTier: String,
  teamId: mongoose.Schema.Types.ObjectId,
  permissions: Object,
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const TeamSchema = new mongoose.Schema({
  name: String,
  permissions: Object,
});
const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema);

async function run() {
  try {
    await mongoose.connect(mongodbUri);
    console.log("Connected successfully!");

    const users = await User.find({}).lean();
    console.log(`Found ${users.length} users:`);
    for (const u of users) {
      console.log(`- ${u.email} [${u.roleTier}] teamId: ${u.teamId}`);
      console.log(`  permissions:`, JSON.stringify(u.permissions));
      if (u.teamId) {
        const team = await Team.findById(u.teamId).lean();
        if (team) {
          console.log(`  team: ${team.name} permissions:`, JSON.stringify(team.permissions));
        } else {
          console.log(`  team not found!`);
        }
      }
    }
  } catch (err) {
    console.error("Error connecting or querying:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
