import express from "express";
import dotenv from "dotenv";
import { corsMiddleware } from "./config/cors";
import {
    rateLimitMiddleware,
    helmetMiddleware,
    compressionMiddleware,
    GlobalErrorHandler,
} from "./config/middlewares";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user-routes";
import projectRouter from "./routes/project-routes";
import sheetRoutes from "./routes/sheet-routes";

dotenv.config();

const app = express();

// Middlewares
app.use(cookieParser());
app.use(corsMiddleware);
app.use(rateLimitMiddleware);
app.use(helmetMiddleware);
app.use(compressionMiddleware);
app.use(express.json());
app.use(GlobalErrorHandler);

// Register Sub-Routers
app.use("/api/users", userRouter);
app.use("/api/projects", projectRouter);
app.use("/api/sheets", sheetRoutes);

export default app;
