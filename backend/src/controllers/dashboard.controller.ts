import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { ActivityLog } from '../models/activityLog.model';
import { successResponse } from '../utils/response';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class DashboardController {
    async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const userRole = req.user!.role;

            let stats;
            let recentActivity;

            if (userRole === 'super_admin' || userRole === 'admin') {
                // Admin Stats
                const totalUsers = await prisma.user.count();
                const activeUsers = await prisma.user.count({ where: { status: 'active' } });

                // Get recent activities (last 5)
                recentActivity = await ActivityLog.find()
                    .sort({ createdAt: -1 })
                    .limit(5);

                // Calculate growth (users created in last 30 days vs previous 30 days)
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const sixtyDaysAgo = new Date();
                sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

                const newUsersLast30 = await prisma.user.count({
                    where: { createdAt: { gte: thirtyDaysAgo } }
                });
                const newUsersPrev30 = await prisma.user.count({
                    where: {
                        createdAt: {
                            gte: sixtyDaysAgo,
                            lt: thirtyDaysAgo
                        }
                    }
                });

                const growth = newUsersPrev30 === 0
                    ? (newUsersLast30 > 0 ? 100 : 0)
                    : Math.round(((newUsersLast30 - newUsersPrev30) / newUsersPrev30) * 100);

                stats = [
                    {
                        name: 'Total Users',
                        value: totalUsers.toString(),
                        change: `${growth > 0 ? '+' : ''}${growth}%`,
                        color: 'bg-blue-500',
                        icon: 'Users'
                    },
                    {
                        name: 'Active Users',
                        value: activeUsers.toString(),
                        change: `${Math.round((activeUsers / totalUsers) * 100)}% of total`,
                        color: 'bg-green-500',
                        icon: 'Activity'
                    },
                    {
                        name: 'System Events',
                        value: await ActivityLog.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
                        change: 'Last 30 days',
                        color: 'bg-purple-500',
                        icon: 'TrendingUp'
                    },
                    {
                        name: 'Security Status',
                        value: 'Secure',
                        change: 'No alerts',
                        color: 'bg-orange-500',
                        icon: 'Shield'
                    }
                ];
            } else {
                // User Stats
                const userActivityCount = await ActivityLog.countDocuments({ userId });
                recentActivity = await ActivityLog.find({ userId })
                    .sort({ createdAt: -1 })
                    .limit(5);

                stats = [
                    {
                        name: 'Your Activity',
                        value: userActivityCount.toString(),
                        change: 'Total actions',
                        color: 'bg-blue-500',
                        icon: 'Activity'
                    },
                    {
                        name: 'Profile Status',
                        value: 'Active',
                        change: 'Account verified',
                        color: 'bg-green-500',
                        icon: 'Shield'
                    }
                ];
            }

            // Chart Data (Last 7 Days)
            const chartData = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);
                const nextDate = new Date(date);
                nextDate.setDate(date.getDate() + 1);

                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                let activeCount = 0;
                let newUsersCount = 0;

                if (userRole === 'super_admin' || userRole === 'admin') {
                    activeCount = await ActivityLog.countDocuments({
                        createdAt: { $gte: date, $lt: nextDate }
                    });
                    newUsersCount = await prisma.user.count({
                        where: {
                            createdAt: { gte: date, lt: nextDate }
                        }
                    });
                } else {
                    activeCount = await ActivityLog.countDocuments({
                        userId,
                        createdAt: { $gte: date, $lt: nextDate }
                    });
                    // For users, we could show something else or just 0 for 'new'
                    newUsersCount = 0;
                }

                chartData.push({
                    name: dayName,
                    active: activeCount,
                    new: newUsersCount
                });
            }

            res.status(200).json(successResponse('Dashboard stats retrieved successfully', {
                stats,
                recentActivity,
                chartData
            }));
        } catch (error) {
            next(error);
        }
    }
}

export default new DashboardController();
