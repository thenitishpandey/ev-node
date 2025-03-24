"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalErrorHandler = exports.compressionMiddleware = exports.helmetMiddleware = exports.rateLimitMiddleware = void 0;
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errors_1 = require("./errors");
exports.rateLimitMiddleware = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again later.",
    headers: true,
});
exports.helmetMiddleware = (0, helmet_1.default)();
exports.compressionMiddleware = (0, compression_1.default)({
    level: 6, // Medium compression level (0-9)
    threshold: 1024, // Compress responses larger than 1KB
});
const GlobalErrorHandler = (err, req, res, next) => {
    if (err instanceof errors_1.AppError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }
    res.status(500).json({ message: "An unexpected error occurred" });
    return;
};
exports.GlobalErrorHandler = GlobalErrorHandler;
