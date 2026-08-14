import express from 'express';
import { createTask, deleteTask, updateTask } from "../controllers/taskController.js";
import { validateRequest, createTaskSchema, updateTaskSchema } from "../middlewares/validateRequest.js";

const taskRouter = express.Router();

taskRouter.post('/', validateRequest(createTaskSchema), createTask);
taskRouter.put('/:id', validateRequest(updateTaskSchema), updateTask);
// Using DELETE with a body for bulk task deletion
taskRouter.delete('/', deleteTask);

export default taskRouter;