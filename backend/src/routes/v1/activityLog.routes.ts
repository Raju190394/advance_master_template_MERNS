import { Router } from 'express';
import activityLogController from '../../controllers/activityLog.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();

// Only Super Admin can view logs
router.get('/', authenticate, authorize('super_admin'), activityLogController.getLogs);

export default router;
