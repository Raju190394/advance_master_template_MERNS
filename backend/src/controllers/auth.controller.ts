import { Response, NextFunction } from 'express';
import { z } from 'zod';
import authService from '../services/auth.service';
import { AuthRequest } from '../types/express';
import { successResponse } from '../utils/response';
import { createActivityLog } from '../utils/activityLogger';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

class AuthController {
    async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = loginSchema.parse(req.body);

            const ipAddress = req.ip || req.socket.remoteAddress;
            const userAgent = req.headers['user-agent'];

            const result = await authService.login(validatedData, ipAddress, userAgent);

            // Log login activity
            await createActivityLog({
                userId: result.user.id,
                name: result.user.name,
                role: result.user.role,
                action: 'LOGIN',
                module: 'Auth',
                description: 'User logged in successfully',
                req,
            });

            res.status(200).json(
                successResponse('Login successful', result)
            );
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const user = await authService.getProfile(req.user.id);

            res.status(200).json(
                successResponse('Profile retrieved successfully', user)
            );
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();
