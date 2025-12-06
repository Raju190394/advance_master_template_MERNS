import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../types/express';
import { successResponse, paginatedResponse } from '../utils/response';
import { AppError } from '../middlewares/error.middleware';
import { createActivityLog } from '../utils/activityLogger';

export const DUMMY_COURSES = [
    { id: 1, name: 'Full Stack Web Development', price: 25000 },
    { id: 2, name: 'Data Science', price: 30000 },
    { id: 3, name: 'Digital Marketing', price: 15000 },
    { id: 4, name: 'Graphic Design', price: 12000 },
    { id: 5, name: 'Mobile App Development', price: 20000 },
];

class StudentController {
    async createStudent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, fatherName, qualification, gender, courses, mobileNo, address, totalAmount } = req.body;

            // Handle file uploads
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const photo = files['photo']?.[0]?.filename || null;
            const documents = files['documents']?.map(f => f.filename).join(',') || null;

            // Validate required fields (basic)
            if (!name || !fatherName || !qualification || !gender || !courses || !mobileNo || !address) {
                throw new AppError(400, 'All fields are required');
            }

            const student = await prisma.student.create({
                data: {
                    name,
                    fatherName,
                    qualification,
                    gender,
                    courses, // Storing as string (JSON or comma separated)
                    mobileNo,
                    address,
                    photo,
                    documents,
                    totalAmount: Number(totalAmount) || 0
                }
            });

            // Log activity
            await createActivityLog({
                userId: req.user!.id,
                name: req.user!.name,
                role: req.user!.role,
                action: 'CREATE',
                module: 'Management',
                description: `Created student ${student.name}`,
                req,
            });

            res.status(201).json(successResponse('Student created successfully', student));
        } catch (error) {
            next(error);
        }
    }

    async getStudents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', gender, course, qualification } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};
            if (search) {
                where.OR = [
                    { name: { contains: String(search) } },
                    { mobileNo: { contains: String(search) } },
                    { fatherName: { contains: String(search) } }
                ];
            }

            if (gender) {
                where.gender = String(gender);
            }

            if (course) {
                where.courses = { contains: String(course) };
            }

            if (qualification) {
                where.qualification = { contains: String(qualification) };
            }

            const [students, total] = await Promise.all([
                prisma.student.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    orderBy: { [String(sortBy)]: String(sortOrder) }
                }),
                prisma.student.count({ where })
            ]);

            res.status(200).json(paginatedResponse(students, Number(page), Number(limit), total));
        } catch (error) {
            next(error);
        }
    }

    async getStudentById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const student = await prisma.student.findUnique({
                where: { id: Number(id) }
            });

            if (!student) {
                throw new AppError(404, 'Student not found');
            }

            res.status(200).json(successResponse('Student fetched successfully', student));
        } catch (error) {
            next(error);
        }
    }

    async updateStudent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { name, fatherName, qualification, gender, courses, mobileNo, address, totalAmount } = req.body;

            const existingStudent = await prisma.student.findUnique({ where: { id: Number(id) } });
            if (!existingStudent) {
                throw new AppError(404, 'Student not found');
            }

            // Handle file uploads
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            let photo = existingStudent.photo;
            let documents = existingStudent.documents;

            if (files['photo']?.[0]) {
                photo = files['photo'][0].filename;
            }
            if (files['documents']?.length) {
                // If new documents are uploaded, user might want to append or replace. 
                // For simplicity, let's append if user explicitly didn't say replace, but crud usually replaces or adds. 
                // Let's assume replace for this simple implementation or simple comma append if we want history, but replace is standard for 'update form'.
                // However, user requirement says 'multi upload add one by one', so maybe we should append? 
                // Let's replace for now as it's easier to manage without a separate deletion API for individual files.
                // Wait, if it's "add one by one", maybe I should append to the existing list?
                // Let's append new files to the existing list string.
                const newDocs = files['documents'].map(f => f.filename).join(',');
                documents = documents ? `${documents},${newDocs}` : newDocs;
            }

            const student = await prisma.student.update({
                where: { id: Number(id) },
                data: {
                    name,
                    fatherName,
                    qualification,
                    gender,
                    courses,
                    mobileNo,
                    address,
                    photo,
                    documents,
                    totalAmount: Number(totalAmount) || 0
                }
            });

            // Log activity
            await createActivityLog({
                userId: req.user!.id,
                name: req.user!.name,
                role: req.user!.role,
                action: 'UPDATE',
                module: 'Management',
                description: `Updated student ${student.name}`,
                req,
            });

            res.status(200).json(successResponse('Student updated successfully', student));
        } catch (error) {
            next(error);
        }
    }

    async deleteStudent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const student = await prisma.student.findUnique({ where: { id: Number(id) } });

            if (!student) {
                throw new AppError(404, 'Student not found');
            }

            await prisma.student.delete({ where: { id: Number(id) } });

            // Log activity
            await createActivityLog({
                userId: req.user!.id,
                name: req.user!.name,
                role: req.user!.role,
                action: 'DELETE',
                module: 'Management',
                description: `Deleted student ${student.name}`,
                req,
            });

            res.status(200).json(successResponse('Student deleted successfully'));
        } catch (error) {
            next(error);
        }
    }
}

export default new StudentController();
