import { Router } from 'express';
import reportController from '../../controllers/report.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();

// Only Super Admin can view reports
router.get('/stats', authenticate, authorize('super_admin'), reportController.getDashboardStats);
router.get('/user/:userId', authenticate, authorize('super_admin'), reportController.getUserActivityReport);

export default router;
