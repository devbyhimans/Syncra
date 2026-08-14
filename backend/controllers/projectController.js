import prisma from "../configs/prisma.js";
import { logActivity } from "./activityController.js";

// Reusable safe user select — never expose internal fields
const safeUserSelect = {
    id: true,
    name: true,
    email: true,
    image: true,
};

//─── Create New Project ────────────────────────────────────────────────────────

export const createProject = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware

        const { workspaceId, description, name, status, start_date, end_date, team_members, team_lead, progress, priority } = req.body;

        // Fetch workspace with members (and their user details)
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: { members: { include: { user: { select: safeUserSelect } } } }
        });

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // Only workspace ADMINs can create projects
        const isAdmin = workspace.members.some(
            (member) => member.userId === userId && member.role === "ADMIN"
        );
        if (!isAdmin) {
            return res.status(403).json({ message: "Only workspace admins can create projects" });
        }

        // Resolve team_lead email → userId
        let teamLeadId = null;
        if (team_lead) {
            const teamLeadUser = await prisma.user.findUnique({
                where: { email: team_lead },
                select: { id: true }
            });
            teamLeadId = teamLeadUser?.id;
        }

        // Create the project
        const project = await prisma.project.create({
            data: {
                workspaceId,
                name,
                description,
                status,
                priority,
                progress: progress ?? 0,
                team_lead: teamLeadId,
                start_date: start_date ? new Date(start_date) : null,
                end_date: end_date ? new Date(end_date) : null,
            }
        });

        // Add workspace-members as project members if their emails are in team_members[]
        if (team_members?.length > 0) {
            const membersToAdd = workspace.members
                .filter((member) => team_members.includes(member.user.email))
                .map((member) => ({ projectId: project.id, userId: member.user.id }));

            if (membersToAdd.length > 0) {
                await prisma.projectMember.createMany({ data: membersToAdd });
            }
        }

        // Fetch the fully-populated project to return — with field selection applied
        const projectWithMembers = await prisma.project.findUnique({
            where: { id: project.id },
            include: {
                members: { include: { user: { select: safeUserSelect } } },
                tasks: {
                    include: {
                        assignee: { select: safeUserSelect },
                        comments: { include: { user: { select: safeUserSelect } } }
                    }
                },
            }
        });

        await logActivity({
            workspaceId,
            userId,
            action: "PROJECT_CREATED",
            entityType: "Project",
            entityId: project.id,
            entityTitle: project.name,
        });

        res.json({ project: projectWithMembers, message: "Project created successfully" });

    } catch (error) {
        console.error("createProject error:", error);
        res.status(500).json({ message: "Failed to create project" });
    }
};

//─── Update Project ────────────────────────────────────────────────────────────

export const updateProject = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware
        const { id, workspaceId, description, name, status, start_date, end_date, progress, priority } = req.body;

        // Verify workspace exists and user is a member
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: { members: true }
        });

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // Check membership first — user must AT LEAST be in the workspace
        const membership = workspace.members.find((m) => m.userId === userId);
        if (!membership) {
            return res.status(403).json({ message: "You are not a member of this workspace" });
        }

        const isAdmin = membership.role === "ADMIN";

        if (!isAdmin) {
            // Non-admins can only update projects they lead
            const existingProject = await prisma.project.findUnique({ where: { id } });
            if (!existingProject) {
                return res.status(404).json({ message: "Project not found" });
            }
            if (existingProject.team_lead !== userId) {
                return res.status(403).json({ message: "Only the project lead or workspace admin can update this project" });
            }
        }

        const project = await prisma.project.update({
            where: { id },
            data: {
                description,
                name,
                status,
                priority,
                progress,
                start_date: start_date ? new Date(start_date) : null,
                end_date: end_date ? new Date(end_date) : null,
            }
        });

        await logActivity({
            workspaceId,
            userId,
            action: "PROJECT_UPDATED",
            entityType: "Project",
            entityId: project.id,
            entityTitle: project.name,
        });

        res.json({ project, message: "Project updated successfully" });

    } catch (error) {
        console.error("updateProject error:", error);
        res.status(500).json({ message: "Failed to update project" });
    }
};

//─── Add Member to Project ─────────────────────────────────────────────────────

export const addMember = async (req, res) => {
    try {
        const userId = req.userId; // set by protect middleware
        const { projectId } = req.params;
        const { email } = req.body;

        // Fetch project with members
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: { include: { user: { select: safeUserSelect } } } }
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Only the project team_lead can add members
        if (project.team_lead !== userId) {
            return res.status(403).json({ message: "Only the project lead can add members" });
        }

        // Check if user is already a project member
        const alreadyMember = project.members.find((m) => m.user.email === email);
        if (alreadyMember) {
            return res.status(400).json({ message: "User is already a member of this project" });
        }

        // Resolve email → user
        const user = await prisma.user.findUnique({
            where: { email },
            select: safeUserSelect
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const member = await prisma.projectMember.create({
            data: { userId: user.id, projectId }
        });

        res.json({ member, message: "Member added successfully" });

    } catch (error) {
        console.error("addMember error:", error);
        res.status(500).json({ message: "Failed to add member" });
    }
};