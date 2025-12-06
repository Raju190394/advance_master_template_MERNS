import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import profileRoutes from './profile.routes';

import activityLogRoutes from './activityLog.routes';
import reportRoutes from './report.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profile', profileRoutes);
router.use('/activity-logs', activityLogRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
import settingsRoutes from './settings.routes';
router.use('/settings', settingsRoutes);
import notificationRoutes from './notification.routes';
router.use('/notifications', notificationRoutes);
import studentRoutes from './student.routes';
router.use('/students', studentRoutes);

export default router;
