/* eslint-disable camelcase */
import { clerkClient } from "@clerk/clerk-sdk-node";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

export async function POST(req: Request): Promise<Response> {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing WEBHOOK_SECRET in environment variables.");
    return new Response("Server configuration error", { status: 500 });
  }

  // Await headers and ensure they return strings
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If headers are null, return a 400 response
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing required webhook headers", { status: 400 });
  }

  // Explicitly cast or provide default values to ensure these are treated as strings
  const svixIdString = svix_id as string;
  const svixTimestampString = svix_timestamp as string;
  const svixSignatureString = svix_signature as string;

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svixIdString, // Explicitly pass strings
      "svix-timestamp": svixTimestampString,
      "svix-signature": svixSignatureString,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  const eventType = evt.type;

  try {
    switch (eventType) {
      case "user.created": {
        const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

        if (!email_addresses?.[0]?.email_address) {
          console.error("No email address provided in user.created event.");
          return new Response("Invalid user data", { status: 400 });
        }

        const user = {
          clerkId: id,
          email: email_addresses[0].email_address,
          username: username || "",
          firstName: first_name || "",
          lastName: last_name || "",
          photo: image_url || "",
        };

        const newUser = await createUser(user);

        if (newUser) {
          await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: {
              userId: newUser._id,
            },
          });
        }

        return NextResponse.json({ message: "User created successfully", user: newUser });
      }

      case "user.updated": {
        const { id, image_url, first_name, last_name, username } = evt.data;

        const user = {
          firstName: first_name || "",
          lastName: last_name || "",
          username: username || "",
          photo: image_url || "",
        };

        const updatedUser = await updateUser(id, user);

        return NextResponse.json({ message: "User updated successfully", user: updatedUser });
      }

      case "user.deleted": {
        const { id } = evt.data;

        const deletedUser = await deleteUser(id as string);

        return NextResponse.json({ message: "User deleted successfully", user: deletedUser });
      }

      default: {
        console.log(`Unhandled webhook event type: ${eventType}`);
        return new Response("Unhandled event type", { status: 400 });
      }
    }
  } catch (error) {
    console.error(`Error processing webhook for event type ${eventType}:`, error);
    return new Response("Internal server error", { status: 500 });
  }
}
