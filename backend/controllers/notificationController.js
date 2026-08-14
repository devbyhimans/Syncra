import prisma from "../configs/prisma.js";

// GET /api/notifications — get all notifications for the authenticated user
export const getNotifications = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 30,
        });

        res.json({ notifications });

    } catch (error) {
        console.error("getNotifications error:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

// PATCH /api/notifications/:id/read — mark a single notification as read
export const markAsRead = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        // updateMany with userId scope ensures users can only mark their OWN notifications
        await prisma.notification.updateMany({
            where: { id, userId },
            data: { read: true },
        });

        res.json({ message: "Marked as read" });

    } catch (error) {
        console.error("markAsRead error:", error);
        res.status(500).json({ message: "Failed to mark notification as read" });
    }
};

// PATCH /api/notifications/read-all — mark all user's notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.userId;

        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });

        res.json({ message: "All notifications marked as read" });

    } catch (error) {
        console.error("markAllAsRead error:", error);
        res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
};
