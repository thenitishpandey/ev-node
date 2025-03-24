import { Request, Response, NextFunction } from "express";
import userService from "../services/user-services";
import { AppError } from "../config/errors";
import JWTUtil from "../utils/jwt";
import { getUserId } from "../config/authentication";

/**
 * POST /users
 * Creates a new user.
 */

export async function createUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ error: "Name, email, and password are required" });
            return;
        }
        const user = await userService.createUser({ name, email, password });
        res.status(201).json(user);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

/**
 * POST /users/login
 * Logs in a user.
 */

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }
        const user = await userService.login(email, password);
        const token = JWTUtil.encodeToJWT({ id: user.id, name: user.name, email: user.email });
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 86400000,
        });
        res.cookie("user-id", user.id, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 86400000,
        });

        res.status(200).json(user);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

/**
 * GET /users/profile
 * Fetches user profile.
 */

export async function fetchProfile(req: Request, res: Response, next: NextFunction) {
    try {
        // get user-id from cookie token
        const token = req.cookies["token"];
        if (!token) {
            throw new AppError("Unauthorized", 401);
        }
        const decoded = JWTUtil.decodeJWT(token);
        if (!decoded) {
            throw new AppError("Unauthorized", 401);
        }
        // get user by id
        const user = await userService.getUserById(decoded.id);
        res.status(200).json(user);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

/**
 * PUT /users/profile
 * Updates user profile.
 */

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
        // get user-id from cookie token
        const token = req.cookies["token"];
        if (!token) {
            throw new AppError("Unauthorized- Missing Token", 401);
        }
        const decoded = JWTUtil.decodeJWT(token);
        if (!decoded) {
            throw new AppError("Unauthorized- Invalid Token", 401);
        }
        // update user
        const user = await userService.updateUser(decoded.id, req.body);
        res.status(200).json(user);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

/**
 * PUT /users/change-password
 * Updates user password.
 */

export async function updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
        // get user-id from cookie token
        const token = req.cookies["token"];
        if (!token) {
            throw new AppError("Unauthorized- Missing Token", 401);
        }
        const decoded = JWTUtil.decodeJWT(token);
        if (!decoded) {
            throw new AppError("Unauthorized- Invalid Token", 401);
        }
        // update password
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            res.status(400).json({ error: "Old password and new password are required" });
            return;
        }
        const user = await userService.updatePassword(decoded.id, oldPassword, newPassword);
        res.status(200).json(user);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

/**
 * POST /users/invite
 * Invites a user to join the platform.
 */

export async function AcceptInvite(req: Request, res: Response, next: NextFunction) {
    try {
        // get user-id from cookie token
        const userId = getUserId(req);
        const { inviteId } = req.body;
        if (!inviteId || !userId) {
            throw new AppError("Invite ID and User ID are required", 400);
        }
        // update user
        const user = await userService.acceptInvite(userId, inviteId);
        res.status(200).json(user);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

/**
 * POST /users/invite/accept
 * Invites a user to join the platform.
 */

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        res.clearCookie("token");
        res.clearCookie("user-id");
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * POST /users/invite/reject
 * Invites a user to join the platform.
 */

export async function RejectInvite(req: Request, res: Response, next: NextFunction) {
    try {
        // get user-id from cookie token
        const userId = getUserId(req);
        const { inviteId } = req.body;
        if (!inviteId || !userId) {
            throw new AppError("Invite ID and User ID are required", 400);
        }
        // update user
        const user = await userService.rejectInvite(userId, inviteId);
        res.status(200).json(user);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
            return;
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
