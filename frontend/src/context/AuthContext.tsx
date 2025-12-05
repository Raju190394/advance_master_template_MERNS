import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user.types';
import { LoginCredentials } from '../types/auth.types';
import authService from '../services/auth.service';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    hasRole: (roles: string[]) => boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = authService.getToken();
            const storedUser = authService.getStoredUser();

            if (token) {
                if (storedUser) {
                    setUser(storedUser); // Optimistic update
                }
                try {
                    const freshUser = await authService.getProfile();
                    setUser(freshUser);
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials): Promise<void> => {
        try {
            const response = await authService.login(credentials);
            setUser(response.user);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const logout = (): void => {
        authService.logout();
        setUser(null);
    };

    const hasRole = (roles: string[]): boolean => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    const refreshUser = async () => {
        try {
            const userData = await authService.getProfile();
            setUser(userData);
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
