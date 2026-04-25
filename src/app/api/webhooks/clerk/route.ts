import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing CLERK_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const eventType = evt.type;

  switch (eventType) {
    case "user.created": {
      const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;
      const primaryEmail = email_addresses[0]?.email_address || "";

      await User.create({
        clerkId: id,
        email: primaryEmail,
        firstName: first_name || "",
        lastName: last_name || "",
        avatar: image_url || "",
        role: (public_metadata?.role as string) || "sales",
        isActive: true,
      });

      break;
    }

    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;
      const primaryEmail = email_addresses[0]?.email_address || "";

      await User.findOneAndUpdate(
        { clerkId: id },
        {
          email: primaryEmail,
          firstName: first_name || "",
          lastName: last_name || "",
          avatar: image_url || "",
          role: (public_metadata?.role as string) || "sales",
        },
        { upsert: true, new: true }
      );

      break;
    }

    case "user.deleted": {
      const { id } = evt.data;
      await User.findOneAndUpdate(
        { clerkId: id },
        { isActive: false }
      );
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
