import prisma from "../configs/prisma.js";

// Reusable safe user select
const safeUserSelect = {
    id: true,
    name: true,
    image: true,
};

//─── Add Comment ──────────────────────────────────────────────────────────────

export const addComment = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware
        const { content, taskId } = req.body;

        // Find the task
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Verify commenter is a member of the project (or the team_lead)
        const membership = await prisma.projectMember.findFirst({
            where: { projectId: task.projectId, userId }
        });

        if (!membership) {
            const project = await prisma.project.findUnique({ where: { id: task.projectId } });
            if (!project || project.team_lead !== userId) {
                return res.status(403).json({ message: "You are not a member of this project" });
            }
        }

        const comment = await prisma.comment.create({
            data: { taskId, content: content.trim(), userId },
            include: { user: { select: safeUserSelect } },
        });

        return res.json({ comment });

    } catch (error) {
        console.error("addComment error:", error);
        res.status(500).json({ message: "Failed to add comment" });
    }
};

//─── Get Task Comments ────────────────────────────────────────────────────────

export const getTaskComments = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware
        const { taskId } = req.params;

        // Find the task to get its project
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            select: { projectId: true }
        });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Verify requester is a project member or team_lead before returning comments
        const [membership, project] = await Promise.all([
            prisma.projectMember.findFirst({
                where: { projectId: task.projectId, userId }
            }),
            prisma.project.findUnique({
                where: { id: task.projectId },
                select: { team_lead: true }
            })
        ]);

        if (!membership && project?.team_lead !== userId) {
            return res.status(403).json({ message: "You do not have access to this task's comments" });
        }

        const comments = await prisma.comment.findMany({
            where: { taskId },
            include: { user: { select: safeUserSelect } },
            orderBy: { createdAt: "asc" }
        });

        return res.json({ comments });

    } catch (error) {
        console.error("getTaskComments error:", error);
        res.status(500).json({ message: "Failed to fetch comments" });
    }
};