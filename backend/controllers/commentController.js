import prisma from "../configs/prisma.js";

export const addComment = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, taskId } = req.body;

    //Prevent empty comments or missing Task ID
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }
    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    // 1. Find the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 2. Check if user is a member
    const member = await prisma.projectMember.findFirst({
      where: {
        projectId: task.projectId,
        userId: userId
      }
    });

    // Check permissions (Team Lead fallback)
    if (!member) {
       const project = await prisma.project.findUnique({ where: { id: task.projectId } });
       
       // Check if 'project' exists before checking 'team_lead' to prevent crash
       // Also combined the logic: if no project OR not team lead -> deny access
       if (!project || project.team_lead !== userId) {
           return res.status(403).json({ message: "You are not a member of this project" });
       }
    }

    // 3. Create comment
    const comment = await prisma.comment.create({
      data: {
        taskId,
        content,
        userId,
      },
      include: { user: true },
    });

    return res.json({ comment });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

/*-----------------------------------------------------------------------------------------------------------------------------------------------*/

//get comments for a task
export const getTaskComments = async (req, res) => {
  try {

    const {taskId } = req.params;

    // getting the comments
    const comments = await prisma.comment.findMany({
      where: { taskId },
      include:{user: true},
      orderBy: {createdAt: 'asc'}
    });


    return res.json({ comments });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};