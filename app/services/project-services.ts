import { AppError } from "../config/errors";
import prisma from "../prisma/client";

class ProjectServices {
    async getUserProjects(userId: string) {
        const ownedProjects = await prisma.project.findMany({
            where: {
                ownerId: userId,
            },
        });
        const assignedProjects = await prisma.project.findMany({
            where: {
                members: {
                    some: {
                        userId: userId,
                    },
                },
            },
        });
        return [...ownedProjects, ...assignedProjects];
    }

    async getProject(projectId: string, userId: string) {
        // check if the user is the owner of the project, or a member
        const project = await prisma.project.findFirst({
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
        if (!project) throw new AppError("Project not found", 404);
        return project;
    }

    async createProject(
        userId: string,
        data: {
            name: string;
            startDate: string;
            description?: string;
            logo?: string;
            endDate: string;
            projectCode: string;
            address: string;
            status: string;
        }
    ) {
        return prisma.project.create({
            data: {
                ...data,
                ownerId: userId,
            },
        });
    }

    async updateProject(
        projectId: string,
        data: {
            name: string;
            description?: string;
            logo?: string;
            startDate: string;
            endDate: string;
            projectCode: string;
            address: string;
            status: string;
        }
    ) {
        return prisma.project.update({
            where: {
                id: projectId,
            },
            data: {
                ...data,
            },
        });
    }

    async inviteUserToProject(projectId: string, email: string) {
        const user = await prisma.user.findFirst({
            where: {
                email,
            },
        });
        if (!user) throw new AppError("User not found", 404);
        // check if the user is already a member of the project, or has been invited
        const project = await prisma.project.findFirst({
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
        if (project) throw new AppError("User is already a member of the project", 400);
        return prisma.invites.create({
            data: {
                projectId,
                email: user.email,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
        });
    }

    async addStakeholderToProject(
        projectId: string,
        data: { email: string; role: string; name: string; phone: string }
    ) {
        return prisma.stakeHolders.create({
            data: {
                projectId,
                ...data,
            },
        });
    }

    async removeStakeholderFromProject(projectId: string, stakeholderId: string) {
        return prisma.stakeHolders.delete({
            where: {
                id: stakeholderId,
            },
        });
    }
}

export default new ProjectServices();
