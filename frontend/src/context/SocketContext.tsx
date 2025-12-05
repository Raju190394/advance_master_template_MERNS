import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: string;
}

interface SocketContextType {
    socket: Socket | null;
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id?: number) => Promise<void>;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    // Initialize Socket
    useEffect(() => {
        if (isAuthenticated && user) {
            const token = localStorage.getItem('token');
            // Assuming API URL is http://localhost:5000/api/v1 -> we need http://localhost:5000
            const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');

            const newSocket = io(socketUrl, {
                auth: { token },
                withCredentials: true,
                transports: ['websocket', 'polling'], // ensure websocket is tried
            });

            newSocket.on('connect', () => {
                console.log('Socket connected');
                setIsConnected(true);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
                setIsConnected(false);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            newSocket.on('notification', (notification: Notification) => {
                setNotifications(prev => [notification, ...prev]);
                if (!notification.read) {
                    setUnreadCount(prev => prev + 1);
                }
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [isAuthenticated, user?.id]);

    // Fetch initial notifications
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
        }
    }, [isAuthenticated]);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications?limit=10');
            if (response.data.success) {
                setNotifications(response.data.data.notifications);
                setUnreadCount(response.data.data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAsRead = async (id?: number) => {
        try {
            await api.post('/notifications/mark-read', { id });

            if (id) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } else {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    return (
        <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
