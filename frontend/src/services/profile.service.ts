import api from './api';
import { User } from '../types/user.types';

export interface UpdateProfileData {
    name?: string;
    email?: string;
    avatar?: File;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

class ProfileService {
    async getProfile(): Promise<User> {
        const response = await api.get('/profile');
        return response.data.data;
    }

    async updateProfile(data: UpdateProfileData): Promise<User> {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.email) formData.append('email', data.email);
        if (data.avatar) formData.append('avatar', data.avatar);

        const response = await api.put('/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    }

    async changePassword(data: ChangePasswordData): Promise<void> {
        await api.post('/profile/change-password', data);
    }
}

export default new ProfileService();
