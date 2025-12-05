import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import {
    Users,
    Activity,
    TrendingUp,
    Shield,
    Clock,
    ArrowRight,
    ArrowUpRight,
    Bell
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface DashboardStat {
    name: string;
    value: string;
    change: string;
    color: string; // TailWind class like 'bg-blue-500'
    icon: string;
}

interface ActivityLog {
    _id: string;
    action: string;
    description: string;
    createdAt: string;
}

interface ChartData {
    name: string;
    active: number;
    new: number;
}


const Dashboard: React.FC = () => {
    const { user, hasRole } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStat[]>([]);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/dashboard/stats');
            setStats(response.data.data.stats);
            setChartData(response.data.data.chartData);
            setRecentActivity(response.data.data.recentActivity);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (iconName: string, className = "w-6 h-6") => {
        switch (iconName) {
            case 'Users': return <Users className={className} />;
            case 'Activity': return <Activity className={className} />;
            case 'TrendingUp': return <TrendingUp className={className} />;
            case 'Shield': return <Shield className={className} />;
            default: return <Activity className={className} />;
        }
    };



    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50/50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="text-gray-500 font-medium">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Overview of your system's performance and activity.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hidden sm:block">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <button className="p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                    </button>
                    {hasRole(['admin', 'super_admin']) && (
                        <button
                            onClick={() => navigate('/users')}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow-sm shadow-primary-600/20 font-medium transition-all flex items-center gap-2"
                        >
                            <Users className="w-4 h-4" />
                            Manage Users
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    // Map the backend bg-color-500 to a gradient
                    const colorMap: Record<string, string> = {
                        'bg-blue-500': 'bg-gradient-to-br from-blue-500 to-blue-600',
                        'bg-green-500': 'bg-gradient-to-br from-green-500 to-green-600',
                        'bg-purple-500': 'bg-gradient-to-br from-purple-500 to-purple-600',
                        'bg-orange-500': 'bg-gradient-to-br from-orange-500 to-orange-600',
                    };
                    const gradientClass = colorMap[stat.color] || 'bg-gradient-to-br from-gray-500 to-gray-600';
                    const textColorMap: Record<string, string> = {
                        'bg-blue-500': 'text-blue-100',
                        'bg-green-500': 'text-green-100',
                        'bg-purple-500': 'text-purple-100',
                        'bg-orange-500': 'text-orange-100',
                    };
                    const subTextColor = textColorMap[stat.color] || 'text-gray-100';

                    const isPositive = !stat.change.includes('-');

                    return (
                        <div
                            key={stat.name}
                            className={`${gradientClass} p-6 rounded-xl shadow-lg border-none text-white transition-all duration-300 hover:scale-[1.02] group`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className={`${subTextColor} text-sm font-medium`}>{stat.name}</p>
                                    <h3 className="text-3xl font-bold mt-1 text-white">{stat.value}</h3>
                                </div>
                                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <div className="text-white">
                                        {getIcon(stat.icon)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-white/20 text-white`}>
                                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="shadow-sm border-gray-100 dark:border-gray-700 overflow-hidden" padding="none">
                        <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Growth & Activity</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Weekly user engagement metrics</p>
                            </div>
                            <select className="bg-gray-50 dark:bg-gray-800 border-none text-sm text-gray-500 dark:text-gray-400 rounded-lg focus:ring-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>This Year</option>
                            </select>
                        </div>
                        <div className="p-6 h-[350px] w-full bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontSize: '12px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="active"
                                        stroke="#0ea5e9"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorActive)"
                                        name="Active Users"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="new"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorNew)"
                                        name="New Visits"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Quick Actions Grid (Admin only) */}
                    {hasRole(['admin', 'super_admin']) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate('/users')}
                                className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-md transition-all text-left"
                            >
                                <div className="p-2 mb-3 bg-primary-50 dark:bg-primary-500/10 rounded-lg w-fit group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 transition-colors">
                                    <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">Manage Users</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add, edit, or remove user accounts</p>
                            </button>

                            <button
                                onClick={() => navigate('/settings')}
                                className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md transition-all text-left"
                            >
                                <div className="p-2 mb-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg w-fit group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">System Settings</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure global application preferences</p>
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">
                    {/* Recent Activity Feed */}
                    <Card className="h-full border-gray-100 dark:border-gray-700 shadow-sm" padding="none">
                        <div className="p-6 border-b border-gray-50 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary-500" />
                                Recent Activity
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 dark:before:bg-gray-700">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((activity) => (
                                        <div key={activity._id} className="relative pl-8 group">
                                            <div className="absolute left-0 top-1 w-[10px] h-[10px] bg-white dark:bg-gray-800 border-2 border-primary-500 rounded-full group-hover:scale-125 transition-transform z-10"></div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
                                                    {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</p>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(activity.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                            <Clock className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400">No recent activity found</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/activity-logs')}
                                className="w-full mt-6 py-2.5 px-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                View All History
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </Card>

                    {/* Mini Profile Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl font-bold backdrop-blur-sm">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{user?.name}</h3>
                                <p className="text-gray-400 text-sm capitalize">{user?.role?.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm border-t border-white/10 pt-3">
                                <span className="text-gray-400">Status</span>
                                <span className="flex items-center gap-2 text-emerald-400 font-medium">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                    Active
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-t border-white/10 pt-3">
                                <span className="text-gray-400">Member Since</span>
                                <span>{new Date().getFullYear()}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-full mt-6 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
