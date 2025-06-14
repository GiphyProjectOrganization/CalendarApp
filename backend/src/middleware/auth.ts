import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "..";

export interface AuthRequest extends Request {
    userId?: string;
    user?: User; 
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Invalid token" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, "secret_token_do_not_share") as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
        return;
    }
};