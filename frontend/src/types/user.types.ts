export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: 'user' | 'admin' | 'super_admin';
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin' | 'super_admin';
    status?: 'active' | 'inactive';
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    password?: string;
    role?: 'user' | 'admin' | 'super_admin';
    status?: 'active' | 'inactive';
}
