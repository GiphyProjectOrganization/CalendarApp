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
        res.status(401).json({ message: "Authorization header missing" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, "secret_token_do_not_share") as { userId: string };
        if (!decoded.userId) {
            res.status(401).json({ message: "Token missing user ID" });
            return;
        }
        console.log('Decoded token:', decoded);
        req.userId = decoded.userId;
        next();
    } catch (err: any) {
        console.error('Token verification error:', err);
        if (err.name === 'TokenExpiredError') {
            res.status(401).json({ message: "Token expired" });
            return;
        }
        if (err.name === 'JsonWebTokenError') {
            if (err.message.includes('invalid signature')) {
                res.status(401).json({ message: "Token signature invalid - possible secret mismatch" });
                return
            }
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        res.status(401).json({ message: "Not authorized" });
    }
};