"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeStakeholderHandler = exports.addStakeholderHandler = exports.inviteUserToProjectHandler = exports.updateProjectHandler = exports.getSingleProjectHandler = exports.createProjectHandler = exports.getProjectsHandler = void 0;
const project_services_1 = __importDefault(require("../services/project-services"));
const errors_1 = require("../config/errors");
const authentication_1 = require("../config/authentication");
/**
 * GET /projects
 * Retrieves all projects for the current user.
 */
const getProjectsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = (0, authentication_1.getUserId)(req);
        if (!userId)
            throw new errors_1.AppError("User ID is required", 400);
        const projects = yield project_services_1.default.getUserProjects(userId);
        res.status(200).json(projects);
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getProjectsHandler = getProjectsHandler;
/**
 * POST /projects
 * Creates a new project.
 */
const createProjectHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = (0, authentication_1.getUserId)(req);
        if (!userId)
            throw new errors_1.AppError("User ID is required", 400);
        const { name, startDate, endDate, projectCode, address, status, description, logo } = req.body;
        const project = yield project_services_1.default.createProject(userId, {
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
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.createProjectHandler = createProjectHandler;
/**
 * GET /projects/:projectId
 * Retrieves a project by ID.
 */
const getSingleProjectHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = (0, authentication_1.getUserId)(req);
        if (!userId)
            throw new errors_1.AppError("User ID is required", 400);
        const projectId = req.params.projectId;
        const project = yield project_services_1.default.getProject(projectId, userId);
        res.status(200).json(project);
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getSingleProjectHandler = getSingleProjectHandler;
/**
 * PUT /projects/:projectId
 * Updates a project.
 */
const updateProjectHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectId = req.params.projectId;
        const { name, startDate, endDate, projectCode, address, status, description, logo } = req.body;
        const project = yield project_services_1.default.updateProject(projectId, {
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
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.updateProjectHandler = updateProjectHandler;
/**
 * POST /projects/:projectId/invite
 * Invites a user to a project.
 */
const inviteUserToProjectHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        if (!projectId)
            throw new errors_1.AppError("Project ID is required", 400);
        const { email } = req.body;
        if (!email)
            throw new errors_1.AppError("Email is required", 400);
        const invite = yield project_services_1.default.inviteUserToProject(projectId, email);
        res.status(200).json(invite);
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.inviteUserToProjectHandler = inviteUserToProjectHandler;
/**
 * POST /projects/:projectId/stakeholders
 * Adds a stakeholder to a project.
 */
const addStakeholderHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        if (!projectId)
            throw new errors_1.AppError("Project ID is required", 400);
        const { name, email, role, phone } = req.body;
        if (!email || !name || !role || !phone)
            throw new errors_1.AppError("All fields are required", 400);
        const stakeholder = yield project_services_1.default.addStakeholderToProject(projectId, {
            name,
            email,
            role,
            phone,
        });
        res.status(200).json(stakeholder);
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.addStakeholderHandler = addStakeholderHandler;
/**
 * DELETE /projects/:projectId/stakeholders/:stakeholderId
 * Removes a stakeholder from a project.
 */
const removeStakeholderHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId, stakeholderId } = req.params;
        if (!projectId || !stakeholderId)
            throw new errors_1.AppError("Project ID and Stakeholder ID are required", 400);
        yield project_services_1.default.removeStakeholderFromProject(projectId, stakeholderId);
        res.status(204).end();
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.removeStakeholderHandler = removeStakeholderHandler;
