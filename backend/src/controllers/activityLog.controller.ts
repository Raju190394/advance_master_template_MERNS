import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { ActivityLog } from '../models/activityLog.model';
import { successResponse, paginatedResponse } from '../utils/response';
import { createActivityLog } from '../utils/activityLogger';

class ActivityLogController {
    async getLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const module = req.query.module as string;
            const action = req.query.action as string;

            const query: any = {};

            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ];
            }

            if (module) {
                query.module = module;
            }

            if (action) {
                query.action = action;
            }

            const total = await ActivityLog.countDocuments(query);
            const logs = await ActivityLog.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            // Log that super admin viewed logs
            await createActivityLog({
                userId: req.user!.id,
                name: req.user!.name,
                role: req.user!.role,
                action: 'VIEW',
                module: 'Activity Logs',
                description: 'Viewed activity logs',
                req,
            });

            res.status(200).json(
                paginatedResponse(logs, page, limit, total)
            );
        } catch (error) {
            next(error);
        }
    }
}

export default new ActivityLogController();
