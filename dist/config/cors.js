"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = void 0;
const cors_1 = __importDefault(require("cors"));
const corsOptions = {
    origin: ["http://localhost:3000"], // Allow frontend domain
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
};
exports.corsMiddleware = (0, cors_1.default)(corsOptions);
