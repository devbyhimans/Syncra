import prisma from "../configs/prisma.js";

// Reusable safe user select — never expose internal fields
const safeUserSelect = {
    id: true,
    name: true,
    email: true,
    image: true,
};

// GET /api/workspaces — return all workspaces for the authenticated user
export const getUserWorkspaces = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware

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