import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';
import { AppError } from '../middlewares/error.middleware';

interface UpdateProfileData {
    name?: string;
    email?: string;
    avatar?: string;
}

class ProfileService {
    async getProfile(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        return user;
    }

    async updateProfile(userId: number, data: UpdateProfileData) {
        // Check if email is being updated and if it's already in use
        if (data.email) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    email: data.email,
                    NOT: { id: userId },
                },
            });

            if (existingUser) {
                throw new AppError(400, 'Email already in use');
            }
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return user;
    }

    async changePassword(userId: number, currentPassword: string, newPassword: string) {
        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new AppError(400, 'Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                updatedAt: new Date(),
            },
        });

        return true;
    }
}

export default new ProfileService();
