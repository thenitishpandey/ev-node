import { AppError } from "../config/errors";
import prisma from "../prisma/client";
import { Prisma, WBSAccessRole } from "@prisma/client";

// Type for WBS with its access relation.
type WBSWithAccess = Prisma.WBSGetPayload<{ include: { access: true } }>;

// Extend that type to include a children property for tree building.
export type WbsNode = WBSWithAccess & { children: WbsNode[] };

class WBSServices {
    // Public Functions

    /**
     * Get all WBS nodes for a given project.
     */
    async getProjectWBS(projectId: string) {
        return await prisma.wBS.findMany({
            where: { projectId },
        });
    }

    /**
     * Get the accessible WBS nodes for a user within a project.
     * Builds a tree structure based on the nodes the user has access to.
     */
    async getProjectWBSofUser(userId: string, projectId: string): Promise<WbsNode[]> {
        const nodes = (await prisma.wBS.findMany({
            where: {
                projectId,
                access: { some: { userId } },
            },
            include: { access: true },
        })) as WBSWithAccess[];

        const nodeMap = new Map<string, WbsNode>();
        const roots: WbsNode[] = [];

        // Build the node map with an empty children array.
        for (const node of nodes) {
            nodeMap.set(node.id, { ...node, children: [] });
        }

        // Assemble the tree from the flat list.
        for (const node of nodes) {
            const mappedNode = nodeMap.get(node.id)!;
            if (node.parentId && nodeMap.has(node.parentId)) {
                nodeMap.get(node.parentId)!.children.push(mappedNode);
            } else {
                roots.push(mappedNode);
            }
        }
        return roots;
    }

    /**
     * Add a new WBS node.
     * - Creator gets direct ADMIN access.
     * - If added under a parent, inherited access from ancestors is propagated.
     */
    async addWBS(
        projectId: string,
        userId: string,
        parentId: string | null,
        data: {
            name: string;
            description?: string;
            vistaCode?: string;
            cost?: number;
            currency?: string;
        }
    ) {
        let level = 1;
        let sequence = "1";

        if (parentId) {
            const parent = await prisma.wBS.findUnique({ where: { id: parentId } });
            if (!parent) {
                throw new AppError("Parent node not found", 404);
            }
            level = (parent.level || 1) + 1;
            const siblingsCount = await prisma.wBS.count({
                where: { parentId, projectId },
            });
            sequence = parent.sequenceNumber + "." + (siblingsCount + 1);
        } else {
            const rootCount = await prisma.wBS.count({
                where: { projectId, parentId: null },
            });
            sequence = (rootCount + 1).toString();
        }

        const newNode = await prisma.wBS.create({
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
                parentId: parentId ?? undefined,
            },
        });

        // Creator always gets direct ADMIN access.
        await prisma.wBSAccess.create({
            data: {
                userId,
                wbsId: newNode.id,
                role: WBSAccessRole.ADMIN,
                isInherited: false,
            },
        });

        // Propagate inherited access from ancestors if applicable.
        if (parentId) {
            await this._propagateInheritedAccessForNewNode(newNode.id, parentId, userId);
        }

