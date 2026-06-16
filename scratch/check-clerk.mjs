const CLERK_SECRET_KEY = "sk_test_AvdVeISQYd32VK0xhBOaPRivERA8XadTahgBjJpBZr";

async function run() {
  const email = "amey35195@gmail.com";
  console.log(`Searching Clerk for email: ${email}...`);
  try {
    const res = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Clerk API error:", res.status, errText);
      return;
    }

    const users = await res.json();
    console.log(`Found ${users.length} users in Clerk.`);
    
    if (users.length === 0) {
      console.log("No user found in Clerk with email:", email);
      return;
    }

    for (const user of users) {
      console.log(`User: ${user.first_name} ${user.last_name} (${email})`);
      console.log(`ID: ${user.id}`);
      console.log(`Current Public Metadata:`, user.public_metadata);

      console.log("Updating Clerk metadata to super_admin via PATCH...");
      const updateRes = await fetch(`https://api.clerk.com/v1/users/${user.id}/metadata`, {
        method: 'PATCH',
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

      if (updateRes.ok) {
        const updatedUser = await updateRes.json();
        console.log("Successfully updated Clerk user metadata:", updatedUser.public_metadata);
      } else {
        const errText = await updateRes.text();
        console.error("Failed to update Clerk metadata:", updateRes.status, errText);
      }
    }
  } catch (err) {
    console.error("Error during Clerk fetch:", err);
  }
}

run();
