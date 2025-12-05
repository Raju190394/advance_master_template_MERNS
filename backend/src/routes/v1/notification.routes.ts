import { Router } from 'express';
import notificationController from '../../controllers/notification.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.post('/mark-read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.delete('/', notificationController.clearAllNotifications);

export default router;
