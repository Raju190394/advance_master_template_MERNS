import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Activity, CheckCircle, XCircle } from 'lucide-react';

interface ReportStats {
    users: {
        total: number;
        active: number;
        inactive: number;
    };
    activities: {
        total: number;
        byAction: { _id: string; count: number }[];
        byModule: { _id: string; count: number }[];
        topUsers: { _id: { userId: number; name: string }; count: number }[];
    };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Reports: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reports/stats');
            setStats(response.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch report statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
            </div>
        );
    }

    if (!stats) return null;

    // const userStatusData = [
    //     { name: 'Active', value: stats.users.active },
    //     { name: 'Inactive', value: stats.users.inactive },
    // ];

    const actionData = stats.activities.byAction.map(item => ({
        name: item._id,
        count: item.count
    }));

    const moduleData = stats.activities.byModule.map(item => ({
        name: item._id,
        count: item.count
    }));

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">System Reports</h1>
                <p className="text-gray-600 mt-2">Analysis of user activities and system usage (Last 30 Days)</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Users</p>
                            <h3 className="text-3xl font-bold mt-1">{stats.users.total}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Active Users</p>
                            <h3 className="text-3xl font-bold mt-1">{stats.users.active}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-none">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm font-medium">Inactive Users</p>
                            <h3 className="text-3xl font-bold mt-1">{stats.users.inactive}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg">
                            <XCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Total Activities</p>
                            <h3 className="text-3xl font-bold mt-1">{stats.activities.total}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activities by Action Chart */}
                <Card title="Activities by Action Type">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={actionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" name="Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Activities by Module Chart */}
                <Card title="Activities by Module">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={moduleData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {moduleData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Top Active Users */}
            <Card title="Top Most Active Users">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Count</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stats.activities.topUsers.map((user, index) => (
                                <tr key={user._id.userId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        #{index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user._id.name}</div>
                                        <div className="text-xs text-gray-500">ID: {user._id.userId}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                        {user.count}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => navigate(`/reports/user/${user._id.userId}`)}
                                            className="text-primary-600 hover:text-primary-900 hover:underline"
                                        >
                                            View Report
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Reports;
