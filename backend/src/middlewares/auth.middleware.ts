import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { AuthRequest } from '../types/express';
import env from '../config/env';
import { errorResponse } from '../utils/response';

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json(errorResponse('No token provided', 'UNAUTHORIZED'));
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number };

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            res.status(401).json(errorResponse('User not found', 'UNAUTHORIZED'));
            return;
        }

        if (user.status !== 'active') {
            res.status(403).json(errorResponse('Account is inactive', 'FORBIDDEN'));
            return;
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json(errorResponse('Invalid token', 'UNAUTHORIZED'));
            return;
        }
        next(error);
    }
};
