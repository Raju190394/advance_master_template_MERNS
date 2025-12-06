import React, { useState, useEffect } from 'react';
import { Student } from '../../services/student.service';
import { studentService } from '../../services/student.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import StudentForm from './StudentForm';
import Pagination from '../../components/ui/Pagination';
import { Plus, Search, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Filter, X } from 'lucide-react';

const COURSES = [
    'Full Stack Web Development',
    'Data Science',
    'Digital Marketing',
    'Graphic Design',
    'Mobile App Development',
];

const QUALIFICATIONS = [
    'High School',
    'Diploma',
    'B.Tech',
    'BCA',
    'MCA',
    'M.Tech',
    'Other'
];

const StudentList: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        limit: 10
    });

    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const [showFilters, setShowFilters] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
        key: 'createdAt',
        direction: 'desc'
    });
    const [filters, setFilters] = useState({
        gender: '',
        course: '',
        qualification: ''
    });

    useEffect(() => {
        fetchStudents();
    }, [page, search, sortConfig, filters]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const queryFilters = {
                sortBy: sortConfig.key,
                sortOrder: sortConfig.direction,
                ...filters
            };
            const response = await studentService.getAll(page, pagination.limit, search, queryFilters);
            setStudents(response.data);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({
            gender: '',
            course: '',
            qualification: ''
        });
        setPage(1);
    };

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="w-4 h-4 ml-1 text-primary-600" />
            : <ArrowDown className="w-4 h-4 ml-1 text-primary-600" />;
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;
        try {
            await studentService.delete(id);
            fetchStudents();
        } catch (err: any) {
            alert(err.message || 'Failed to delete student');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Students</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Manage student records</p>
                </div>
                <Button onClick={() => { setEditingStudent(null); setShowForm(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                </Button>
            </div>

            <Card>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search by name, father name or mobile..."
                        value={search}
                        onChange={handleSearch}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="w-4 h-4 mr-2" />
                        Filters {(filters.gender || filters.course || filters.qualification) && '(Active)'}
                    </Button>
                    {(filters.gender || filters.course || filters.qualification) && (
                        <Button variant="danger" size="sm" onClick={clearFilters}>
                            <X className="w-4 h-4 mr-2" />
                            Clear
                        </Button>
                    )}
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <select
                            value={filters.gender}
                            onChange={(e) => handleFilterChange('gender', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>

                        <select
                            value={filters.course}
                            onChange={(e) => handleFilterChange('course', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                            <option value="">All Courses</option>
                            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <select
                            value={filters.qualification}
                            onChange={(e) => handleFilterChange('qualification', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                            <option value="">All Qualifications</option>
                            {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                    </div>
                )}
            </Card>

            <Card padding="none">
                {error && <div className="p-4 bg-red-50 text-red-600">{error}</div>}
                {loading ? (
                    <div className="p-12 text-center">Loading...</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 group"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center">
                                                Name <SortIcon columnKey="name" />
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 group"
                                            onClick={() => handleSort('fatherName')}
                                        >
                                            <div className="flex items-center">
                                                Father's Name <SortIcon columnKey="fatherName" />
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 group"
                                            onClick={() => handleSort('totalAmount')}
                                        >
                                            <div className="flex items-center">
                                                Fee <SortIcon columnKey="totalAmount" />
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.map((student, index) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {(page - 1) * pagination.limit + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {student.photo ? (
                                                        <img src={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}/uploads/students/${student.photo}`} alt="" className="h-8 w-8 rounded-full mr-3 object-cover" />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center text-gray-500 text-xs">NA</div>
                                                    )}
                                                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.fatherName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="max-w-xs truncate" title={student.courses}>
                                                    {student.courses.replace(/[\[\]"]/g, '').split(',').join(', ')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ₹{(student.totalAmount || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.mobileNo}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => { setEditingStudent(student); setShowForm(true); }} className="text-primary-600 hover:text-primary-900 mr-3">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            currentPage={page}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.total}
                            limit={pagination.limit}
                            onPageChange={(p) => setPage(p)}
                        />
                    </>
                )}
            </Card>

            {showForm && (
                <StudentForm
                    student={editingStudent}
                    onClose={() => { setShowForm(false); setEditingStudent(null); }}
                    onSuccess={() => { setShowForm(false); setEditingStudent(null); fetchStudents(); }}
                />
            )}
        </div>
    );
};

export default StudentList;
