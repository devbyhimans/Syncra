import prisma from "../configs/prisma.js";
import cloudinary from "../configs/cloudinary.js";
import multer from "multer";

// Memory storage so we can stream to Cloudinary directly
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter: (req, file, cb) => {
        const allowed = [
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "application/pdf", "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("File type not allowed"), false);
        }
    },
});

/**
 * Helper: verify the user is a member or team_lead of the project a task belongs to.
 */
const verifyTaskAccess = async (taskId, userId) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { projectId: true }
    });
    if (!task) return null;

    const [membership, project] = await Promise.all([
        prisma.projectMember.findFirst({
            where: { projectId: task.projectId, userId }
        }),
        prisma.project.findUnique({
            where: { id: task.projectId },
            select: { team_lead: true }
        })
    ]);

    const hasAccess = !!(membership || project?.team_lead === userId);
    return hasAccess ? task : null;
};

//─── Upload Attachment ────────────────────────────────────────────────────────

export const uploadAttachment = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware
        const { taskId } = req.body;

        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        if (!taskId) return res.status(400).json({ message: "taskId is required" });

        // Verify access before uploading
        const task = await verifyTaskAccess(taskId, userId);
        if (!task) return res.status(403).json({ message: "Access denied or task not found" });

        // Stream upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `syncra/tasks/${taskId}`,
                    resource_type: "auto",
                    public_id: `${Date.now()}-${req.file.originalname.replace(/\s+/g, "_")}`,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        const attachment = await prisma.attachment.create({
            data: {
                taskId,
                fileName: req.file.originalname,
                fileUrl: uploadResult.secure_url,
                fileType: req.file.mimetype,
                fileSize: req.file.size,
                cloudinaryId: uploadResult.public_id,
                uploadedBy: userId,
            },
        });

        res.status(201).json({ attachment });

    } catch (error) {
        console.error("uploadAttachment error:", error);
        res.status(500).json({ message: "Failed to upload attachment" });
    }
};

//─── Get Attachments for a Task ──────────────────────────────────────────────

export const getAttachments = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware
        const { taskId } = req.params;

        // SECURITY FIX: verify membership before returning attachments
        const task = await verifyTaskAccess(taskId, userId);
        if (!task) return res.status(403).json({ message: "Access denied or task not found" });

        const attachments = await prisma.attachment.findMany({
            where: { taskId },
            orderBy: { createdAt: "desc" },
        });

        res.json({ attachments });

    } catch (error) {
        console.error("getAttachments error:", error);
        res.status(500).json({ message: "Failed to fetch attachments" });
    }
};

//─── Delete Attachment ────────────────────────────────────────────────────────

export const deleteAttachment = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware
        const { id } = req.params;

        const attachment = await prisma.attachment.findUnique({ where: { id } });
        if (!attachment) return res.status(404).json({ message: "Attachment not found" });

        // Only the uploader can delete their own attachment
        if (attachment.uploadedBy !== userId) {
            return res.status(403).json({ message: "Only the uploader can delete this attachment" });
        }

        // Remove from Cloudinary first
        await cloudinary.uploader.destroy(attachment.cloudinaryId, { resource_type: "auto" });

        await prisma.attachment.delete({ where: { id } });
        res.json({ message: "Attachment deleted" });

    } catch (error) {
        console.error("deleteAttachment error:", error);
        res.status(500).json({ message: "Failed to delete attachment" });
    }
};
