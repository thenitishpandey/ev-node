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
class UserService {
    createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // check if user already exists
            const user = yield this.findUserByEmail(data.email);
            if (user) {
                throw new errors_1.AppError("User already exists", 400);
            }
            return client_1.default.user.create({
                data,
            });
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.default.user.findUnique({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    address: true,
                    phone: true,
                },
                where: {
                    email,
                },
            });
        });
    }
    findUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.default.user.findUnique({
                where: {
                    id,
                },
                // include: {
                //     invites: true,
                // },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    address: true,
                    phone: true,
                    invites: {
                        include: {
                            project: true,
                        },
                    },
                },
            });
        });
    }
    updateUser(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.default.user.update({
                where: {
                    id,
                },
                data,
            });
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield client_1.default.user.findUnique({
                where: {
                    email,
                    password,
                },
                include: {
                    invites: true,
                },
            });
            if (!user) {
                throw new errors_1.AppError("Invalid credentials", 401);
            }
            return user;
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield client_1.default.user.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    address: true,
                    phone: true,
                    invites: {
                        include: {
                            project: true,
                        },
                    },
                },
            });
            if (!user) {
                throw new errors_1.AppError("User not found", 404);
            }
            return user;
        });
    }
    updatePassword(id, oldPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield client_1.default.user.findUnique({
                where: {
                    id,
                },
            });
            if (!user) {
                throw new errors_1.AppError("User not found", 404);
            }
            if (user.password !== oldPassword) {
                throw new errors_1.AppError("Invalid old password", 400);
            }
            return client_1.default.user.update({
                where: {
                    id,
                },
                data: {
                    password: newPassword,
                },
            });
        });
    }
    acceptInvite(userId, inviteId) {
        return __awaiter(this, void 0, void 0, function* () {
            const invite = yield client_1.default.invites.findUnique({
                where: {
                    id: inviteId,
                },
            });
            if (!invite) {
                throw new errors_1.AppError("Invite not found", 404);
            }
            if (invite.userId !== userId) {
                throw new errors_1.AppError("Unauthorized", 401);
            }
            if (invite.status !== "PENDING") {
                throw new errors_1.AppError("Invite already accepted", 400);
            }
            const expiry = new Date(invite.expiresAt);
            if (expiry < new Date()) {
                yield client_1.default.invites.update({
                    where: {
                        id: inviteId,
                    },
                    data: {
                        status: "EXPIRED",
                    },
                });
                throw new errors_1.AppError("Invite expired", 400);
            }
            yield client_1.default.members.create({
                data: {
                    projectId: invite.projectId,
                    userId: userId,
                    role: "MEMBER",
                },
            });
            return client_1.default.invites.update({
                where: {
                    id: inviteId,
                },
                data: {
                    status: "ACCEPTED",
                },
            });
        });
    }
    rejectInvite(userId, inviteId) {
        return __awaiter(this, void 0, void 0, function* () {
            const invite = yield client_1.default.invites.findUnique({
                where: {
                    id: inviteId,
                },
            });
            if (!invite) {
                throw new errors_1.AppError("Invite not found", 404);
            }
            if (invite.userId !== userId) {
                throw new errors_1.AppError("Unauthorized", 401);
            }
            if (invite.status !== "PENDING") {
                throw new errors_1.AppError("Invite already accepted", 400);
            }
            const expiry = new Date(invite.expiresAt);
            if (expiry < new Date()) {
                yield client_1.default.invites.update({
                    where: {
                        id: inviteId,
                    },
                    data: {
                        status: "EXPIRED",
                    },
                });
                throw new errors_1.AppError("Invite expired", 400);
            }
            return client_1.default.invites.update({
                where: {
                    id: inviteId,
                },
                data: {
                    status: "REJECTED",
                },
            });
        });
    }
}
exports.default = new UserService();