        return newNode;
    }

    /**
     * Update a WBS node's details.
     * Only allowed if the requester is the creator or has ADMIN access.
     */
    async updateWBS(
        wbsId: string,
        userId: string,
        data: {
            name?: string;
            description?: string;
            vistaCode?: string;
            cost?: number;
            currency?: string;
        }
    ) {
        const node = await prisma.wBS.findUnique({
            where: { id: wbsId },
            include: { access: true },
        });
        if (!node) {
            throw new AppError("WBS node not found", 404);
        }
        const hasAdminAccess =
            node.access.some((a) => a.userId === userId && a.role === WBSAccessRole.ADMIN) ||
            node.createdBy === userId;
        if (!hasAdminAccess) {
            throw new AppError("Access denied", 403);
        }
        return await prisma.wBS.update({
            where: { id: wbsId },
            data,
        });
    }

    /**
     * Add direct access to a WBS node for a target user.
     * Enforces one access record per user.
     * Propagates inherited access to descendants.
     */
    async addAccessToWBS(
        wbsId: string,
        currentUserId: string,
        targetUserId: string,
        role: WBSAccessRole = WBSAccessRole.VIEWER
    ) {
        const node = await prisma.wBS.findUnique({
            where: { id: wbsId },
            include: { access: true },
        });
        if (!node) {
            throw new AppError("WBS node not found", 404);
        }
        const hasAdminAccess =
            node.access.some((a) => a.userId === currentUserId && a.role === WBSAccessRole.ADMIN) ||
            node.createdBy === currentUserId;
        if (!hasAdminAccess) {
            throw new AppError("Access denied", 403);
        }

        // Ensure the target user does not already have direct access.
        const existingAccess = await prisma.wBSAccess.findFirst({
            where: { wbsId, userId: targetUserId, isInherited: false },
        });
        if (existingAccess) {
            return existingAccess;
        }

        const newAccess = await prisma.wBSAccess.create({
            data: {
                userId: targetUserId,
                wbsId,
                role,
                isInherited: false,
            },
        });
        // Propagate inherited access to all descendant nodes.
        await this._propagateAccessAddition(wbsId, targetUserId, role);
        return newAccess;
    }

    /**
     * Remove direct access from a WBS node for a target user.
     * Also removes any inherited access from descendant nodes.
     */
    async removeAccessFromWBS(wbsId: string, currentUserId: string, targetUserId: string) {
        const node = await prisma.wBS.findUnique({
            where: { id: wbsId },
            include: { access: true },
        });
        if (!node) {
            throw new AppError("WBS node not found", 404);
        }
        const hasAdminAccess =
            node.access.some((a) => a.userId === currentUserId && a.role === WBSAccessRole.ADMIN) ||
            node.createdBy === currentUserId;
        if (!hasAdminAccess) {
            throw new AppError("Access denied", 403);
        }
        await prisma.wBSAccess.deleteMany({
            where: { wbsId, userId: targetUserId, isInherited: false },
        });
        await this._propagateAccessRemoval(wbsId, targetUserId);
        return { message: "Access removed" };
    }

    // Private Helper Functions

    /**
     * Propagate inherited access from the ancestor chain to the new node.
     * The creator is excluded because they already have direct ADMIN access.
     */
    private async _propagateInheritedAccessForNewNode(
        newWbsId: string,
        parentId: string,
        creatorId: string
    ) {
        let currentParentId: string | null = parentId;
        const inheritedAccesses = new Map<string, WBSAccessRole>();

        while (currentParentId) {
            const parentNode: WBSWithAccess | null = await prisma.wBS.findUnique({
                where: { id: currentParentId },
                include: { access: true },
            });
            if (!parentNode) break;
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
            await prisma.wBSAccess.createMany({
                data: accessData,
                skipDuplicates: true,
            });
        }
    }

    /**
     * Iteratively propagate direct access addition as inherited access
     * to all descendant nodes.
     */
    private async _propagateAccessAddition(wbsId: string, userId: string, role: WBSAccessRole) {
        const queue: string[] = [wbsId];
        while (queue.length) {
            const currentWbsId = queue.shift()!;
            const children = await prisma.wBS.findMany({ where: { parentId: currentWbsId } });
            for (const child of children) {
                const exists = await prisma.wBSAccess.findFirst({
                    where: { wbsId: child.id, userId, isInherited: true },
                });
                if (!exists) {
                    await prisma.wBSAccess.create({
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
    }

    /**
     * Iteratively remove inherited access from all descendant nodes.
     */
    private async _propagateAccessRemoval(wbsId: string, userId: string) {
        const queue: string[] = [wbsId];
        while (queue.length) {
            const currentWbsId = queue.shift()!;
            const children = await prisma.wBS.findMany({ where: { parentId: currentWbsId } });
            for (const child of children) {
                await prisma.wBSAccess.deleteMany({
                    where: {
                        wbsId: child.id,
                        userId,
                        isInherited: true,
                    },
                });
                queue.push(child.id);
            }
        }
    }
}

export default new WBSServices();
