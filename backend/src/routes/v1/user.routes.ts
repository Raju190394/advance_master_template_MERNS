import { Router } from 'express';
import userController from '../../controllers/user.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/users
 * @desc    Create a new user
 * @access  Private (Admin, Super Admin)
 */
router.post('/', authorize('admin', 'super_admin'), userController.createUser);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination and filters
 * @access  Private (Admin, Super Admin)
 */
router.get('/', authorize('admin', 'super_admin'), userController.getUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin, Super Admin)
 */
router.get('/:id', authorize('admin', 'super_admin'), userController.getUserById);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Private (Admin, Super Admin)
 */
router.put('/:id', authorize('admin', 'super_admin'), userController.updateUser);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (Super Admin)
 */
router.delete('/:id', authorize('super_admin'), userController.deleteUser);

export default router;
