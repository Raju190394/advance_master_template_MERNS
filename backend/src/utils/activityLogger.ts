import { ActivityLog } from '../models/activityLog.model';
import { Request } from 'express';

interface CreateLogParams {
    userId: number;
    name: string;
    role: string;
    action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'OTHER';
    module: string;
    description?: string;
    req?: Request;
}

export const createActivityLog = async (params: CreateLogParams) => {
    try {
        const { userId, name, role, action, module, description, req } = params;

        let ipAddress = '';
        let userAgent = '';

        if (req) {
            ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
            userAgent = req.headers['user-agent'] || '';
        }

        await ActivityLog.create({
            userId,
            name,
            role,
            action,
            module,
            description,
            ipAddress,
            userAgent,
        });
    } catch (error) {
        console.error('Failed to create activity log:', error);
        // Don't throw error to prevent disrupting the main flow
    }
};
