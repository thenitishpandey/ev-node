import cors from "cors";
import { Request, Response, NextFunction } from "express";

const corsOptions = {
    origin: ["http://localhost:3000"], // Allow frontend domain
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
};

export const corsMiddleware = cors(corsOptions);
