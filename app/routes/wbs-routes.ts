import { Router } from "express";
import {
    getProjectWBSHandler,
    getProjectUserWBSHandler,
    updateWBSHandler,
    createWBSHandler,
    addAccessHandler,
    removeAccessHandler,
} from "../controllers/wbs-controller";

const wbsRouter = Router({ mergeParams: true });

wbsRouter.get("/", getProjectWBSHandler);
wbsRouter.post("/", createWBSHandler);
wbsRouter.get("/user", getProjectUserWBSHandler);
wbsRouter.put("/:wbsId", updateWBSHandler);
wbsRouter.post("/:wbsId/access/add", addAccessHandler);
wbsRouter.post("/:wbsId/access/remove", removeAccessHandler);

export default wbsRouter;
