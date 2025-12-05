import { err } from "inngest/types";
import prisma from "../configs/prisma.js";

/*Whenever a new task is created we will send an email to all the task members. we will integrate sending email with inngest function for that we be using a package Nodemailer */
//create task
export const createTask = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { projectId, title, description, type, status, priority, assigneeId, due_date } = req.body;
    const origin = req.get('origin')

    const project = await prisma.project.findUnique({
      where: { id: projectId }, 
      include: { members: { include: { user: true } } }
    });

    // Validations -- checking if user has admin role
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res.status(403).json({ message: "You don't have admin privileges for this project" });
    } else if (assigneeId && !project.members.find((member) => member.user.id === assigneeId)) {
      return res.status(403).json({ message: "Assignee not a member of project / workspace" });
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        priority,
        assigneeId, 
        status,
        type, 
        due_date: due_date ? new Date(due_date) : null // Ensure it's a Date object
      },
      include: {
        assignee: true // Fetching assignee details immediately
      }
    });

    res.json({ task: task, message: "Task created successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};


/*----------------------------------------------------------------------------------------------------------------------------------------------- */
//Update the task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params; 

    // Finding the task to update
    const task = await prisma.task.findUnique({
      where: { id: id },
    });

    // If task not present
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { userId } = req.auth();

    // Check if the user has admin role for project
    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      // include: { members: { include: { user: true } } } // Unnecessary unless we need member details specifically
    });

    // If project not found
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res.status(403).json({ message: "You don't have admin privileges for this project" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: id },
      data: req.body,
    });

    res.json({ task: updatedTask, message: "Task updated successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

/*----------------------------------------------------------------------------------------------------------------------------------------------- */

//Delete task
export const deleteTask = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { taskIds } = req.body; 

    // Finding the tasks
    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds } },
      select: { projectId: true } // Optimization: Only fetch projectId
    });

    if (tasks.length === 0) {
      return res.status(404).json({ message: "Tasks not found" });
    }

    // Get the projectId from the first task found
    const projectId = tasks[0].projectId;

    // Check if the user has admin role for THIS project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    // If project not found
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res.status(403).json({ message: "You don't have admin privileges for this project" });
    }

    // Security - Scope the delete to the specific project
    // This ensures that even if 'taskIds' contains IDs from other projects, 
    // they won't be deleted because they don't match the projectId.
    await prisma.task.deleteMany({
      where: { 
        id: { in: taskIds },
        projectId: projectId 
      },
    });

    res.json({ message: "Tasks deleted successfully", deletedIds: taskIds });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};