import express from "express";
import { createSubtask, toggleSubtask, deleteSubtask, getSubtasks } from "../controllers/subtaskController.js";
import { validateRequest, subtaskSchema } from "../middlewares/validateRequest.js";

const router = express.Router();

router.post("/", validateRequest(subtaskSchema), createSubtask);
router.patch("/:id", toggleSubtask);
router.delete("/:id", deleteSubtask);
router.get("/:taskId", getSubtasks);

export default router;
