import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "Syncra" });

//Inngest function to save user data in database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },

  async ({ event, step }) => {

    const data = event.data;

    await step.run("create-user-in-db", async () => {
      await prisma.user.create({
        data: {
          id: data.id,
          email: data?.email_addresses?.[0]?.email_address || null,
          name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
          image: data?.image_url || null,
        },
      });
    });

  }
);

// Inngest function to delete user data from database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },

  async ({ event, step }) => {

    const data = event.data;

    await step.run("delete-user-in-db", async () => {
      await prisma.user.delete({
        where: {
          id: data.id,
        },
      });
    });

  }
);


// Inngest function to update user data safely in the database
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },

  async ({ event, step }) => {

    const data = event.data;

    await step.run("update-user-in-db", async () => {
      await prisma.user.update({
        where: { id: data.id },
        data: {
          // Update email only if Clerk sent email
          // ... -> spread operator
          ...(data.email_addresses?.[0]?.email_address && {
            email: data.email_addresses[0].email_address,
          }),

          // Update name only if Clerk sent first_name or last_name
          ...(data.first_name && {
            name: `${data.first_name} ${data.last_name || ""}`.trim(),
          }),

          // Update image only if profile image exists
          ...(data.image_url && {
            image: data.image_url,
          }),
        },
      });
    });

  }
);



// Create an empty array where we'll export future Inngest functions
export const functions = [
 syncUserCreation,
 syncUserDeletion,
 syncUserUpdation
];