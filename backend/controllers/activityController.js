import prisma from "../configs/prisma.js";

// GET /api/activity/:workspaceId — get activity log for a workspace
export const getWorkspaceActivity = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware
        const { workspaceId } = req.params;

        // Verify requester is a workspace member
        const membership = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId, workspaceId } },
        });
        if (!membership) {
            return res.status(403).json({ message: "Access denied" });
        }

        const logs = await prisma.activityLog.findMany({
            where: { workspaceId },
            orderBy: { createdAt: "desc" },
            take: 50,
            include: {
                user: { select: { id: true, name: true, image: true } }
            },
        });

        res.json({ logs });

    } catch (error) {
        console.error("getWorkspaceActivity error:", error);
        res.status(500).json({ message: "Failed to fetch activity log" });
    }
};

// Helper — called from other controllers (not an Express route handler)
export const logActivity = async ({ workspaceId, userId, action, entityType, entityId, entityTitle, meta = {} }) => {
    try {
        await prisma.activityLog.create({
            data: { workspaceId, userId, action, entityType, entityId, entityTitle, meta },
        });
    } catch (err) {
        // Log errors here must not crash the parent controller
        console.error("Activity log error:", err.message);
    }
};
