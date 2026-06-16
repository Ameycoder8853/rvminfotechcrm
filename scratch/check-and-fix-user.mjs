import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://amey35195_db_user:cHxVCLWzyN8IhsDy@ac-wfjhlb0-shard-00-00.fh2bdx8.mongodb.net:27017,ac-wfjhlb0-shard-00-01.fh2bdx8.mongodb.net:27017,ac-wfjhlb0-shard-00-02.fh2bdx8.mongodb.net:27017/rvminfotech?ssl=true&replicaSet=atlas-535x8l-shard-0&authSource=admin&retryWrites=true&w=majority";
const CLERK_SECRET_KEY = "sk_test_AvdVeISQYd32VK0xhBOaPRivERA8XadTahgBjJpBZr";

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully.");

  // Define User schema inline to avoid Next.js import issues
  const userSchema = new mongoose.Schema({
    clerkId: String,
    email: String,
    firstName: String,
    lastName: String,
    role: String,
    roleTier: String,
  }, { collection: 'users' });

  const User = mongoose.models.User || mongoose.model('User', userSchema);

  const targetEmail = "amey35195@gmail.com";
  console.log(`Searching for user: ${targetEmail}`);
  const user = await User.findOne({ email: targetEmail });

  if (!user) {
    console.error(`User with email ${targetEmail} not found in MongoDB!`);
    
    // Let's print all users to see who is in the DB
    const allUsers = await User.find({});
    console.log("Users in DB:");
    allUsers.forEach(u => {
      console.log(`- ${u.firstName} ${u.lastName} (${u.email}) [roleTier: ${u.roleTier}, role: ${u.role}, clerkId: ${u.clerkId}]`);
    });
  } else {
    console.log(`Found user in MongoDB:`, {
      _id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleTier: user.roleTier,
      role: user.role
    });

    if (user.roleTier !== 'super_admin' || user.role !== 'admin') {
      console.log("Updating roleTier to 'super_admin' and role to 'admin' in MongoDB...");
      user.roleTier = 'super_admin';
      user.role = 'admin';
      await user.save();
      console.log("MongoDB update successful.");
    } else {
      console.log("User already has super_admin roleTier and admin role in MongoDB.");
    }

    if (user.clerkId) {
      console.log(`Updating Clerk metadata for clerkId: ${user.clerkId}...`);
      try {
        const res = await fetch(`https://api.clerk.com/v1/users/${user.clerkId}/metadata`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            public_metadata: {
              roleTier: 'super_admin',
              role: 'admin'
            }
          })
        });
        if (res.ok) {
          const data = await res.json();
          console.log("Successfully updated Clerk user metadata:", data);
        } else {
          const errText = await res.text();
          console.error("Failed to update Clerk metadata:", res.status, errText);
        }
      } catch (err) {
        console.error("Error updating Clerk metadata:", err);
      }
    } else {
      console.warn("User has no clerkId associated in MongoDB.");
    }
  }

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

run().catch(console.error);
