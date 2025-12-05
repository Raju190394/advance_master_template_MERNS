import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    Activity,
    BarChart,
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
    name: string;
    path: string;
    icon: React.ReactNode;
    roles?: string[];
}

const Sidebar: React.FC = () => {
    const { hasRole } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const navItems: NavItem[] = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
            name: 'Users',
            path: '/users',
            icon: <Users className="w-5 h-5" />,
            roles: ['admin', 'super_admin'],
        },
        {
            name: 'Activity Logs',
            path: '/activity-logs',
            icon: <Activity className="w-5 h-5" />,
            roles: ['super_admin'],
        },
        {
            name: 'Reports',
            path: '/reports',
            icon: <BarChart className="w-5 h-5" />,
            roles: ['super_admin'],
        },
        {
            name: 'Settings',
            path: '/settings',
            icon: <Settings className="w-5 h-5" />,
        },
    ];

    const filteredNavItems = navItems.filter((item) => {
        if (!item.roles) return true;
        return hasRole(item.roles);
    });

    return (
        <aside
            className={clsx(
                'bg-gray-900 text-white h-screen sticky top-0 transition-all duration-300 flex flex-col',
                collapsed ? 'w-20' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                    {!collapsed && (
                        <h2 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                            AdminPanel
                        </h2>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors ml-auto"
                    >
                        {collapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <ChevronLeft className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {filteredNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                isActive
                                    ? 'bg-primary-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            )
                        }
                        title={collapsed ? item.name : undefined}
                    >
                        {item.icon}
                        {!collapsed && <span className="font-medium">{item.name}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
                {!collapsed && (
                    <p className="text-xs text-gray-500 text-center">
                        © 2024 Admin Panel
                    </p>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
