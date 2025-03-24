import projectServices from "../services/project-services";
import { Request, Response } from "express";
import { AppError } from "../config/errors";
import { getUserId } from "../config/authentication";

/**
 * GET /projects
 * Retrieves all projects for the current user.
 */

export const getProjectsHandler = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) throw new AppError("User ID is required", 400);
        const projects = await projectServices.getUserProjects(userId);
        res.status(200).json(projects);
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * POST /projects
 * Creates a new project.
 */

export const createProjectHandler = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) throw new AppError("User ID is required", 400);
        const { name, startDate, endDate, projectCode, address, status, description, logo } =
            req.body;
        const project = await projectServices.createProject(userId, {
            name,
            startDate,
            endDate,
            projectCode,
            address,
            status,
            description,
            logo,
        });
        res.status(201).json(project);
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * GET /projects/:projectId
 * Retrieves a project by ID.
 */

export const getSingleProjectHandler = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) throw new AppError("User ID is required", 400);
        const projectId = req.params.projectId;
        const project = await projectServices.getProject(projectId, userId);
        res.status(200).json(project);
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * PUT /projects/:projectId
 * Updates a project.
 */

export const updateProjectHandler = async (req: Request, res: Response) => {
    try {
        const projectId = req.params.projectId;
        const { name, startDate, endDate, projectCode, address, status, description, logo } =
            req.body;
        const project = await projectServices.updateProject(projectId, {
            name,
            startDate,
            endDate,
            projectCode,
            address,
            status,
            description,
            logo,
        });
        res.status(200).json(project);
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * POST /projects/:projectId/invite
 * Invites a user to a project.
 */

export const inviteUserToProjectHandler = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        if (!projectId) throw new AppError("Project ID is required", 400);
        const { email } = req.body;
        if (!email) throw new AppError("Email is required", 400);
        const invite = await projectServices.inviteUserToProject(projectId, email);
        res.status(200).json(invite);
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * POST /projects/:projectId/stakeholders
 * Adds a stakeholder to a project.
 */

export const addStakeholderHandler = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        if (!projectId) throw new AppError("Project ID is required", 400);
        const { name, email, role, phone } = req.body;
        if (!email || !name || !role || !phone) throw new AppError("All fields are required", 400);
        const stakeholder = await projectServices.addStakeholderToProject(projectId, {
            name,
            email,
            role,
            phone,
        });
        res.status(200).json(stakeholder);
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * DELETE /projects/:projectId/stakeholders/:stakeholderId
 * Removes a stakeholder from a project.
 */

export const removeStakeholderHandler = async (req: Request, res: Response) => {
    try {
        const { projectId, stakeholderId } = req.params;
        if (!projectId || !stakeholderId)
            throw new AppError("Project ID and Stakeholder ID are required", 400);
        await projectServices.removeStakeholderFromProject(projectId, stakeholderId);
        res.status(204).end();
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};
