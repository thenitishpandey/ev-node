"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = require("./config/cors");
const middlewares_1 = require("./config/middlewares");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_routes_1 = __importDefault(require("./routes/user-routes"));
const project_routes_1 = __importDefault(require("./routes/project-routes"));
const sheet_routes_1 = __importDefault(require("./routes/sheet-routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use((0, cookie_parser_1.default)());
app.use(cors_1.corsMiddleware);
app.use(middlewares_1.rateLimitMiddleware);
app.use(middlewares_1.helmetMiddleware);
app.use(middlewares_1.compressionMiddleware);
app.use(express_1.default.json());
app.use(middlewares_1.GlobalErrorHandler);
// Register Sub-Routers
app.use("/api/users", user_routes_1.default);
app.use("/api/projects", project_routes_1.default);
app.use("/api/sheets", sheet_routes_1.default);
exports.default = app;
