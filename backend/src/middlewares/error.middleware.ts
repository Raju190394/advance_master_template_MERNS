import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../utils/logger';
import { errorResponse } from '../utils/response';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    logger.error('Error:', err);

    // Zod validation errors
    if (err instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        err.errors.forEach((error) => {
            const path = error.path.join('.');
            if (!errors[path]) {
                errors[path] = [];
            }
            errors[path].push(error.message);
        });

        res.status(400).json(
            errorResponse('Validation failed', 'VALIDATION_ERROR', errors)
        );
        return;
    }

    // Application errors
    if (err instanceof AppError) {
        res.status(err.statusCode).json(
            errorResponse(err.message, err.isOperational ? 'APP_ERROR' : 'INTERNAL_ERROR')
        );
        return;
    }

    // Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as any;
        if (prismaError.code === 'P2002') {
            res.status(409).json(
                errorResponse('A record with this value already exists', 'DUPLICATE_ERROR')
            );
            return;
        }
    }

    // Default error
    res.status(500).json(
        errorResponse(
            'An unexpected error occurred',
            'INTERNAL_SERVER_ERROR'
        )
    );
};

export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json(
        errorResponse(`Route ${req.originalUrl} not found`, 'NOT_FOUND')
    );
};
