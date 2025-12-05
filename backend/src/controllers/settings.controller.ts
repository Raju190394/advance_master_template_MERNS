import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../utils/response';
import settingsService from '../services/settings.service';

class SettingsController {
    async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const settings = await settingsService.getSettings();
            res.status(200).json(successResponse('Settings retrieved successfully', settings));
        } catch (error) {
            next(error);
        }
    }

    async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { appName, supportEmail } = req.body;
            const updated = await settingsService.updateSettings({ appName, supportEmail });
            res.status(200).json(successResponse('Settings updated successfully', updated));
        } catch (error) {
            next(error);
        }
    }
}

export default new SettingsController();
