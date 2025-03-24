import { Request, Response, NextFunction } from "express";
import JWTUtil from "../utils/jwt";
import { AppError } from "./errors";
export const checkIsUser = (req: Request, res: Response, next: NextFunction) => {
    try {
        const cookieToken = req.cookies?.token; // Ensure `cookie-parser` is used
        console.log("Token:", cookieToken);

        if (!cookieToken) {
            res.status(403).json({ message: "Unauthorized - No Token Provided" });
            return;
        }

        const decoded = JWTUtil.decodeJWT(cookieToken);
        if (!decoded) {
            res.status(403).json({ message: "Unauthorized - Invalid Token" });
            return;
        }

        const { id } = req.params; // Ensure the param matches your route ("/:id")
        if (!id) {
            res.status(400).json({ message: "User ID is required" });
        }

        // Convert both `id` and `decoded.userId` to the same type for comparison
        if (id === decoded.id) {
            next();
            return;
        }

        res.status(403).json({ message: "Unauthorized - Insufficient Permission" });
        return;
    } catch (error: any) {
        console.error("Auth Middleware Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getUserId = (req: Request) => {
    const cookieToken = req.cookies["token"];
    if (!cookieToken) {
        throw new AppError("Token is required", 401);
    }

    const decoded = JWTUtil.decodeJWT(cookieToken);
    if (!decoded) {
        throw new AppError("Invalid Token", 401);
    }

    return decoded.id;
};
