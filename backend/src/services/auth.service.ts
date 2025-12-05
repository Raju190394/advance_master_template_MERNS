import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { User } from '@prisma/client';
import env from '../config/env';
import { AppError } from '../middlewares/error.middleware';
import { ActivityLog } from '../models/activityLog.model';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: Omit<User, 'password'>;
    token: string;
}

class AuthService {
    async login(credentials: LoginCredentials, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
        const { email, password } = credentials;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new AppError(401, 'Invalid email or password');
        }

        // Check if user is active
        if (user.status !== 'active') {
            throw new AppError(403, 'Your account has been deactivated');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new AppError(401, 'Invalid email or password');
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN as any }
        );

        // Log activity to MongoDB
        try {
            await ActivityLog.create({
                userId: user.id,
                action: 'LOGIN',
                resource: 'auth',
                ipAddress,
                userAgent,
            });
        } catch (error) {
            // Don't fail login if logging fails
            console.error('Failed to log activity:', error);
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token,
        };
    }

    async getProfile(userId: number): Promise<Omit<User, 'password'>> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

export default new AuthService();
