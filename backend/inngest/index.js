import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "Flowgrid"});

// Inngest function to save user data in database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },

  async ({ event }) => {
    const { data } = event; 

    // SAFETY CHECK: Ensure data and ID exist
    if (!data || !data.id) {
        return; 
    }

    await prisma.user.create({
      data: {
        id: data.id,
        // Use optional chaining (?.) to prevent crashes if fields are missing
        email: data.email_addresses?.[0]?.email_address,
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        image: data.image_url,
      }
    });

    return { success: true };
  }
)

// Inngest function to delete user data from database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },

  async ({ event, step }) => {
    const user = event.data; 

    // SAFETY CHECK: Already existing, keeping it as is
    if (!user?.id) {
      console.error("Clerk user.deleted missing ID:", user);
      return;
    }

    await step.run("delete-user-in-db", async () => {
      await prisma.user.delete({
        where: {
          id: user.id,
        },
      });
    });

    return { success: true };
  }
)

// Inngest function to update user data
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },

  async ({ event, step }) => {
    const data = event.data;

    // SAFETY CHECK: avoid Prisma crash if id missing
    if (!data?.id) {
      console.error("User update payload missing ID:", data);
      return { success: false };
    }

    await step.run("update-user-in-db", async () => {
      await prisma.user.update({
        where: { id: data.id },
        data: {
          // Update email only if Clerk sent a new email
          ...(data.email_addresses?.[0]?.email_address && {
            email: data.email_addresses[0].email_address,
          }),

          // Update name if either first_name or last_name was updated
          ...( (data.first_name || data.last_name) && {
            name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          }),

          // Update profile image only if changed
          ...(data.image_url && {
            image: data.image_url,
          }),
        },
      });
    });

    return { success: true };
  }
)

// Inngest function to manage clerk organization creation webhook
const syncWorkspaceCreation = inngest.createFunction(
  { id: "sync-workspace-from-clerk" },
  { event: "clerk/organization.created" },

  async ({ event }) => {
    const { data } = event;

    // SAFETY CHECK: Prevent crash if data is missing
    if (!data || !data.id) {
        return;
    }

    await prisma.workspace.create({
      data:{
        id: data.id,
        name: data.name,
        slug: data.slug,
        ownerId: data.created_by,
        image_url: data.image_url,
      }
    })

    //Add creator as ADMIN
    await prisma.workspaceMember.create({
      data:{
        userId: data.created_by,
        workspaceId: data.id,
        role: "ADMIN"
      }
    })
  }
)

// Inngest Function to update workspace data in database
const syncWorkspaceUpdation = inngest.createFunction(
  { id: "update-workspace-from-clerk" },
  { event: "clerk/organization.updated" },

  async ({ event }) => {
    // FIX: Grab data from event, not event.data
    const { data } = event;

    // SAFETY CHECK: Prevent crash if data is missing
    if (!data || !data.id) {
        return;
    }

    await prisma.workspace.update({
      where:{
        id: data.id
      },
      data:{
        name: data.name,
        slug: data.slug,
        image_url: data.image_url
      }
    })
  }
)

// Inngest Function to Delete workspace data in database
const syncWorkspaceDeletion = inngest.createFunction(
  { id: "delete-workspace-with-clerk" },
  { event: "clerk/organization.deleted" },

  async ({ event }) => {
    const { data } = event;
    
    // SAFETY CHECK: Prevent crash if data is missing
    if (!data || !data.id) {
        return;
    }

    await prisma.workspace.delete({
      where:{
        id: data.id
      }
    })
  }
)

// Inngest function to save workspace member data into the database
const syncWorkspaceMemberCreation = inngest.createFunction(
  { id: "sync-workspace-member-from-clerk" },
  { event: "clerk/organizationInvitation.accepted" },

  async ({ event }) => {
    const { data } = event;

    // SAFETY CHECK: Ensure specific member fields exist
    if (!data || !data.user_id || !data.organization_id) {
        return;
    }

    await prisma.workspaceMember.create({
      data:{
        userId: data.user_id,
        workspaceId: data.organization_id,
        role: String(data.role_name).toUpperCase(),
      }
    })
  }
);

// Exporting Inngest functions
 export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  syncWorkspaceCreation,
  syncWorkspaceMemberCreation,
  syncWorkspaceDeletion,
  syncWorkspaceUpdation
];