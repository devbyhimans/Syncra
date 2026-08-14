import express from "express";
import { uploadAttachment, getAttachments, deleteAttachment, upload } from "../controllers/attachmentController.js";

const router = express.Router();

// protect is applied globally at server.js mount level — no need to re-apply here
router.post("/", upload.single("file"), uploadAttachment);
router.get("/:taskId", getAttachments);
router.delete("/:id", deleteAttachment);

export default router;
