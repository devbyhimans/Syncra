import express from "express";
import { getWorkspaceActivity } from "../controllers/activityController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:workspaceId", protect, getWorkspaceActivity);

export default router;
