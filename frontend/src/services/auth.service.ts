import api from './api';
import { LoginCredentials, AuthResponse, ApiResponse } from '../types/auth.types';
import { User } from '../types/user.types';

class AuthService {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);

        if (response.data.success && response.data.data) {
            const { token, user } = response.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            return response.data.data;
        }

        throw new Error(response.data.message || 'Login failed');
    }

    async getProfile(): Promise<User> {
        const response = await api.get<ApiResponse<User>>('/auth/profile');

        if (response.data.success && response.data.data) {
            localStorage.setItem('user', JSON.stringify(response.data.data));
            return response.data.data;
        }

        throw new Error(response.data.message || 'Failed to get profile');
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    getStoredUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}

export default new AuthService();
