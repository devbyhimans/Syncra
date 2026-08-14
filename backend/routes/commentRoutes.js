import express from "express";
import { addComment, getTaskComments } from "../controllers/commentController.js";
import { validateRequest, commentSchema } from "../middlewares/validateRequest.js";

const commentRouter = express.Router();

commentRouter.post('/', validateRequest(commentSchema), addComment);
commentRouter.get('/:taskId', getTaskComments);

export default commentRouter;