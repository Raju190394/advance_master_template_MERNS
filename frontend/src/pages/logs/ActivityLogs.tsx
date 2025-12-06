import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import { Search, Activity } from 'lucide-react';

interface ActivityLog {
    _id: string;
    userId: number;
    name: string;
    role: string;
    action: string;
    module: string;
    description: string;
    ipAddress: string;
    createdAt: string;
}

const ActivityLogs: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({
        search: '',
        module: '',
        action: '',
        page: 1,
        limit: 10,
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    useEffect(() => {
        fetchLogs();
    }, [filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError('');
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.module) params.append('module', filters.module);
            if (filters.action) params.append('action', filters.action);
            params.append('page', filters.page.toString());
            params.append('limit', filters.limit.toString());

            const response = await api.get(`/activity-logs?${params.toString()}`);
            setLogs(response.data.data);
            setPagination(response.data.pagination);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch activity logs');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, search: e.target.value, page: 1 });
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        setFilters({ ...filters, page: newPage });
    };

    const getActionBadgeVariant = (action: string) => {
        switch (action) {
            case 'CREATE': return 'success';
            case 'UPDATE': return 'warning';
            case 'DELETE': return 'danger';
            case 'LOGIN': return 'info';
            case 'LOGOUT': return 'secondary';
            default: return 'secondary';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
                    <p className="text-gray-600 mt-2">Monitor user activities and system events</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="Search by name or description..."
                            value={filters.search}
                            onChange={handleSearch}
                            className="pl-10"
                            autoComplete="off"
                        />
                    </div>
                    <div>
                        <select
                            name="module"
                            value={filters.module}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">All Modules</option>
                            <option value="Auth">Auth</option>
                            <option value="Users">Users</option>
                            <option value="Profile">Profile</option>
                            <option value="Activity Logs">Activity Logs</option>
                        </select>
                    </div>
                    <div>
                        <select
                            name="action"
                            value={filters.action}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">All Actions</option>
                            <option value="LOGIN">Login</option>
                            <option value="LOGOUT">Logout</option>
                            <option value="CREATE">Create</option>
                            <option value="UPDATE">Update</option>
                            <option value="DELETE">Delete</option>
                            <option value="VIEW">View</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Logs Table */}
            <Card padding="none">
                {error && (
                    <div className="p-4 bg-red-50 border-b border-red-200">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No activity logs found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs.map((log, index) => (
                                        <tr key={log._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {(pagination.page - 1) * pagination.limit + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{log.name}</div>
                                                <div className="text-xs text-gray-500 capitalize">{(log.role || '').replace('_', ' ')}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={getActionBadgeVariant(log.action)}>
                                                    {log.action}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.module}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={log.description}>
                                                {log.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.ipAddress}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.total}
                            limit={pagination.limit}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </Card>
        </div>
    );
};

export default ActivityLogs;
