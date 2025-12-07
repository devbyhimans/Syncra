import { memo } from "react";
import prisma from "../configs/prisma.js";


//-------------------------------------------------------------------------------------------------------------------------------------------------//

// Create New project
export const createProject = async (req, res) => {
  try {
    const { userId } = req.auth();

    // Data destructuring from Frontend
    // "Frontend se humein ye sab data mil raha hai. Dhyan dein 'team_lead' mein sirf Email aayega (eg: 'rahul@gmail.com')."
    const { workspaceId, description, name, status, start_date, end_date, team_members, team_lead, progress, priority } = req.body;

    // Check if user has admin role for workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: { include: { user: true } } }
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if user is ADMIN
    // "Check kar rahe hain ki request karne wala user is workspace ka ADMIN hai ya nahi."
    const isAdmin = workspace.members.some(
      (member) => member.userId === userId && member.role === "ADMIN"
    );

    if (!isAdmin) {
      return res.status(403).json({ message: "You don't have permission to create projects in this workspace" });
    }

    // --- LOGIC: Email to ID Conversion ---
    
    // "Database Logic: Project table mein 'team_lead' column ek Relation hai.
    // Wahan hum direct 'Email' string save nahi kar sakte. Humein us user ki 'Unique ID' chahiye.
    // Isliye hum pehle Email use karke User ko database mein dhoondhenge."

    let teamLeadId = null;
    
    if (team_lead) {
      // "Prisma se bol rahe hain: Jiska email 'team_lead' wala hai, uska ID laake do."
      const teamLeadUser = await prisma.user.findUnique({
        where: { email: team_lead },
        select: { id: true }
      });
      
      // "Agar user mila, toh ID store kar lo. ?. ka matlab agar user nahi mila to crash mat hona."
      teamLeadId = teamLeadUser?.id;
    }

    // Create Project
    const project = await prisma.project.create({
      data: {
        workspaceId,
        name,
        description, 
        status,
        priority,
        progress,
        // "Yahan Hum 'team_lead' field mein 'teamLeadId' (ID) daal rahe hain, na ki email."
        team_lead: teamLeadId, 
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
      }
    });

    // Add members to project if they are in the workspace
    if (team_members?.length > 0) {
      const membersToAdd = [];
      
      workspace.members.forEach(member => {
        // "Check kar rahe hain: Kya ye workspace member humare 'team_members' wali list mein hai?"
        if (team_members.includes(member.user.email)) {
          membersToAdd.push(member.user.id);
        }
      });

      // "Jo members match huye, unhe Project ke saath jod rahe hain."
      if (membersToAdd.length > 0) {
        await prisma.projectMember.createMany({
          data: membersToAdd.map(memberId => ({
            projectId: project.id,
            userId: memberId
          }))
        });
      }
    }

    // Fetch the final project with all details to send back to frontend
    const projectWithMembers = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        members: { include: { user: true } },
        tasks: { include: { assignee: true, comments: { include: { user: true } } } },
      }
    });

    res.json({ project: projectWithMembers, message: "Project created successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

//------------------------------------------------------------------------------------------------------------------------------------------------//

//update project
export const updateProject = async (req, res) => {
    try {
        const { userId } = req.auth();

        // 1. Get the Project ID and other data from body
        const { id, workspaceId, description, name, status, start_date, end_date, progress, priority } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Project ID is required" });
        }

        // 2. FIND THE PROJECT FIRST
        // We need this to know which Workspace this project belongs to
        const existingProject = await prisma.project.findUnique({
            where: { id }
        });

        if (!existingProject) {
            return res.status(404).json({ message: "Project not found" });
        }

        // 3. Determine the Workspace ID
        // If the user sent a new workspaceId, use that. Otherwise, use the project's current workspaceId.
        const targetWorkspaceId = workspaceId || existingProject.workspaceId;

        // 4. Find the Workspace to check permissions
        const workspace = await prisma.workspace.findUnique({
            where: { id: targetWorkspaceId },
            include: { members: true } // Simplified include
        });

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // 5. CHECK PERMISSIONS
        // Check if user is an ADMIN in the workspace
        const isAdmin = workspace.members.some(
            (member) => member.userId === userId && member.role === "ADMIN"
        );

        // Check if user is the TEAM LEAD of the project
        const isTeamLead = existingProject.team_lead === userId;

        // If neither, deny access
        if (!isAdmin && !isTeamLead) {
            return res.status(403).json({ message: "You don't have permission to update projects in this workspace" });
        }

        // 6. UPDATE THE PROJECT
        const project = await prisma.project.update({
            where: { id },
            data: {
                // Only update workspaceId if it was actually provided in the body
                workspaceId: workspaceId || existingProject.workspaceId,
                description,
                name,
                status,
                priority,
                progress,
                start_date: start_date ? new Date(start_date) : undefined, // undefined leaves it alone if not provided
                end_date: end_date ? new Date(end_date) : undefined,
            }
        });

        res.json({ project, message: "Project updated successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message })
    }
}
//------------------------------------------------------------------------------------------------------------------------------------------------//
//add member to project
export const addMember = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { projectId } = req.params;
    const { email } = req.body;

    // Check project and include members + nested user details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { include: { user: true } } }
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Permission check
    if (project.team_lead !== userId) {
      return res.status(403).json({ message: "Only project lead can add members" });
    }

    // CRITICAL FIX: Access member.user.email
    // In schema ProjectMember only has userId, not email directly.
    const existingMember = project.members.find((member) => member.user.email === email);

    if (existingMember) {
      return res.status(400).json({ message: "User is already a member" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const member = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId
      }
    });

    res.json({ member, message: "Member added successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};