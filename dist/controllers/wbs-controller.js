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
exports.removeAccessHandler = exports.addAccessHandler = exports.updateWBSHandler = exports.createWBSHandler = exports.getProjectUserWBSHandler = exports.getProjectWBSHandler = void 0;
const wbs_services_1 = __importDefault(require("../services/wbs-services"));
const errors_1 = require("../config/errors");
const authentication_1 = require("../config/authentication");
/**
 * Wrapper to handle async errors without try/catch in every handler.
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
/**
 * GET /projects/:projectId/wbs
 * Retrieves all WBS nodes for a given project.
 */
exports.getProjectWBSHandler = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    if (!projectId)
        throw new errors_1.AppError("Project ID is required", 400);
    const wbs = yield wbs_services_1.default.getProjectWBS(projectId);
    res.status(200).json(wbs);
}));
/**
 * GET /projects/:projectId/wbs/user
 * Retrieves the WBS tree accessible by the current user.
 */
exports.getProjectUserWBSHandler = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const userId = (0, authentication_1.getUserId)(req);
    if (!projectId || !userId) {
        throw new errors_1.AppError("Project ID and User ID are required", 400);
    }
    const wbs = yield wbs_services_1.default.getProjectWBSofUser(userId, projectId);
    res.status(200).json(wbs);
}));
/**
 * POST /projects/:projectId/wbs
 * Creates a new WBS node. The creator automatically receives ADMIN access.
 */
exports.createWBSHandler = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const { parentId, name, description, vistaCode, cost, currency } = req.body;
    const userId = (0, authentication_1.getUserId)(req);
    if (!projectId || !userId || !name) {
        throw new errors_1.AppError("Project ID, User ID, and Name are required", 400);
    }
    const wbs = yield wbs_services_1.default.addWBS(projectId, userId, parentId, {
        name,
        description,
        vistaCode,
        cost,
        currency,
    });
    res.status(201).json(wbs);
}));
/**
 * PUT /projects/:projectId/wbs/:wbsId
 * Updates an existing WBS node.
 */
exports.updateWBSHandler = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId, wbsId } = req.params;
    const { name, description, vistaCode, cost, currency } = req.body;
    const userId = (0, authentication_1.getUserId)(req);
    if (!projectId || !userId || !wbsId) {
        throw new errors_1.AppError("Project ID, User ID, and WBS ID are required", 400);
    }
    const wbs = yield wbs_services_1.default.updateWBS(wbsId, userId, {
        name,
        description,
        vistaCode,
        cost,
        currency,
    });
    res.status(200).json(wbs);
}));
/**
 * POST /projects/:projectId/wbs/:wbsId/access
 * Adds direct access to a WBS node for a target user.
 */
exports.addAccessHandler = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId, wbsId } = req.params;
    const { userId: targetUserId } = req.body;
    const currentUserId = (0, authentication_1.getUserId)(req);
    if (!projectId || !wbsId || !currentUserId || !targetUserId) {
        throw new errors_1.AppError("Project ID, WBS ID, and both User IDs are required", 400);
    }
    const result = yield wbs_services_1.default.addAccessToWBS(wbsId, currentUserId, targetUserId);
    res.status(200).json(result);
}));
/**
 * DELETE /projects/:projectId/wbs/:wbsId/access
 * Removes direct access from a WBS node for a target user.
 */
exports.removeAccessHandler = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId, wbsId } = req.params;
    const { userId: targetUserId } = req.body;
    const currentUserId = (0, authentication_1.getUserId)(req);
    if (!projectId || !wbsId || !currentUserId || !targetUserId) {
        throw new errors_1.AppError("Project ID, WBS ID, and both User IDs are required", 400);
    }
    const result = yield wbs_services_1.default.removeAccessFromWBS(wbsId, currentUserId, targetUserId);
    res.status(200).json(result);
}));
