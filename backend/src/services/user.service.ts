import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { User, UserRole, UserStatus, Prisma } from '@prisma/client';
import { AppError } from '../middlewares/error.middleware';
import { ActivityLog } from '../models/activityLog.model';

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    status?: UserStatus;
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    status?: UserStatus;
}

export interface UserFilters {
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    page?: number;
    limit?: number;
    currentUserRole?: string;
}

class UserService {
    async createUser(data: CreateUserData, createdBy: number): Promise<Omit<User, 'password'>> {
        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });

        // Log activity
        try {
            await ActivityLog.create({
                userId: createdBy,
                action: 'CREATE',
                resource: 'user',
                details: { createdUserId: user.id, email: user.email },
            });
        } catch (error) {
            console.error('Failed to log activity:', error);
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async getUsers(filters: UserFilters) {
        const { search, role, status, page = 1, limit = 10, currentUserRole } = filters;

        const where: Prisma.UserWhereInput = {};

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
            ];
        }

        if (role) {
            where.role = role;
        }

        // Status filtering logic
        if (currentUserRole !== 'super_admin') {
            // Non-super_admins can ONLY see active users
            where.status = 'active';
        } else {
            // Super_admins can filter by status
            if (status) {
                where.status = status;
            }
            // If no status provided, super_admin sees ALL users (active and inactive)
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma.user.count({ where }),
        ]);

        return { users, total, page, limit };
    }

    async getUserById(id: number): Promise<Omit<User, 'password'>> {
        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async updateUser(id: number, data: UpdateUserData, updatedBy: number): Promise<Omit<User, 'password'>> {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            throw new AppError(404, 'User not found');
        }

        // Hash password if provided
        const updateData: any = { ...data };
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        // Update user
        const user = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        // Log activity
        try {
            await ActivityLog.create({
                userId: updatedBy,
                action: 'UPDATE',
                resource: 'user',
                details: { updatedUserId: id, changes: Object.keys(data) },
            });
        } catch (error) {
            console.error('Failed to log activity:', error);
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async deleteUser(id: number, deletedBy: number): Promise<void> {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            throw new AppError(404, 'User not found');
        }

        // Soft delete by setting status to inactive
        await prisma.user.update({
            where: { id },
            data: { status: 'inactive' },
        });

        // Log activity
        try {
            await ActivityLog.create({
                userId: deletedBy,
                action: 'DELETE',
                resource: 'user',
                details: { deletedUserId: id },
            });
        } catch (error) {
            console.error('Failed to log activity:', error);
        }
    }
}

export default new UserService();
