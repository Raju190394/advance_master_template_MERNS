import { Router } from 'express';
import studentController from '../../controllers/student.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { uploadStudentFiles } from '../../middlewares/upload.middleware';

const router = Router();

// Protect all routes
router.use(authenticate);

router.get('/', authorize('admin', 'super_admin'), studentController.getStudents);
router.get('/:id', authorize('admin', 'super_admin'), studentController.getStudentById);
router.post('/', authorize('admin', 'super_admin'), uploadStudentFiles, studentController.createStudent);
router.put('/:id', authorize('admin', 'super_admin'), uploadStudentFiles, studentController.updateStudent);
router.delete('/:id', authorize('admin', 'super_admin'), studentController.deleteStudent);

export default router;
