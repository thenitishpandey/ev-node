"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserId = exports.checkIsUser = void 0;
const jwt_1 = __importDefault(require("../utils/jwt"));
const errors_1 = require("./errors");
const checkIsUser = (req, res, next) => {
    var _a;
    try {
        const cookieToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token; // Ensure `cookie-parser` is used
        console.log("Token:", cookieToken);
        if (!cookieToken) {
            res.status(403).json({ message: "Unauthorized - No Token Provided" });
            return;
        }
        const decoded = jwt_1.default.decodeJWT(cookieToken);
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
    }
    catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.checkIsUser = checkIsUser;
const getUserId = (req) => {
    const cookieToken = req.cookies["token"];
    if (!cookieToken) {
        throw new errors_1.AppError("Token is required", 401);
    }
    const decoded = jwt_1.default.decodeJWT(cookieToken);
    if (!decoded) {
        throw new errors_1.AppError("Invalid Token", 401);
    }
    return decoded.id;
};
exports.getUserId = getUserId;
