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


// Function to add member to workspace
export const addMember = async (req, res) => {
  try {
    // Get the userId of the authenticated user (admin)
    const { userId } = await req.auth();
    const { email, role, workspaceId, message } = req.body;

    // If workspace, role, or email is missing
    if (!workspaceId || !role || !email) {
      return res.status(400).json({ message: "Missing required data" });
    }

    // Checking if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // If the role is neither MEMBER nor ADMIN
    if (!["ADMIN", "MEMBER"].includes(role.toUpperCase())) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Fetching workspace along with its members
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    // If workspace does not exist
    if (!workspace) {
      return res.status(400).json({ message: "Invalid workspace" });
    }

    // Checking if the authenticated user is an ADMIN
    if (!workspace.members.find((member) => member.userId === userId && member.role === "ADMIN")) {
      return res.status(401).json({ message: "ADMIN access only" });
    }

    // Checking if the user is already a member
    const existingUser = workspace.members.find((member) => member.userId === user.id);
    if (existingUser) {
      return res.status(400).json({ message: "Already a member" });
    }

    // Now adding member after all checks
    const member = await prisma.workspaceMember.create({
      data: {
        userId: user.id, // User being added
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

