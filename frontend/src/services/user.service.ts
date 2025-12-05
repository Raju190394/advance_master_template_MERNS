import api from './api';
import { User, CreateUserData, UpdateUserData } from '../types/user.types';
import { ApiResponse, PaginatedResponse } from '../types/auth.types';

export interface UserFilters {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
}

class UserService {
    async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
        const params = new URLSearchParams();

        if (filters?.search) params.append('search', filters.search);
        if (filters?.role) params.append('role', filters.role);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await api.get<PaginatedResponse<User>>(`/users?${params.toString()}`);
        return response.data;
    }

    async getUserById(id: number): Promise<User> {
        const response = await api.get<ApiResponse<User>>(`/users/${id}`);

        if (response.data.success && response.data.data) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Failed to get user');
    }

    async createUser(data: CreateUserData): Promise<User> {
        const response = await api.post<ApiResponse<User>>('/users', data);

        if (response.data.success && response.data.data) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Failed to create user');
    }

    async updateUser(id: number, data: UpdateUserData): Promise<User> {
        const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);

        if (response.data.success && response.data.data) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Failed to update user');
    }

    async deleteUser(id: number): Promise<void> {
        const response = await api.delete<ApiResponse>(`/users/${id}`);

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to delete user');
        }
    }
}

export default new UserService();
