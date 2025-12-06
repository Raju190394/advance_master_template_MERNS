import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    Activity,
    BarChart,
    ChevronDown,
    Briefcase
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
    name: string;
    path: string;
    icon: React.ReactNode;
    roles?: string[];
    children?: NavItem[];
}

const Sidebar: React.FC = () => {
    const { hasRole } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['/management']);

    const navItems: NavItem[] = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
            name: 'Management',
            path: '/management',
            icon: <Briefcase className="w-5 h-5" />,
            roles: ['admin', 'super_admin'],
            children: [
                {
                    name: 'Students',
                    path: '/students',
                    icon: <Users className="w-5 h-5" />,
                }
            ]
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

    const toggleMenu = (path: string) => {
        if (expandedMenus.includes(path)) {
            setExpandedMenus(expandedMenus.filter(p => p !== path));
        } else {
            setExpandedMenus([...expandedMenus, path]);
        }
    };

    const renderNavItem = (item: NavItem) => {
        if (item.roles && !hasRole(item.roles)) return null;

        if (item.children) {
            const isExpanded = expandedMenus.includes(item.path);
            const isActive = item.children.some(child => location.pathname === child.path);

            return (
                <div key={item.path}>
                    <button
                        onClick={() => {
                            if (collapsed) setCollapsed(false);
                            toggleMenu(item.path);
                        }}
                        className={clsx(
                            'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left',
                            isActive
                                ? 'text-primary-400 bg-gray-800/50'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        )}
                        title={collapsed ? item.name : undefined}
                    >
                        {item.icon}
                        {!collapsed && (
                            <>
                                <span className="font-medium flex-1">{item.name}</span>
                                <ChevronDown
                                    className={clsx(
                                        'w-4 h-4 transition-transform',
                                        isExpanded ? 'rotate-180' : ''
                                    )}
                                />
                            </>
                        )}
                    </button>
                    {!collapsed && isExpanded && (
                        <div className="pl-12 space-y-1 mt-1">
                            {item.children.map(child => (
                                <NavLink
                                    key={child.path}
                                    to={child.path}
                                    className={({ isActive }) =>
                                        clsx(
                                            'block py-2 px-3 text-sm rounded-lg transition-colors',
                                            isActive
                                                ? 'text-white bg-primary-600'
                                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        )
                                    }
                                >
                                    {child.name}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
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
        );
    };

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
                {navItems.map(renderNavItem)}
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
