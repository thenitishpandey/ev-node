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
const errors_1 = require("../config/errors");
const client_1 = __importDefault(require("../prisma/client"));
const client_2 = require("@prisma/client");
class WBSServices {
    // Public Functions
    /**
     * Get all WBS nodes for a given project.
     */
    getProjectWBS(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.wBS.findMany({
                where: { projectId },
            });
        });
    }
    /**
     * Get the accessible WBS nodes for a user within a project.
     * Builds a tree structure based on the nodes the user has access to.
     */
    getProjectWBSofUser(userId, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const nodes = (yield client_1.default.wBS.findMany({
                where: {
                    projectId,
                    access: { some: { userId } },
                },
                include: { access: true },
            }));
            const nodeMap = new Map();
            const roots = [];
            // Build the node map with an empty children array.
            for (const node of nodes) {
                nodeMap.set(node.id, Object.assign(Object.assign({}, node), { children: [] }));
            }
            // Assemble the tree from the flat list.
            for (const node of nodes) {
                const mappedNode = nodeMap.get(node.id);
                if (node.parentId && nodeMap.has(node.parentId)) {
                    nodeMap.get(node.parentId).children.push(mappedNode);
                }
                else {
                    roots.push(mappedNode);
                }
            }
            return roots;
        });
    }
    /**
     * Add a new WBS node.
     * - Creator gets direct ADMIN access.
     * - If added under a parent, inherited access from ancestors is propagated.
     */
    addWBS(projectId, userId, parentId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let level = 1;
            let sequence = "1";
            if (parentId) {
                const parent = yield client_1.default.wBS.findUnique({ where: { id: parentId } });
                if (!parent) {
                    throw new errors_1.AppError("Parent node not found", 404);
                }
                level = (parent.level || 1) + 1;
                const siblingsCount = yield client_1.default.wBS.count({
                    where: { parentId, projectId },
                });
                sequence = parent.sequenceNumber + "." + (siblingsCount + 1);
            }
            else {
                const rootCount = yield client_1.default.wBS.count({
                    where: { projectId, parentId: null },
                });
                sequence = (rootCount + 1).toString();
            }
            const newNode = yield client_1.default.wBS.create({
                data: {
                    name: data.name,
                    description: data.description,
                    vistaCode: data.vistaCode,
                    cost: data.cost,
                    currency: data.currency,
                    level,
                    sequenceNumber: sequence.toString(),
                    createdBy: userId,
                    projectId,
                    parentId: parentId !== null && parentId !== void 0 ? parentId : undefined,
                },
            });
            // Creator always gets direct ADMIN access.
            yield client_1.default.wBSAccess.create({
                data: {
                    userId,
                    wbsId: newNode.id,
                    role: client_2.WBSAccessRole.ADMIN,
                    isInherited: false,
                },
            });
            // Propagate inherited access from ancestors if applicable.
            if (parentId) {
                yield this._propagateInheritedAccessForNewNode(newNode.id, parentId, userId);
            }
            return newNode;
        });
    }
    /**
     * Update a WBS node's details.
     * Only allowed if the requester is the creator or has ADMIN access.
     */
    updateWBS(wbsId, userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const node = yield client_1.default.wBS.findUnique({
                where: { id: wbsId },
                include: { access: true },
            });
            if (!node) {
                throw new errors_1.AppError("WBS node not found", 404);
            }
            const hasAdminAccess = node.access.some((a) => a.userId === userId && a.role === client_2.WBSAccessRole.ADMIN) ||
                node.createdBy === userId;
            if (!hasAdminAccess) {
                throw new errors_1.AppError("Access denied", 403);
            }
            return yield client_1.default.wBS.update({
                where: { id: wbsId },
                data,
            });
        });
    }
    /**
     * Add direct access to a WBS node for a target user.
     * Enforces one access record per user.
     * Propagates inherited access to descendants.
     */
    addAccessToWBS(wbsId_1, currentUserId_1, targetUserId_1) {
        return __awaiter(this, arguments, void 0, function* (wbsId, currentUserId, targetUserId, role = client_2.WBSAccessRole.VIEWER) {
            const node = yield client_1.default.wBS.findUnique({
                where: { id: wbsId },
                include: { access: true },
            });
            if (!node) {
                throw new errors_1.AppError("WBS node not found", 404);
            }
            const hasAdminAccess = node.access.some((a) => a.userId === currentUserId && a.role === client_2.WBSAccessRole.ADMIN) ||
                node.createdBy === currentUserId;
            if (!hasAdminAccess) {
                throw new errors_1.AppError("Access denied", 403);
            }
            // Ensure the target user does not already have direct access.
            const existingAccess = yield client_1.default.wBSAccess.findFirst({
                where: { wbsId, userId: targetUserId, isInherited: false },
            });
            if (existingAccess) {
                return existingAccess;
            }
            const newAccess = yield client_1.default.wBSAccess.create({
                data: {
                    userId: targetUserId,
                    wbsId,
                    role,
                    isInherited: false,
                },
            });
            // Propagate inherited access to all descendant nodes.
            yield this._propagateAccessAddition(wbsId, targetUserId, role);
            return newAccess;
        });
    }
    /**
     * Remove direct access from a WBS node for a target user.
     * Also removes any inherited access from descendant nodes.
     */
    removeAccessFromWBS(wbsId, currentUserId, targetUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const node = yield client_1.default.wBS.findUnique({
                where: { id: wbsId },
                include: { access: true },
            });
            if (!node) {
                throw new errors_1.AppError("WBS node not found", 404);
            }
            const hasAdminAccess = node.access.some((a) => a.userId === currentUserId && a.role === client_2.WBSAccessRole.ADMIN) ||
                node.createdBy === currentUserId;
            if (!hasAdminAccess) {
                throw new errors_1.AppError("Access denied", 403);
            }
            yield client_1.default.wBSAccess.deleteMany({
                where: { wbsId, userId: targetUserId, isInherited: false },
            });
            yield this._propagateAccessRemoval(wbsId, targetUserId);
            return { message: "Access removed" };
        });
    }
    // Private Helper Functions
    /**
     * Propagate inherited access from the ancestor chain to the new node.
     * The creator is excluded because they already have direct ADMIN access.
     */
    _propagateInheritedAccessForNewNode(newWbsId, parentId, creatorId) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentParentId = parentId;
            const inheritedAccesses = new Map();
            while (currentParentId) {
                const parentNode = yield client_1.default.wBS.findUnique({
                    where: { id: currentParentId },
                    include: { access: true },
                });
                if (!parentNode)
                    break;
                for (const access of parentNode.access) {
                    if (access.userId !== creatorId && !inheritedAccesses.has(access.userId)) {
                        inheritedAccesses.set(access.userId, access.role);
                    }
                }
                currentParentId = parentNode.parentId;
            }
            const accessData = Array.from(inheritedAccesses.entries()).map(([userId, role]) => ({
                userId,
                wbsId: newWbsId,
                role,
                isInherited: true,
            }));
            if (accessData.length > 0) {
                yield client_1.default.wBSAccess.createMany({
                    data: accessData,
                    skipDuplicates: true,
                });
            }
        });
    }
    /**
     * Iteratively propagate direct access addition as inherited access
     * to all descendant nodes.
     */
    _propagateAccessAddition(wbsId, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const queue = [wbsId];
            while (queue.length) {
                const currentWbsId = queue.shift();
                const children = yield client_1.default.wBS.findMany({ where: { parentId: currentWbsId } });
                for (const child of children) {
                    const exists = yield client_1.default.wBSAccess.findFirst({
                        where: { wbsId: child.id, userId, isInherited: true },
                    });
                    if (!exists) {
                        yield client_1.default.wBSAccess.create({
                            data: {
                                wbsId: child.id,
                                userId,
                                role,
                                isInherited: true,
                            },
                        });
                    }
                    queue.push(child.id);
                }
            }
        });
    }
    /**
     * Iteratively remove inherited access from all descendant nodes.
     */
    _propagateAccessRemoval(wbsId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const queue = [wbsId];
            while (queue.length) {
                const currentWbsId = queue.shift();
                const children = yield client_1.default.wBS.findMany({ where: { parentId: currentWbsId } });
                for (const child of children) {
                    yield client_1.default.wBSAccess.deleteMany({
                        where: {
                            wbsId: child.id,
                            userId,
                            isInherited: true,
                        },
                    });
                    queue.push(child.id);
                }
            }
        });
    }
}
exports.default = new WBSServices();
