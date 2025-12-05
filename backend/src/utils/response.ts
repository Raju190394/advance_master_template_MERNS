export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    errors?: Record<string, string[]>;
}

export const successResponse = <T>(
    message: string,
    data?: T
): ApiResponse<T> => ({
    success: true,
    message,
    data,
});

export const errorResponse = (
    message: string,
    error?: string,
    errors?: Record<string, string[]>
): ApiResponse => ({
    success: false,
    message,
    error,
    errors,
});

export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const paginatedResponse = <T>(
    data: T[],
    page: number,
    limit: number,
    total: number
): PaginatedResponse<T> => ({
    success: true,
    message: 'Data retrieved successfully',
    data,
    pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    },
});
