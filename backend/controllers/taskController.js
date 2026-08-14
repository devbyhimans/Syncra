import prisma from "../configs/prisma.js";
import { inngest } from "../inngest/index.js";
import { logActivity } from "./activityController.js";

// Reusable safe user select
const safeUserSelect = {
    id: true,
    name: true,
    email: true,
    image: true,
};

//─── Create Task ───────────────────────────────────────────────────────────────

export const createTask = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware
        const { projectId, title, description, type, status, priority, assigneeId, due_date } = req.body;
        const origin = req.get('origin');

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: { include: { user: { select: safeUserSelect } } } }
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Only the project team_lead can create tasks
        if (project.team_lead !== userId) {
            return res.status(403).json({ message: "Only the project lead can create tasks" });
        }

        // Validate assignee is a project member (if provided)
        if (assigneeId && !project.members.find((m) => m.user.id === assigneeId)) {
            return res.status(400).json({ message: "Assignee is not a member of this project" });
        }

        const task = await prisma.task.create({
            data: {
                projectId,
                title,
                description,
                priority,
                assigneeId: assigneeId || userId,
                status: status || "TODO",
                type: type || "TASK",
                due_date: due_date ? new Date(due_date) : null,
            },
            include: {
                assignee: { select: safeUserSelect }
            }
        });

        // Trigger background email via Inngest
        await inngest.send({
            name: "app/task.assigned",
            data: { taskId: task.id, origin }
        });

        await logActivity({
            workspaceId: project.workspaceId,
            userId,
            action: "TASK_CREATED",
            entityType: "Task",
            entityId: task.id,
            entityTitle: task.title,
        });

        // Create in-app notification for assignee (if different from creator)
        if (task.assigneeId && task.assigneeId !== userId) {
            await prisma.notification.create({
                data: {
                    userId: task.assigneeId,
                    type: "TASK_ASSIGNED",
                    title: "New Task Assigned",
                    message: `You have been assigned to: ${task.title}`,
                    link: `/taskDetails?projectId=${task.projectId}&taskId=${task.id}`
                }
            });
        }

        res.json({ task, message: "Task created successfully" });

    } catch (error) {
        console.error("createTask error:", error);
        res.status(500).json({ message: "Failed to create task" });
    }
};

//─── Update Task ───────────────────────────────────────────────────────────────

export const updateTask = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware
        const { id } = req.params;

        // Fetch the task first
        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Fetch the parent project
        const project = await prisma.project.findUnique({ where: { id: task.projectId } });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const isTeamLead = project.team_lead === userId;
        const isAssignee = task.assigneeId === userId;

        if (!isTeamLead && !isAssignee) {
            return res.status(403).json({ message: "Only the project lead or task assignee can update this task" });
        }

        const { title, description, status, type, priority, assigneeId, due_date } = req.body;

        // Assignees can ONLY update status — not reassign, retitle, or change priority
        const updateData = isTeamLead
            ? {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(status && { status }),
                ...(type && { type }),
                ...(priority && { priority }),
                ...(assigneeId && { assigneeId }),
                ...(due_date && { due_date: new Date(due_date) }),
            }
            : {
                // Assignees can only change status
                ...(status && { status }),
            };

        const updatedTask = await prisma.task.update({
            where: { id },
            data: updateData,
            include: { assignee: { select: safeUserSelect } }
        });

        await logActivity({
            workspaceId: project.workspaceId,
            userId,
            action: "TASK_UPDATED",
            entityType: "Task",
            entityId: updatedTask.id,
            entityTitle: updatedTask.title,
            meta: { status, priority, assigneeId }
        });

        res.json({ task: updatedTask, message: "Task updated successfully" });

    } catch (error) {
        console.error("updateTask error:", error);
        res.status(500).json({ message: "Failed to update task" });
    }
};

//─── Delete Tasks (Bulk) ───────────────────────────────────────────────────────

export const deleteTask = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware
        const { taskIds } = req.body;

        if (!Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({ message: "taskIds must be a non-empty array" });
        }

        // Find all tasks and verify they exist
        const tasks = await prisma.task.findMany({
            where: { id: { in: taskIds } },
            select: { projectId: true }
        });

        if (tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found" });
        }

        const projectId = tasks[0].projectId;

        // Verify user is the project team_lead
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        if (project.team_lead !== userId) {
            return res.status(403).json({ message: "Only the project lead can delete tasks" });
        }

        // Scoped delete — only tasks within THIS project, prevents cross-project deletion
        await prisma.task.deleteMany({
            where: {
                id: { in: taskIds },
                projectId  // security scope
            },
        });

        res.json({ message: "Tasks deleted successfully", deletedIds: taskIds });

    } catch (error) {
        console.error("deleteTask error:", error);
        res.status(500).json({ message: "Failed to delete tasks" });
    }
};