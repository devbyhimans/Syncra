import prisma from "../configs/prisma.js";

/**
 * Helper: verify the user is a member (or team_lead) of the project a task belongs to.
 * Returns true if authorized, false if not.
 */
const isProjectMember = async (taskId, userId) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { projectId: true }
    });
    if (!task) return false;

    const [membership, project] = await Promise.all([
        prisma.projectMember.findFirst({
            where: { projectId: task.projectId, userId }
        }),
        prisma.project.findUnique({
            where: { id: task.projectId },
            select: { team_lead: true }
        })
    ]);

    return !!(membership || project?.team_lead === userId);
};

//─── Create Subtask ───────────────────────────────────────────────────────────

export const createSubtask = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware
        const { taskId, title } = req.body;

        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) return res.status(404).json({ message: "Task not found" });

        // Verify membership before allowing subtask creation
        const authorized = await isProjectMember(taskId, userId);
        if (!authorized) {
            return res.status(403).json({ message: "You are not a member of this project" });
        }

        const subtask = await prisma.subtask.create({
            data: { taskId, title: title.trim(), createdBy: userId },
        });

        res.status(201).json({ subtask });

    } catch (error) {
        console.error("createSubtask error:", error);
        res.status(500).json({ message: "Failed to create subtask" });
    }
};

//─── Toggle Subtask Done/Undone ───────────────────────────────────────────────

export const toggleSubtask = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware
        const { id } = req.params;

        const existing = await prisma.subtask.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: "Subtask not found" });

        // SECURITY FIX: verify the requester belongs to this subtask's project
        const authorized = await isProjectMember(existing.taskId, userId);
        if (!authorized) {
            return res.status(403).json({ message: "You are not a member of this project" });
        }

        const subtask = await prisma.subtask.update({
            where: { id },
            data: { done: !existing.done },
        });

        res.json({ subtask });

    } catch (error) {
        console.error("toggleSubtask error:", error);
        res.status(500).json({ message: "Failed to update subtask" });
    }
};

//─── Delete Subtask ───────────────────────────────────────────────────────────

export const deleteSubtask = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware
        const { id } = req.params;

        const subtask = await prisma.subtask.findUnique({ where: { id } });
        if (!subtask) return res.status(404).json({ message: "Subtask not found" });

        // Only the creator can delete their own subtask
        if (subtask.createdBy !== userId) {
            return res.status(403).json({ message: "Only the subtask creator can delete it" });
        }

        await prisma.subtask.delete({ where: { id } });
        res.json({ message: "Subtask deleted" });

    } catch (error) {
        console.error("deleteSubtask error:", error);
        res.status(500).json({ message: "Failed to delete subtask" });
    }
};

//─── Get Subtasks for a Task ─────────────────────────────────────────────────

export const getSubtasks = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware
        const { taskId } = req.params;

        // Verify membership before returning subtasks
        const authorized = await isProjectMember(taskId, userId);
        if (!authorized) {
            return res.status(403).json({ message: "You are not a member of this project" });
        }

        const subtasks = await prisma.subtask.findMany({
            where: { taskId },
            orderBy: { createdAt: "asc" },
        });

        res.json({ subtasks });

    } catch (error) {
        console.error("getSubtasks error:", error);
        res.status(500).json({ message: "Failed to fetch subtasks" });
    }
};
