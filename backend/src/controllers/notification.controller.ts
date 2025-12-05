import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../types/express';
import { successResponse } from '../utils/response';

class NotificationController {
    async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const [notifications, total] = await Promise.all([
                prisma.notification.findMany({
                    where: { userId },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.notification.count({ where: { userId } }),
            ]);

            const unreadCount = await prisma.notification.count({
                where: { userId, read: false },
            });

            res.status(200).json(
                successResponse('Notifications fetched', {
                    notifications,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                    unreadCount
                })
            );
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { id } = req.body;

            if (id) {
                await prisma.notification.updateMany({
                    where: { id: parseInt(id), userId },
                    data: { read: true },
                });
            } else {
                await prisma.notification.updateMany({
                    where: { userId, read: false },
                    data: { read: true },
                });
            }

            res.status(200).json(successResponse('Notifications marked as read'));
        } catch (error) {
            next(error);
        }
    }

    async deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const id = parseInt(req.params.id);

            await prisma.notification.deleteMany({
                where: { id, userId },
            });

            res.status(200).json(successResponse('Notification deleted'));
        } catch (error) {
            next(error);
        }
    }

    async clearAllNotifications(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;

            await prisma.notification.deleteMany({
                where: { userId },
            });

            res.status(200).json(successResponse('All notifications cleared'));
        } catch (error) {
            next(error);
        }
    }
}

export default new NotificationController();
