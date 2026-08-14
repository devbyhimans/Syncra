import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import workspaceRouter from './routes/workspaceRoutes.js';
import { protect } from './middlewares/authMiddleware.js';
import projectRouter from './routes/projectRoutes.js';
import taskRouter from './routes/taskRoutes.js';
import commentRouter from './routes/commentRoutes.js';
import notificationRouter from './routes/notificationRoutes.js';
import activityRouter from './routes/activityRoutes.js';
import subtaskRouter from './routes/subtaskRoutes.js';
import attachmentRouter from './routes/attachmentRoutes.js';

const app = express();

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,                  // 200 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
});
app.use(limiter);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));

// ── CORS ──────────────────────────────────────────────────────────────────────
// In production, FRONTEND_URL must be set. A missing env var will fall back to
// a strict same-origin policy rather than opening the wildcard.
const allowedOrigin = process.env.FRONTEND_URL;
if (!allowedOrigin && process.env.NODE_ENV === "production") {
    console.warn("[WARN] FRONTEND_URL is not set — CORS will reject all cross-origin requests in production.");
}
app.use(cors({
    origin: allowedOrigin || (process.env.NODE_ENV !== "production" ? "*" : false),
    credentials: true,
}));

// ── Clerk Authentication ──────────────────────────────────────────────────────
app.use(clerkMiddleware());

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: "ok", service: "Syncra API" }));

// ── Inngest Webhooks (public — Inngest handles its own signing verification) ──
app.use("/api/inngest", serve({ client: inngest, functions }));

// ── Protected API Routes (all require valid Clerk session) ────────────────────
app.use('/api/workspaces',    protect, workspaceRouter);
app.use('/api/projects',      protect, projectRouter);
app.use('/api/tasks',         protect, taskRouter);
app.use('/api/comments',      protect, commentRouter);
app.use('/api/notifications', protect, notificationRouter);
app.use('/api/activity',      protect, activityRouter);
app.use('/api/subtasks',      protect, subtaskRouter);
app.use('/api/attachments',   protect, attachmentRouter);

// ── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error("[Unhandled Error]", err.stack);

    // Never leak stack traces or internal error messages to the client in production
    const isDev = process.env.NODE_ENV !== "production";
    res.status(err.status || 500).json({
        message: isDev ? err.message : "An unexpected error occurred",
        ...(isDev && { stack: err.stack }),
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`[Syncra API] Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`));