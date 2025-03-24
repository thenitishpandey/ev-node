import { Router } from "express";
import wbsRouter from "./wbs-routes";
import {
    getSingleProjectHandler,
    getProjectsHandler,
    updateProjectHandler,
    createProjectHandler,
    inviteUserToProjectHandler,
    addStakeholderHandler,
    removeStakeholderHandler,
} from "../controllers/project-controller";

const projectRouter = Router({ mergeParams: true });

projectRouter.use("/:projectId/wbs", wbsRouter);

projectRouter.get("/", getProjectsHandler);
projectRouter.post("/", createProjectHandler);
projectRouter.get("/:projectId", getSingleProjectHandler);
projectRouter.put("/:projectId", updateProjectHandler);
projectRouter.post("/:projectId/invite", inviteUserToProjectHandler);
projectRouter.post("/:projectId/stakeholders", addStakeholderHandler);
projectRouter.delete("/:projectId/stakeholders/:stakeholderId", removeStakeholderHandler);

export default projectRouter;
