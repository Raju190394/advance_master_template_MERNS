import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, FileText } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { studentService, Student } from '../../services/student.service';

interface StudentFormProps {
    student: Student | null;
    onClose: () => void;
    onSuccess: () => void;
}

const COURSES = [
    { id: 1, name: 'Full Stack Web Development', price: 25000 },
    { id: 2, name: 'Data Science', price: 30000 },
    { id: 3, name: 'Digital Marketing', price: 15000 },
    { id: 4, name: 'Graphic Design', price: 12000 },
    { id: 5, name: 'Mobile App Development', price: 20000 },
];

const StudentForm: React.FC<StudentFormProps> = ({ student, onClose, onSuccess }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm({
        defaultValues: {
            name: '',
            fatherName: '',
            qualification: '',
            gender: 'Male',
            courses: [] as string[],
            mobileNo: '',
            address: '',
        }
    });

    const [photo, setPhoto] = useState<File | null>(null);
    const [documents, setDocuments] = useState<FileList | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (student) {
            setValue('name', student.name);
            setValue('fatherName', student.fatherName);
            setValue('qualification', student.qualification);
            setValue('gender', student.gender);
            // Assuming courses is stored as JSON string or comma separated
            try {
                const courses = JSON.parse(student.courses);
                setValue('courses', Array.isArray(courses) ? courses : [student.courses]);
            } catch {
                setValue('courses', student.courses.split(',').filter(Boolean));
            }
            setValue('mobileNo', student.mobileNo);
            setValue('address', student.address);
        }
    }, [student, setValue]);

    const onSubmit = async (data: any) => {
        try {
            setError('');
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('fatherName', data.fatherName);
            formData.append('qualification', data.qualification);
            formData.append('gender', data.gender);
            const totalAmount = data.courses.reduce((sum: number, courseName: string) => {
                const course = COURSES.find(c => c.name === courseName);
                return sum + (course?.price || 0);
            }, 0);

            formData.append('courses', JSON.stringify(data.courses));
            formData.append('totalAmount', totalAmount.toString());
            formData.append('mobileNo', data.mobileNo);
            formData.append('address', data.address);

            if (photo) {
                formData.append('photo', photo);
            }

            if (documents) {
                for (let i = 0; i < documents.length; i++) {
                    formData.append('documents', documents[i]);
                }
            }

            if (student) {
                await studentService.update(student.id, formData);
            } else {
                await studentService.create(formData);
            }

            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save student');
        }
    };

    const handleCourseToggle = (course: string, currentCourses: string[]) => {
        if (currentCourses.includes(course)) {
            setValue('courses', currentCourses.filter(c => c !== course));
        } else {
            setValue('courses', [...currentCourses, course]);
        }
    };

    // Watch courses for the custom multiple select
    const watchedCourses = watch('courses');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {student ? 'Edit Student' : 'Add New Student'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Student Name"
                            {...register('name', { required: 'Name is required' })}
                            error={errors.name?.message as string}
                        />
                        <Input
                            label="Father's Name"
                            {...register('fatherName', { required: "Father's Name is required" })}
                            error={errors.fatherName?.message as string}
                        />
                        <Input
                            label="Qualification"
                            {...register('qualification', { required: 'Qualification is required' })}
                            error={errors.qualification?.message as string}
                        />
                        <Input
                            label="Mobile No"
                            {...register('mobileNo', { required: 'Mobile No is required' })}
                            error={errors.mobileNo?.message as string}
                        />
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                            <select
                                {...register('gender', { required: 'Gender is required' })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Courses</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {COURSES.map(course => (
                                <div
                                    key={course.id}
                                    onClick={() => handleCourseToggle(course.name, watchedCourses)}
                                    className={`p-4 border rounded-xl cursor-pointer transition-all ${watchedCourses.includes(course.name)
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500'
                                        : 'border-gray-200 hover:border-primary-200 dark:border-gray-700 dark:hover:border-primary-700 dark:bg-gray-800'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className={`font-medium ${watchedCourses.includes(course.name) ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}>
                                                {course.name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                ₹{course.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${watchedCourses.includes(course.name)
                                            ? 'bg-primary-600 border-primary-600'
                                            : 'border-gray-300 dark:border-gray-600'
                                            }`}>
                                            {watchedCourses.includes(course.name) && (
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {watchedCourses.length > 0 && (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center justify-between border border-gray-100 dark:border-gray-700">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Fee Amount</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{watchedCourses.length} courses selected</p>
                                </div>
                                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    ₹{watchedCourses.reduce((sum, name) => {
                                        const c = COURSES.find(c => c.name === name);
                                        return sum + (c?.price || 0);
                                    }, 0).toLocaleString()}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                        <textarea
                            {...register('address', { required: 'Address is required' })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[100px]"
                            placeholder="Full address..."
                        />
                        {errors.address && <p className="text-sm text-red-500">{errors.address.message as string}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Photo</label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {photo ? photo.name : 'Click to upload photo'}
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Documents (Multiple)</label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FileText className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                                        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                                            {documents ? `${documents.length} files selected` : 'Click to upload docs'}
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        multiple
                                        onChange={(e) => setDocuments(e.target.files)}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 gap-3">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            {student ? 'Update Student' : 'Create Student'}
                        </Button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default StudentForm;
