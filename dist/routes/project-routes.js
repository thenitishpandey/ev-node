"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wbs_routes_1 = __importDefault(require("./wbs-routes"));
const project_controller_1 = require("../controllers/project-controller");
const projectRouter = (0, express_1.Router)({ mergeParams: true });
projectRouter.use("/:projectId/wbs", wbs_routes_1.default);
projectRouter.get("/", project_controller_1.getProjectsHandler);
projectRouter.post("/", project_controller_1.createProjectHandler);
projectRouter.get("/:projectId", project_controller_1.getSingleProjectHandler);
projectRouter.put("/:projectId", project_controller_1.updateProjectHandler);
projectRouter.post("/:projectId/invite", project_controller_1.inviteUserToProjectHandler);
projectRouter.post("/:projectId/stakeholders", project_controller_1.addStakeholderHandler);
projectRouter.delete("/:projectId/stakeholders/:stakeholderId", project_controller_1.removeStakeholderHandler);
exports.default = projectRouter;
