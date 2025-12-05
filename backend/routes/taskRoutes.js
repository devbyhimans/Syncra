import express from 'express';
import { createTask, deleteTask } from "../controllers/taskController.js";
import { updateProject } from "../controllers/projectController.js";

const taskRouter = express.Router();

taskRouter.post('/',createTask)
taskRouter.put('/:id',updateProject)
taskRouter.post('/delete',deleteTask)

export default taskRouter;