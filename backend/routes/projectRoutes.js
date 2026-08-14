import express from "express";
import { addMember, createProject, updateProject } from "../controllers/projectController.js";
import { validateRequest, createProjectSchema, updateProjectSchema, projectMemberSchema } from "../middlewares/validateRequest.js";

const projectRouter = express.Router();

projectRouter.post('/', validateRequest(createProjectSchema), createProject);
projectRouter.put('/', validateRequest(updateProjectSchema), updateProject);
projectRouter.post('/:projectId/addMember', validateRequest(projectMemberSchema), addMember);

export default projectRouter;