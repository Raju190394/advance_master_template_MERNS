import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from './error.middleware';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError(400, 'Invalid file type. Only JPEG, PNG and WebP are allowed.'));
    }
};

export const uploadAvatar = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

const studentUploadDir = path.join(process.cwd(), 'uploads', 'students');
if (!fs.existsSync(studentUploadDir)) {
    fs.mkdirSync(studentUploadDir, { recursive: true });
}

const studentStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, studentUploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

export const uploadStudentFiles = multer({
    storage: studentStorage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (_req, _file, cb) => {
        cb(null, true);
    }
}).fields([
    { name: 'photo', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
]);

