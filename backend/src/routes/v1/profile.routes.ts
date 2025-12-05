import { Router } from 'express';
import profileController from '../../controllers/profile.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// All profile routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/', profileController.getProfile);

import { uploadAvatar } from '../../middlewares/upload.middleware';

/**
 * @route   PUT /api/v1/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/', uploadAvatar.single('avatar'), profileController.updateProfile);

/**
 * @route   POST /api/v1/profile/change-password
 * @desc    Change current user's password
 * @access  Private
 */
router.post('/change-password', profileController.changePassword);

export default router;
