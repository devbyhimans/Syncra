import prisma from "../configs/prisma.js";
import { createClerkClient } from "@clerk/express";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

// Reusable safe user select — never expose internal fields
const safeUserSelect = {
    id: true,
    name: true,
    email: true,
    image: true,
};

/**
 * ensureUser — Safety net for Clerk↔DB sync.
 * If the Clerk webhook (user.created) failed or was never delivered,
 * this ensures the User row exists in Postgres before any query runs.
 * Called at the top of getUserWorkspaces so the very first API call
 * after sign-up will self-heal a missing record.
 */
const ensureUser = async (userId) => {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (existing) return existing;

    // User is missing in DB — fetch from Clerk and create
    try {
        const clerkUser = await clerkClient.users.getUser(userId);
        return await prisma.user.create({
            data: {
                id: clerkUser.id,
                email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
                name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
                image: clerkUser.imageUrl || "",
            },
        });
    } catch (err) {
        console.error("ensureUser: failed to sync user from Clerk:", err.message);
        return null;
    }
};

// GET /api/workspaces — return all workspaces for the authenticated user
export const getUserWorkspaces = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware

        // Safety net: ensure user exists in DB before querying workspaces
        await ensureUser(userId);

        const workspaces = await prisma.workspace.findMany({
            where: {
                members: { some: { userId } }
            },
            include: {
                members: {
                    include: { user: { select: safeUserSelect } }
                },
                projects: {
                    include: {
                        tasks: {
                            include: {
                                assignee: { select: safeUserSelect },
                                comments: {
                                    include: { user: { select: safeUserSelect } },
                                    orderBy: { createdAt: "asc" },
                                }
                            }
                        },
                        members: {
                            include: { user: { select: safeUserSelect } }
                        }
                    }
                },
                owner: { select: safeUserSelect },
            },
        });

        res.json({ workspaces });

    } catch (error) {
        console.error("getUserWorkspaces error:", error);
        res.status(500).json({ message: "Failed to fetch workspaces" });
    }
};

// POST /api/workspaces/add-member — add a user to a workspace (ADMIN only)
export const addMember = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware
        const { email, role, workspaceId, message } = req.body;

        // Check the target user exists
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch workspace with its members
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: { members: true },
        });

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // Only workspace ADMINs can add members — 403 Forbidden (not 401)
        const isAdmin = workspace.members.find(
            (member) => member.userId === userId && member.role === "ADMIN"
        );
        if (!isAdmin) {
            return res.status(403).json({ message: "Only workspace admins can add members" });
        }

        // Check if the target user is already a member
        const alreadyMember = workspace.members.find((member) => member.userId === user.id);
        if (alreadyMember) {
            return res.status(400).json({ message: "User is already a member of this workspace" });
        }

        const member = await prisma.workspaceMember.create({
            data: {
                userId: user.id,
                workspaceId,
                role: role.toUpperCase(),
                message: message || "",
            },
        });

        res.json({ member, message: "Member added successfully" });

    } catch (error) {
        console.error("addMember error:", error);
        res.status(500).json({ message: "Failed to add member" });
    }
};