import api from './api';

export interface Student {
    id: number;
    name: string;
    fatherName: string;
    qualification: string;
    gender: string;
    courses: string;
    mobileNo: string;
    photo: string | null;
    documents: string | null;
    address: string;
    totalAmount: number;
    createdAt: string;
}

export interface StudentListResponse {
    success: boolean;
    message: string;
    data: Student[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const studentService = {
    getAll: async (page = 1, limit = 10, search = '', filters: any = {}) => {
        const response = await api.get<StudentListResponse>('/students', {
            params: { page, limit, search, ...filters },
        });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<{ data: Student }>(`/students/${id}`);
        return response.data;
    },

    create: async (data: FormData) => {
        const response = await api.post<{ data: Student }>('/students', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    update: async (id: number, data: FormData) => {
        const response = await api.put<{ data: Student }>(`/students/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/students/${id}`);
    },
};
