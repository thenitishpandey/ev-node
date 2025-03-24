import { Request, Response, NextFunction } from "express";
import wbsServices from "../services/wbs-services";
import { AppError } from "../config/errors";
import { getUserId } from "../config/authentication";

/**
 * Wrapper to handle async errors without try/catch in every handler.
 */
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/**
 * GET /projects/:projectId/wbs
 * Retrieves all WBS nodes for a given project.
 */
export const getProjectWBSHandler = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    if (!projectId) throw new AppError("Project ID is required", 400);
    const wbs = await wbsServices.getProjectWBS(projectId);
    res.status(200).json(wbs);
});

/**
 * GET /projects/:projectId/wbs/user
 * Retrieves the WBS tree accessible by the current user.
 */
export const getProjectUserWBSHandler = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const userId = getUserId(req);
    if (!projectId || !userId) {
        throw new AppError("Project ID and User ID are required", 400);
    }
    const wbs = await wbsServices.getProjectWBSofUser(userId, projectId);
    res.status(200).json(wbs);
});

/**
 * POST /projects/:projectId/wbs
 * Creates a new WBS node. The creator automatically receives ADMIN access.
 */
export const createWBSHandler = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { parentId, name, description, vistaCode, cost, currency } = req.body;
    const userId = getUserId(req);

    if (!projectId || !userId || !name) {
        throw new AppError("Project ID, User ID, and Name are required", 400);
    }

    const wbs = await wbsServices.addWBS(projectId, userId, parentId, {
        name,
        description,
        vistaCode,
        cost,
        currency,
    });
    res.status(201).json(wbs);
});

/**
 * PUT /projects/:projectId/wbs/:wbsId
 * Updates an existing WBS node.
 */
export const updateWBSHandler = asyncHandler(async (req: Request, res: Response) => {
    const { projectId, wbsId } = req.params;
    const { name, description, vistaCode, cost, currency } = req.body;
    const userId = getUserId(req);

    if (!projectId || !userId || !wbsId) {
        throw new AppError("Project ID, User ID, and WBS ID are required", 400);
    }

    const wbs = await wbsServices.updateWBS(wbsId, userId, {
        name,
        description,
        vistaCode,
        cost,
        currency,
    });
    res.status(200).json(wbs);
});

/**
 * POST /projects/:projectId/wbs/:wbsId/access
 * Adds direct access to a WBS node for a target user.
 */
export const addAccessHandler = asyncHandler(async (req: Request, res: Response) => {
    const { projectId, wbsId } = req.params;
    const { userId: targetUserId } = req.body;
    const currentUserId = getUserId(req);

    if (!projectId || !wbsId || !currentUserId || !targetUserId) {
        throw new AppError("Project ID, WBS ID, and both User IDs are required", 400);
    }

    const result = await wbsServices.addAccessToWBS(wbsId, currentUserId, targetUserId);
    res.status(200).json(result);
});

/**
 * DELETE /projects/:projectId/wbs/:wbsId/access
 * Removes direct access from a WBS node for a target user.
 */
export const removeAccessHandler = asyncHandler(async (req: Request, res: Response) => {
    const { projectId, wbsId } = req.params;
    const { userId: targetUserId } = req.body;
    const currentUserId = getUserId(req);

    if (!projectId || !wbsId || !currentUserId || !targetUserId) {
        throw new AppError("Project ID, WBS ID, and both User IDs are required", 400);
    }

    const result = await wbsServices.removeAccessFromWBS(wbsId, currentUserId, targetUserId);
    res.status(200).json(result);
});
