import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthRequest } from '../types/express';
import { errorResponse } from '../utils/response';

export const authorize = (...allowedRoles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json(errorResponse('Authentication required', 'UNAUTHORIZED'));
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json(
                errorResponse(
                    'You do not have permission to access this resource',
                    'FORBIDDEN'
                )
            );
            return;
        }

        next();
    };
};
