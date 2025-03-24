import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { NextFunction, Request, Response } from "express";
import { AppError } from "./errors";

export const rateLimitMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again later.",
    headers: true,
});

export const helmetMiddleware = helmet();

export const compressionMiddleware = compression({
    level: 6, // Medium compression level (0-9)
    threshold: 1024, // Compress responses larger than 1KB
});

export const GlobalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }
    res.status(500).json({ message: "An unexpected error occurred" });
    return;
};
