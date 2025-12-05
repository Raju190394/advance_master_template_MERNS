import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { useSocket, Notification } from '../../context/SocketContext';
import { Bell, Check, Clock, CheckCircle, AlertTriangle, AlertCircle, Info, Trash2 } from 'lucide-react';
import api from '../../services/api';

const Notifications: React.FC = () => {
    const { markAsRead } = useSocket();
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(20);

    /* Fetch notifications with pagination */
    const fetchNotifications = async (currentPage: number) => {
        try {
            setLoading(true);
            const response = await api.get(`/notifications?page=${currentPage}&limit=${limit}`);
            if (response.data.success) {
                setAllNotifications(response.data.data.notifications);
                setTotalPages(response.data.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(page);
    }, [page]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const handleMarkAsRead = async (id: number) => {
        await markAsRead(id);
        // Optimistic update locally
        setAllNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleMarkAllRead = async () => {
        await markAsRead(); // calls without ID marks all
        setAllNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/notifications/${id}`);
            setAllNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Failed to delete notification', error);
        }
    };

    const handleClearAll = async () => {
        if (window.confirm('Are you sure you want to clear all notifications?')) {
            try {
                await api.delete('/notifications');
                setAllNotifications([]);
            } catch (error) {
                console.error('Failed to clear notifications', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">View your complete notification history</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                    >
                        <Check className="w-4 h-4" />
                        Mark all as read
                    </button>
                    <button
                        onClick={handleClearAll}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors text-gray-600 dark:text-gray-300"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear History
                    </button>
                </div>
            </div>

            <Card className="min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : allNotifications.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No notifications</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {allNotifications.map((n) => (
                            <div
                                key={n.id}
                                className={`flex gap-4 p-4 rounded-xl transition-all group ${n.read
                                    ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    : 'bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30'
                                    }`}
                            >
                                <div className={`flex-shrink-0 mt-1`}>
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-4">
                                        <p className={`font-medium ${n.read ? 'text-gray-900 dark:text-white' : 'text-primary-900 dark:text-primary-100'}`}>
                                            {n.title}
                                        </p>
                                        <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={`text-sm mt-1 ${n.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                        {n.message}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!n.read && (
                                        <button
                                            onClick={() => handleMarkAsRead(n.id)}
                                            className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                            title="Mark as read"
                                        >
                                            <div className="w-2 h-2 bg-primary-600 rounded-full" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(n.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8 gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
                        >
                            Next
                        </button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Notifications;
