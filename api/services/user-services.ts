import { AppError } from "../config/errors";
import prisma from "../prisma/client";

class UserService {
    async createUser(data: { name: string; email: string; password: string }) {
        // check if user already exists
        const user = await this.findUserByEmail(data.email);
        if (user) {
            throw new AppError("User already exists", 400);
        }
        return prisma.user.create({
            data,
        });
    }

    async findUserByEmail(email: string) {
        return prisma.user.findUnique({
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
    }

    async findUserById(id: string) {
        return prisma.user.findUnique({
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
    }

    async updateUser(
        id: string,
        data: { name: string; avatar: string; address: string; phone: string }
    ) {
        return prisma.user.update({
            where: {
                id,
            },
            data,
        });
    }

    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: {
                email,
                password,
            },
            include: {
                invites: true,
            },
        });
        if (!user) {
            throw new AppError("Invalid credentials", 401);
        }
        return user;
    }

    async getUserById(id: string) {
        const user = await prisma.user.findUnique({
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
            throw new AppError("User not found", 404);
        }
        return user;
    }

    async updatePassword(id: string, oldPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({
            where: {
                id,
            },
        });
        if (!user) {
            throw new AppError("User not found", 404);
        }
        if (user.password !== oldPassword) {
            throw new AppError("Invalid old password", 400);
        }
        return prisma.user.update({
            where: {
                id,
            },
            data: {
                password: newPassword,
            },
        });
    }

    async acceptInvite(userId: string, inviteId: string) {
        const invite = await prisma.invites.findUnique({
            where: {
                id: inviteId,
            },
        });
        if (!invite) {
            throw new AppError("Invite not found", 404);
        }
        if (invite.userId !== userId) {
            throw new AppError("Unauthorized", 401);
        }
        if (invite.status !== "PENDING") {
            throw new AppError("Invite already accepted", 400);
        }
        const expiry = new Date(invite.expiresAt);
        if (expiry < new Date()) {
            await prisma.invites.update({
                where: {
                    id: inviteId,
                },
                data: {
                    status: "EXPIRED",
                },
            });
            throw new AppError("Invite expired", 400);
        }
        await prisma.members.create({
            data: {
                projectId: invite.projectId,
                userId: userId,
                role: "MEMBER",
            },
        });
        return prisma.invites.update({
            where: {
                id: inviteId,
            },
            data: {
                status: "ACCEPTED",
            },
        });
    }

    async rejectInvite(userId: string, inviteId: string) {
        const invite = await prisma.invites.findUnique({
            where: {
                id: inviteId,
            },
        });
        if (!invite) {
            throw new AppError("Invite not found", 404);
        }
        if (invite.userId !== userId) {
            throw new AppError("Unauthorized", 401);
        }
        if (invite.status !== "PENDING") {
            throw new AppError("Invite already accepted", 400);
        }
        const expiry = new Date(invite.expiresAt);
        if (expiry < new Date()) {
            await prisma.invites.update({
                where: {
                    id: inviteId,
                },
                data: {
                    status: "EXPIRED",
                },
            });
            throw new AppError("Invite expired", 400);
        }
        return prisma.invites.update({
            where: {
                id: inviteId,
            },
            data: {
                status: "REJECTED",
            },
        });
    }
}

export default new UserService();
