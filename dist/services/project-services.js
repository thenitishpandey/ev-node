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
class ProjectServices {
    getUserProjects(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ownedProjects = yield client_1.default.project.findMany({
                where: {
                    ownerId: userId,
                },
            });
            const assignedProjects = yield client_1.default.project.findMany({
                where: {
                    members: {
                        some: {
                            userId: userId,
                        },
                    },
                },
            });
            return [...ownedProjects, ...assignedProjects];
        });
    }
    getProject(projectId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // check if the user is the owner of the project, or a member
            const project = yield client_1.default.project.findFirst({
                where: {
                    id: projectId,
                    OR: [
                        {
                            ownerId: userId,
                        },
                        {
                            members: {
                                some: {
                                    id: userId,
                                },
                            },
                        },
                    ],
                },
                include: {
                    members: {
                        include: {
                            user: true,
                        },
                    },
                    invites: true,
                    stakeholders: true,
                },
            });
            if (!project)
                throw new errors_1.AppError("Project not found", 404);
            return project;
        });
    }
    createProject(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.default.project.create({
                data: Object.assign(Object.assign({}, data), { ownerId: userId }),
            });
        });
    }
    updateProject(projectId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.default.project.update({
                where: {
                    id: projectId,
                },
                data: Object.assign({}, data),
            });
        });
    }
    inviteUserToProject(projectId, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield client_1.default.user.findFirst({
                where: {
                    email,
                },
            });
            if (!user)
                throw new errors_1.AppError("User not found", 404);
            // check if the user is already a member of the project, or has been invited
            const project = yield client_1.default.project.findFirst({
                where: {
                    id: projectId,
                    OR: [
                        {
                            ownerId: user.id,
                        },
                        {
                            members: {
                                some: {
                                    id: user.id,
                                },
                            },
                        },
                        {
                            invites: {
                                some: {
                                    userId: user.id,
                                },
                            },
                        },
                    ],
                },
            });
            if (project)
                throw new errors_1.AppError("User is already a member of the project", 400);
            return client_1.default.invites.create({
                data: {
                    projectId,
                    email: user.email,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                },
            });
        });
    }
    addStakeholderToProject(projectId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.default.stakeHolders.create({
                data: Object.assign({ projectId }, data),
            });
        });
    }
    removeStakeholderFromProject(projectId, stakeholderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.default.stakeHolders.delete({
                where: {
                    id: stakeholderId,
                },
            });
        });
    }
}
exports.default = new ProjectServices();
