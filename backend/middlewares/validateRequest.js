import { z } from "zod";

/**
 * validateRequest — Zod validation middleware factory.
 * Usage: router.post('/', validateRequest(mySchema), myController)
 */
export const validateRequest = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    } catch (error) {
        return res.status(400).json({
            message: "Validation failed",
            errors: error.errors,
        });
    }
};

// ─── Task Schemas ─────────────────────────────────────────────────────────────

export const createTaskSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required").max(255),
        description: z.string().max(5000).optional(),
        status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
        type: z.enum(["TASK", "BUG", "FEATURE", "IMPROVEMENT", "OTHER"]).optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
        assigneeId: z.string().min(1).optional(),
        due_date: z.string().or(z.date()),
        projectId: z.string().min(1, "Project ID is required"),
        workspaceId: z.string().optional(),
    }),
});

export const updateTaskSchema = z.object({
    body: z.object({
        title: z.string().min(1).max(255).optional(),
        description: z.string().max(5000).optional(),
        status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
        type: z.enum(["TASK", "BUG", "FEATURE", "IMPROVEMENT", "OTHER"]).optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
        assigneeId: z.string().min(1).optional(),
        due_date: z.string().or(z.date()).optional(),
        projectId: z.string().optional(),
        workspaceId: z.string().optional(),
    }),
});

// ─── Project Schemas ──────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Project name is required").max(255),
        description: z.string().max(5000).optional(),
        status: z.enum(["ACTIVE", "PLANNING", "COMPLETED", "ON_HOLD", "CANCELLED"]).optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
        start_date: z.string().or(z.date()).optional().nullable(),
        end_date: z.string().or(z.date()).optional().nullable(),
        team_lead: z.string().email("team_lead must be a valid email").optional(),
        workspaceId: z.string().min(1, "Workspace ID is required"),
        progress: z.number().int().min(0).max(100).optional(),
        team_members: z.array(z.string().email()).optional(),
    }),
});

export const updateProjectSchema = z.object({
    body: z.object({
        id: z.string().min(1, "Project ID is required"),
        name: z.string().min(1).max(255).optional(),
        description: z.string().max(5000).optional(),
        status: z.enum(["ACTIVE", "PLANNING", "COMPLETED", "ON_HOLD", "CANCELLED"]).optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
        start_date: z.string().or(z.date()).optional().nullable(),
        end_date: z.string().or(z.date()).optional().nullable(),
        workspaceId: z.string().min(1, "Workspace ID is required"),
        progress: z.number().int().min(0).max(100).optional(),
    }),
});

// ─── Comment Schema ───────────────────────────────────────────────────────────

export const commentSchema = z.object({
    body: z.object({
        content: z.string().min(1, "Comment cannot be empty").max(5000),
        taskId: z.string().min(1, "Task ID is required"),
    }),
});

// ─── Subtask Schema ───────────────────────────────────────────────────────────

export const subtaskSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required").max(500),
        taskId: z.string().min(1, "Task ID is required"),
    }),
});

// ─── Workspace Member Schema ──────────────────────────────────────────────────

export const workspaceMemberSchema = z.object({
    body: z.object({
        email: z.string().email("Must be a valid email"),
        role: z.enum(["ADMIN", "MEMBER"]),
        workspaceId: z.string().min(1, "Workspace ID is required"),
        message: z.string().max(500).optional(),
    }),
});

// ─── Project Member Schema ────────────────────────────────────────────────────

export const projectMemberSchema = z.object({
    body: z.object({
        email: z.string().email("Must be a valid email"),
    }),
});
