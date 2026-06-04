import fs from "fs";
import path from "path";

// Load MONGODB_URI before dynamic imports execute
try {
  const content = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf8");
  const match = content.match(/MONGODB_URI=(.*)/);
  if (match) {
    let uri = match[1].trim();
    if (uri.startsWith('"') && uri.endsWith('"')) {
      uri = uri.substring(1, uri.length - 1);
    }
    process.env.MONGODB_URI = uri;
  }
} catch (e) {
  console.error("Failed to parse env file", e);
}

async function run() {
  // Dynamic imports avoid compile-time hoisting errors on process.env evaluation
  const { connectToDatabase } = await import("../src/lib/mongodb");
  const { default: User } = await import("../src/models/User");

  await connectToDatabase();
  const users = await User.find({}).lean();
  console.log("USERS IN DATABASE:");
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
