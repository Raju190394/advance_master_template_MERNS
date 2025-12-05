import { Response, NextFunction } from 'express';
import { z } from 'zod';
import userService from '../services/user.service';
import { AuthRequest } from '../types/express';
import { successResponse, paginatedResponse } from '../utils/response';
import { createActivityLog } from '../utils/activityLogger';
import { UserRole, UserStatus } from '@prisma/client';

const createUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['user', 'admin', 'super_admin']),
    status: z.enum(['active', 'inactive']).optional(),
});

const updateUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    role: z.enum(['user', 'admin', 'super_admin']).optional(),
    status: z.enum(['active', 'inactive']).optional(),
});

class UserController {
    async createUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const validatedData = createUserSchema.parse(req.body);

            const user = await userService.createUser(validatedData, req.user!.id);

            // Log user creation
            await createActivityLog({
                userId: req.user!.id,
                name: req.user!.name,
                role: req.user!.role,
                action: 'CREATE',
                module: 'Users',
                description: `Created user ${user.name} (${user.email})`,
                req,
            });

            res.status(201).json(
                successResponse('User created successfully', user)
            );
        } catch (error) {
            next(error);
        }
    }

    // ... (getUsers and getUserById remain unchanged)

    async getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { search, role, status, page, limit } = req.query;

            const filters = {
                search: search as string,
                role: role as UserRole,
                status: status as UserStatus,
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
                currentUserRole: req.user?.role,
            };

            const { users, total, page: currentPage, limit: currentLimit } = await userService.getUsers(filters);

            res.status(200).json(
                paginatedResponse(users, currentPage, currentLimit, total)
            );
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const user = await userService.getUserById(id);

            res.status(200).json(
                successResponse('User retrieved successfully', user)
            );
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const validatedData = updateUserSchema.parse(req.body);

            const user = await userService.updateUser(id, validatedData, req.user!.id);

            // Log user update
            await createActivityLog({
                userId: req.user!.id,
                name: req.user!.name,
                role: req.user!.role,
                action: 'UPDATE',
                module: 'Users',
                description: `Updated user ${user.name} (${user.email})`,
                req,
            });

            res.status(200).json(
                successResponse('User updated successfully', user)
            );
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            await userService.deleteUser(id, req.user!.id);

            // Log user deletion
            await createActivityLog({
                userId: req.user!.id,
                name: req.user!.name,
                role: req.user!.role,
                action: 'DELETE',
                module: 'Users',
                description: `Deleted user ID ${id}`,
                req,
            });

            res.status(200).json(
                successResponse('User deleted successfully')
            );
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
