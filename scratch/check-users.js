const mongoose = require("mongoose");
const fs = require("fs");

let MONGODB_URI = "";
try {
  const envContent = fs.readFileSync(".env.local", "utf8");
  const lines = envContent.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("MONGODB_URI=")) {
      MONGODB_URI = trimmed.substring("MONGODB_URI=".length).replace(/['"]/g, "").trim();
    }
  }
} catch (e) {
  console.log("Could not read .env.local file:", e.message);
}

if (!MONGODB_URI) {
  MONGODB_URI = "mongodb+srv://amey35195_db_user:cHxVCLWzyN8IhsDy@cluster0.fh2bdx8.mongodb.net/?appName=Cluster0";
}

console.log("Connecting to URI:", MONGODB_URI);

const UserSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  role: String,
  roleTier: String,
  isActive: Boolean,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB!");
  const users = await User.find({});
  console.log("Registered users count:", users.length);
  for (const u of users) {
    console.log(`- Name: ${u.firstName} ${u.lastName}, Email: ${u.email}, Role: ${u.role}, RoleTier: ${u.roleTier}, IsActive: ${u.isActive}`);
  }
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
