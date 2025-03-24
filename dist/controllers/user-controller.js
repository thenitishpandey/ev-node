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
exports.createUser = createUser;
exports.login = login;
exports.fetchProfile = fetchProfile;
exports.updateProfile = updateProfile;
exports.updatePassword = updatePassword;
exports.AcceptInvite = AcceptInvite;
exports.logout = logout;
exports.RejectInvite = RejectInvite;
const user_services_1 = __importDefault(require("../services/user-services"));
const errors_1 = require("../config/errors");
const jwt_1 = __importDefault(require("../utils/jwt"));
const authentication_1 = require("../config/authentication");
/**
 * POST /users
 * Creates a new user.
 */
function createUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                res.status(400).json({ error: "Name, email, and password are required" });
                return;
            }
            const user = yield user_services_1.default.createUser({ name, email, password });
            res.status(201).json(user);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    });
}
/**
 * POST /users/login
 * Logs in a user.
 */
function login(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: "Email and password are required" });
                return;
            }
            const user = yield user_services_1.default.login(email, password);
            const token = jwt_1.default.encodeToJWT({ id: user.id, name: user.name, email: user.email });
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
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    });
}
/**
 * GET /users/profile
 * Fetches user profile.
 */
function fetchProfile(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // get user-id from cookie token
            const token = req.cookies["token"];
            if (!token) {
                throw new errors_1.AppError("Unauthorized", 401);
            }
            const decoded = jwt_1.default.decodeJWT(token);
            if (!decoded) {
                throw new errors_1.AppError("Unauthorized", 401);
            }
            // get user by id
            const user = yield user_services_1.default.getUserById(decoded.id);
            res.status(200).json(user);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    });
}
/**
 * PUT /users/profile
 * Updates user profile.
 */
function updateProfile(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // get user-id from cookie token
            const token = req.cookies["token"];
            if (!token) {
                throw new errors_1.AppError("Unauthorized- Missing Token", 401);
            }
            const decoded = jwt_1.default.decodeJWT(token);
            if (!decoded) {
                throw new errors_1.AppError("Unauthorized- Invalid Token", 401);
            }
            // update user
            const user = yield user_services_1.default.updateUser(decoded.id, req.body);
            res.status(200).json(user);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    });
}
/**
 * PUT /users/change-password
 * Updates user password.
 */
function updatePassword(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // get user-id from cookie token
            const token = req.cookies["token"];
            if (!token) {
                throw new errors_1.AppError("Unauthorized- Missing Token", 401);
            }
            const decoded = jwt_1.default.decodeJWT(token);
            if (!decoded) {
                throw new errors_1.AppError("Unauthorized- Invalid Token", 401);
            }
            // update password
            const { oldPassword, newPassword } = req.body;
            if (!oldPassword || !newPassword) {
                res.status(400).json({ error: "Old password and new password are required" });
                return;
            }
            const user = yield user_services_1.default.updatePassword(decoded.id, oldPassword, newPassword);
            res.status(200).json(user);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    });
}
/**
 * POST /users/invite
 * Invites a user to join the platform.
 */
function AcceptInvite(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // get user-id from cookie token
            const userId = (0, authentication_1.getUserId)(req);
            const { inviteId } = req.body;
            if (!inviteId || !userId) {
                throw new errors_1.AppError("Invite ID and User ID are required", 400);
            }
            // update user
            const user = yield user_services_1.default.acceptInvite(userId, inviteId);
            res.status(200).json(user);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    });
}
/**
 * POST /users/invite/accept
 * Invites a user to join the platform.
 */
function logout(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.clearCookie("token");
            res.clearCookie("user-id");
            res.status(200).json({ message: "Logged out successfully" });
        }
        catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    });
}
/**
 * POST /users/invite/reject
 * Invites a user to join the platform.
 */
function RejectInvite(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // get user-id from cookie token
            const userId = (0, authentication_1.getUserId)(req);
            const { inviteId } = req.body;
            if (!inviteId || !userId) {
                throw new errors_1.AppError("Invite ID and User ID are required", 400);
            }
            // update user
            const user = yield user_services_1.default.rejectInvite(userId, inviteId);
            res.status(200).json(user);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    });
}
