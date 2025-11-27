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


// Inngest function to manage clerk organization creation webhook
const syncWorkspaceCreation = inngest.createFunction(
  { id: "sync-workspace-from-clerk" },
  { event: "clerk/organization.created" },

  async ({ event }) => {
    const org = event.data;

    // Safety check
    if (!org?.id || !org?.name) {
      console.error("Invalid organization data:", org);
      return;
    }

    // Create workspace
    await prisma.workspace.create({
      data: {
        id: org.id,
        name: org.name,
        slug: org.slug || org.name.toLowerCase().replace(/\s+/g, "-"),
        ownerId: org.created_by || null,
        image_url: org.image_url || null,
      },
    });

    // Add creator as ADMIN in workspace_members
    await prisma.workspaceMember.create({
      data: {
        userId: org.created_by, // user who created the org
        workspaceId: org.id,    // id of the workspace
        role: "ADMIN",
      },
    });
  }
);

// Inngest Function to update workspace data in database
const syncWorkspaceUpdation = inngest.createFunction(
  { id: "update-workspace-from-clerk" },
  { event: "clerk/organization.updated" },

  async ({ event }) => {
    const org = event.data;

    // Safety: ensure valid payload
    if (!org?.id) {
      console.error("Invalid organization update data:", org);
      return;
    }

    await prisma.workspace.update({
      where: { id: org.id },
      data: {
        name: org.name,
        slug: org.slug || org.name?.toLowerCase().replace(/\s+/g, "-"),
        image_url: org.image_url ?? null,
      },
    });
  }
);


const syncWorkspaceDeletion = inngest.createFunction(
  { id: "delete-workspace-from-clerk" },
  { event: "clerk/organization.deleted" },

  async ({ event, step }) => {
    const org = event.data;

    // Safety: ensure valid payload
    if (!org?.id) {
      console.error("Invalid organization delete data:", org);
      return;
    }

    await step.run("delete-workspace-in-db", async () => {
      // Check if exists to avoid Prisma error
      const existing = await prisma.workspace.findUnique({
        where: { id: org.id },
      });

      if (!existing) {
        console.log("Workspace not found in DB, skipping delete");
        return;
      }

      await prisma.workspace.delete({
        where: { id: org.id },
      });
    });
  }
);


// Inngest function to save workspace member data into the database
const syncWorkspaceMemberCreation = inngest.createFunction(
  { id: "sync-workspace-member-from-clerk" },
  { event: "clerk/organizationInvitation.created" },

  async ({ event }) => {
    const invite = event.data;

    // Safety check
    if (!invite?.organization_id) {
      console.error("Invalid workspace invitation data:", invite);
      return;
    }

    await prisma.workspaceMember.create({
      data: {
        userId: invite.public_user_data?.user_id || null, // user not created yet maybe then return null to prevent error or breaking.
        workspaceId: invite.organization_id,
        role: String(invite.role_name || "MEMBER").toUpperCase(),
      },
    });
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