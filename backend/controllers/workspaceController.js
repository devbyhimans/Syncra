import prisma from "../configs/prisma.js";

// Function to return all workspaces for a user
export const getUserWorkspaces = async (req, res) => {
  try {
    // FIX 1: Remove 'await' and '()' because req.auth is an object
    const { userId } = req.auth;

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: { some: { userId: userId } }
      },
      include: {
        // FIX 2: Changed 'some' to 'include' to actually fetch the user details
        members: { include: { user: true } },
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
    // FIX 1: Remove 'await' and '()' here too
    const { userId } = req.auth;
    const { email, role, workspaceId, message } = req.body;

    // Checking if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

     // If workspace, role, or email is missing
    if (!workspaceId || !role) {
      return res.status(400).json({ message: "Missing required data" });
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
      return res.status(404).json({ message: "Invalid workspace" });
    }

    // Checking if the authenticated user is an ADMIN
    if (!workspace.members.find((member) => member.userId === userId && member.role === "ADMIN")) {
      return res.status(401).json({ message: "ADMIN access only" });
    }

    // Checking if the user is already a member
    // FIX 3: Logic fix - Check if 'user.id' (the person you are adding) is in the list
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
      },
    });

    res.json({ member, message: "Member added successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};