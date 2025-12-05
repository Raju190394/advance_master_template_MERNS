// Settings Service
import { prisma } from '../config/db';
import { AppError } from '../middlewares/error.middleware';

class SettingsService {
    async getSettings() {
        const settings = await prisma.settings.findFirst();
        if (!settings) {
            // If not exist, create default
            return await prisma.settings.create({
                data: {
                    appName: 'Admin Panel',
                    supportEmail: 'support@example.com',
                },
            });
        }
        return settings;
    }

    async updateSettings(data: { appName?: string; supportEmail?: string }) {
        const existing = await prisma.settings.findFirst();
        if (!existing) {
            // create if not exists
            return await prisma.settings.create({ data });
        }
        return await prisma.settings.update({
            where: { id: existing.id },
            data,
        });
    }
}

export default new SettingsService();
