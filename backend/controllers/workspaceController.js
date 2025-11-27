import prisma from "../configs/prisma";

//Function to return all workspaces for a user
export const getUserWorkspaces = async (req, res) => {
  try {
    const { userId } = await req.auth();

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: { some: { userId: userId } }
      },
      include: {
        members: {
          include: { user: true } // include user details
        },
        projects: {
          include: {
            tasks: {
              include: {
                assignee: true,
                comments: { include: { user: true } }
              }
            },
            members: { include: { user: true } }
          }
        },
        owner: true,
      },
    });

    res.json({ workspaces });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};


export const addMember = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { email, role, workspaceId, message } = req.body;

    if (!workspaceId || !role || !email) {
      return res.status(400).json({ message: "Missing required data" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!["ADMIN", "MEMBER"].includes(role.toUpperCase())) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });
    if (!workspace) {
      return res.status(400).json({ message: "Invalid workspace" });
    }

    if (!workspace.members.find((m) => m.userId === userId && m.role === "ADMIN")) {
      return res.status(401).json({ message: "ADMIN access only" });
    }

    const existingUser = workspace.members.find((m) => m.userId === user.id);
    if (existingUser) {
      return res.status(400).json({ message: "Already a member" });
    }

    const member = await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role: role.toUpperCase(),
        message,
      },
    });

    res.json({ member, message: "Member added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
