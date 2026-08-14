import express from "express";
import { addMember, getUserWorkspaces } from "../controllers/workspaceController.js";
import { validateRequest, workspaceMemberSchema } from "../middlewares/validateRequest.js";

const workspaceRouter = express.Router();

workspaceRouter.get('/', getUserWorkspaces);
workspaceRouter.post('/add-member', validateRequest(workspaceMemberSchema), addMember);

export default workspaceRouter;