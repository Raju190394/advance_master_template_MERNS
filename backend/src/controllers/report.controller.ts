import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { ActivityLog } from '../models/activityLog.model';
import { successResponse, paginatedResponse } from '../utils/response';
import { createActivityLog } from '../utils/activityLogger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ReportController {
    async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            // 1. User Statistics
            const totalUsers = await prisma.user.count();
            const activeUsers = await prisma.user.count({ where: { status: 'active' } });
            const inactiveUsers = await prisma.user.count({ where: { status: 'inactive' } });

            // 2. Activity Statistics (Last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const totalActivities = await ActivityLog.countDocuments({
                createdAt: { $gte: thirtyDaysAgo }
            });

            // Activities by Action Type
            const activitiesByAction = await ActivityLog.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                { $group: { _id: '$action', count: { $sum: 1 } } }
            ]);

            // Activities by Module
            const activitiesByModule = await ActivityLog.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                { $group: { _id: '$module', count: { $sum: 1 } } }
            ]);

            // Top Active Users (Last 30 days)
            const topActiveUsers = await ActivityLog.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                { $group: { _id: { userId: '$userId', name: '$name' }, count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);

            const stats = {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    inactive: inactiveUsers
                },
                activities: {
                    total: totalActivities,
                    byAction: activitiesByAction,
                    byModule: activitiesByModule,
                    topUsers: topActiveUsers
                }
            };

            // Log report view
            await createActivityLog({
                userId: req.user!.id,
                name: req.user!.name,
                role: req.user!.role,
                action: 'VIEW',
                module: 'Reports',
                description: 'Viewed system analysis report',
                req,
            });

            res.status(200).json(successResponse('Report statistics retrieved successfully', stats));
        } catch (error) {
            next(error);
        }
    }

    async getUserActivityReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = parseInt(req.params.userId);
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, email: true, role: true, status: true }
            });

            if (!user) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }

            const total = await ActivityLog.countDocuments({ userId });
            const logs = await ActivityLog.find({ userId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            // Calculate user specific stats
            const activityStats = await ActivityLog.aggregate([
                { $match: { userId } },
                { $group: { _id: '$action', count: { $sum: 1 } } }
            ]);

            const report = {
                user,
                stats: activityStats,
                logs
            };

            // Log detailed report view
            await createActivityLog({
                userId: req.user!.id,
                name: req.user!.name,
                role: req.user!.role,
                action: 'VIEW',
                module: 'Reports',
                description: `Viewed detailed activity report for user ${user.name}`,
                req,
            });

            res.status(200).json(paginatedResponse(report, page, limit, total));
        } catch (error) {
            next(error);
        }
    }
}

export default new ReportController();
