import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";
import sendEmail from "../configs/nodemailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "Syncra"});

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

/*---------------------------------------------------------------------------------------------------------------------------------------------- */

// Inngest function to delete user data from database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },

  async ({ event, step }) => {
    const user = event.data;

    if (!user || !user.id) {
      return;
    }

    await step.run("delete-user-in-db", async () => {
      // FIX: Use deleteMany instead of delete.
      // deleteMany does NOT crash if the record is missing.
      await prisma.user.deleteMany({
        where: {
          id: user.id,
        },
      });
    });

    return { success: true };
  }
)

/*---------------------------------------------------------------------------------------------------------------------------------------------- */

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

/*---------------------------------------------------------------------------------------------------------------------------------------------- */

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

/*---------------------------------------------------------------------------------------------------------------------------------------------- */

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

/*---------------------------------------------------------------------------------------------------------------------------------------------- */

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

/*---------------------------------------------------------------------------------------------------------------------------------------------- */

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

/*---------------------------------------------------------------------------------------------------------------------------------------------- */

// Inngest function to send email on task assignment + reminder
export const sendTaskAssignmentEmail = inngest.createFunction(
  { id: "send-task-assignment-mail" },
  { event: "app/task.assigned" },

  async ({ event, step }) => {
    const { taskId, origin } = event.data;

    // 1. Fetch the initial task data
    const task = await step.run("fetch-task", async () => {
      return await prisma.task.findUnique({
        where: { id: taskId },
        include: { assignee: true, project: true },
      });
    });

    if (!task || !task.assignee) return;

    // 2. Send the Immediate Assignment Email
    await step.run("send-assignment-email", async () => {
      await sendEmail({
        to: task.assignee.email,
        subject: `New Task Assignment: ${task.title}`,
        body: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${task.assignee.name}, 👋</h2>
            <p style="font-size: 16px; color: #555;">You've been assigned a new task:</p>
            <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 15px 0;">${task.title}</p>
            <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; background-color: #f8f9fa; margin-bottom: 25px;">
              <p style="margin: 8px 0; line-height: 1.5;"><strong style="color: #555;">Description:</strong> <br/>${task.description}</p>
              <p style="margin: 8px 0; line-height: 1.5;"><strong style="color: #555;">Due Date:</strong> <br/>${new Date(task.due_date).toLocaleDateString()}</p>
              <p style="margin: 8px 0; line-height: 1.5;"><strong style="color: #555;">Priority:</strong> <br/>
                <span style="color: ${task.priority === 'High' ? '#dc3545' : '#28a745'}; font-weight: bold;">${task.priority}</span>
              </p>
            </div>
            <a href="${origin}/tasks/${task.id}" style="display: inline-block; background-color: #007bff; padding: 12px 24px; border-radius: 5px; color: #fff; font-weight: 600; font-size: 16px; text-decoration: none; box-shadow: 0 2px 4px rgba(0,123,255,0.3);">View Task</a>
            <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 30px;">Sent via Syncra Workflow System</p>
          </div>
        `,
      });
    });

    // 3. Logic for Reminder
    const dueDate = new Date(task.due_date);
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(dueDate.getDate() - 1); // Subtract 24 hours
    
    // Check if the reminder date is in the future relative to NOW
    if (reminderDate > new Date()) {
      
      // Wait until the due date (or maybe 1 day --> here a day before implemented)
      await step.sleepUntil('wait-for-due-date', reminderDate);

      // 4. Send Reminder (ONLY if task is not done)
      await step.run('send-reminder-if-needed', async () => {
        
        // CRITICAL: Re-fetch the task to get the LATEST status
        const currentTask = await prisma.task.findUnique({
          where: { id: taskId },
          include: { assignee: true, project: true },
        });

        // If task is deleted or already done, do not send email
        if (!currentTask || currentTask.status === "DONE") {
          return { sent: false, reason: "Task completed or deleted" };
        }

        // Send the Reminder Email
        await sendEmail({
          to: currentTask.assignee.email,
          subject: `Reminder: ${currentTask.title} is due!`,
          body: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; margin-top: 0;">Heads up, ${currentTask.assignee.name}! ⏰</h2>
              <p style="font-size: 16px; color: #555;">This is a gentle reminder that the following task is due:</p>
              <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 15px 0;">${currentTask.title}</p>
              <div style="border: 1px solid #ffc107; border-left: 5px solid #ffc107; padding: 20px; border-radius: 8px; background-color: #fffbf2; margin-bottom: 25px;">
                <p style="margin: 8px 0; line-height: 1.5;"><strong style="color: #555;">Due Date:</strong> <br/>
                  <span style="color: #d9534f; font-size: 16px; font-weight: bold;">${new Date(currentTask.due_date).toLocaleDateString()}</span>
                </p>
                <p style="margin: 8px 0; line-height: 1.5;"><strong style="color: #555;">Priority:</strong> <br/>
                  <span style="color: ${currentTask.priority === 'High' ? '#dc3545' : '#28a745'}; font-weight: bold;">${currentTask.priority}</span>
                </p>
              </div>
              <a href="${origin}/tasks/${currentTask.id}" style="display: inline-block; background-color: #007bff; padding: 12px 24px; border-radius: 5px; color: #fff; font-weight: 600; font-size: 16px; text-decoration: none; box-shadow: 0 2px 4px rgba(0,123,255,0.3);">View Task & Update Status</a>
              <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 30px;">Sent via Syncra Workflow System</p>
            </div>
          `
        });
        
        return { sent: true };
      });
    }
  }
);


/*---------------------------------------------------------------------------------------------------------------------------------------------- */



// Exporting Inngest functions
 export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  syncWorkspaceCreation,
  syncWorkspaceMemberCreation,
  syncWorkspaceDeletion,
  syncWorkspaceUpdation,
  sendTaskAssignmentEmail
];