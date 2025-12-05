import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 dark:bg-gray-800 dark:border-gray-700">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your application</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <NotificationDropdown />

                        {/* User Menu */}
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                                <p className="text-xs text-gray-500 capitalize dark:text-gray-400">{user?.role.replace('_', ' ')}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-primary-600 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                    title="Edit Profile"
                                >
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000/${user.avatar}`}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).parentElement!.classList.add('bg-primary-600');
                                                (e.target as HTMLImageElement).parentElement!.innerText = user.name.charAt(0).toUpperCase();
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-primary-600 flex items-center justify-center hover:bg-primary-700 transition-colors">
                                            <span className="text-white font-semibold">
                                                {user?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5 text-white" />}
                                            </span>
                                        </div>
                                    )}
                                </button>

                                <button
                                    onClick={logout}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:text-gray-300 dark:hover:bg-red-900/20"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
