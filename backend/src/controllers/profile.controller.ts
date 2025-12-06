import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types/express';
import { successResponse } from '../utils/response';
import profileService from '../services/profile.service';
import { createActivityLog } from '../utils/activityLogger';

const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

class ProfileController {
    async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const user = await profileService.getProfile(userId);

            res.status(200).json(
                successResponse('Profile retrieved successfully', user)
            );
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            // Parse body data
            const validatedData = updateProfileSchema.parse(req.body);

            // Add avatar if file uploaded
            const updateData: any = { ...validatedData };
            if (req.file) {
                // Store relative path or full URL depending on your preference. 
                // Here we store the relative path 'avatars/filename'
                updateData.avatar = `uploads/avatars/${req.file.filename}`;
            }

            const user = await profileService.updateProfile(userId, updateData);

            // Log profile update
            await createActivityLog({
                userId: req.user!.id,
                name: req.user!.name,
                role: req.user!.role,
                action: 'UPDATE',
                module: 'Profile',
                description: 'User updated their profile',
                req,
            });

            res.status(200).json(
                successResponse('Profile updated successfully', user)
            );
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const validatedData = changePasswordSchema.parse(req.body);

            await profileService.changePassword(
                userId,
                validatedData.currentPassword,
                validatedData.newPassword
            );

            // Log password change
            await createActivityLog({
                userId: req.user!.id,
                name: req.user!.name,
                role: req.user!.role,
                action: 'UPDATE',
                module: 'Profile',
                description: 'User changed their password',
                req,
            });

            res.status(200).json(
                successResponse('Password changed successfully')
            );
        } catch (error) {
            next(error);
        }
    }
}

export default new ProfileController();
