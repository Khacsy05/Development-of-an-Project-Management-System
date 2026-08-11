"use client"

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useClassStore } from '@/store/useClassStore';
import { getMajorsByFaculty } from '@/services/major.service';
import { getUserList } from '@/services/user.service';
import { Major, Class } from '@/type/class';
import { User } from '@/type/user';
import { toast } from 'sonner';

export default function DeanClassesPage() {
    const facultyId = useAuthStore((state) => state.faculty_id);
    const isInitializing = useAuthStore((state) => state.isInitializing);

    const {
        classes,
        totalItems,
        totalPages,
        currentPage,
        isLoading,
        fetchClassesList,
        createNewClass,
        updateExistingClass,
        deleteExistingClass,
        setCurrentPage,
    } = useClassStore();

    // States for dropdown selections
    const [majors, setMajors] = useState<Major[]>([]);
    const [lecturers, setLecturers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeClass, setActiveClass] = useState<Class | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form inputs state
    const [formData, setFormData] = useState({
        class_name: '',
        major_id: '',
        lecturer_id: '',
    });

    const limit = 6;

    // Load data from API for dropdowns (Majors and Lecturers in Dean's Faculty)
    const loadDropdownData = async () => {
        if (!facultyId) return;
        try {
            const [majorsRes, lecturersRes] = await Promise.all([
                getMajorsByFaculty(facultyId),
                getUserList({ role: 'Lecturer', faculty_id: Number(facultyId), limit: 1000 }),
            ]);
            setMajors(majorsRes || []);
            setLecturers(lecturersRes.data || []);
        } catch (error) {
            console.error('Lỗi khi tải thông tin ngành và giảng viên:', error);
            toast.error('Không thể tải danh sách ngành học và giảng viên.');
        }
    };

    const fetchClasses = (pageNum: number) => {
        if (!facultyId) return;
        fetchClassesList({
            page: pageNum,
            limit,
            faculty_id: Number(facultyId),
            class_name: searchQuery.trim() || undefined,
        });
    };

    // Load classes initially and on dependencies changes
    useEffect(() => {
        if (!isInitializing && facultyId) {
            fetchClasses(currentPage);
            loadDropdownData();
        }
    }, [isInitializing, facultyId, currentPage]);

    // Scroll main panel to top on page change
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchClasses(1);
    };

    const resetForm = () => {
        setFormData({
            class_name: '',
            major_id: majors[0]?.major_id || '',
            lecturer_id: lecturers[0]?.user_id || '',
        });
    };

    const openAddModal = () => {
        resetForm();
        setIsAddModalOpen(true);
    };

    const openEditModal = (c: Class) => {
        setActiveClass(c);
        setFormData({
            class_name: c.class_name,
            major_id: String(c.major_id),
            lecturer_id: String(c.lecturer_id),
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.class_name.trim()) {
            toast.error('Vui lòng nhập tên lớp học!');
            return;
        }
        if (!formData.major_id) {
            toast.error('Vui lòng chọn ngành học!');
            return;
        }
        if (!formData.lecturer_id) {
            toast.error('Vui lòng chọn giảng viên cố vấn!');
            return;
        }

        setIsSubmitting(true);
        try {
            await createNewClass({
                class_name: formData.class_name.trim(),
                major_id: Number(formData.major_id),
                faculty_id: facultyId ? Number(facultyId) : null,
                lecturer_id: Number(formData.lecturer_id),
            });
            setIsAddModalOpen(false);
            fetchClasses(currentPage);
        } catch (err) {
            // Error toast is handled by store
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeClass) return;
        if (!formData.class_name.trim()) {
            toast.error('Vui lòng nhập tên lớp học!');
            return;
        }

        setIsSubmitting(true);
        try {
            await updateExistingClass(activeClass.class_id, {
                class_name: formData.class_name.trim(),
                major_id: Number(formData.major_id),
                lecturer_id: Number(formData.lecturer_id),
            });
            setIsEditModalOpen(false);
            fetchClasses(currentPage);
        } catch (err) {
            // Error toast is handled by store
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (classId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa lớp học này không? Tất cả sinh viên trong lớp sẽ bị ảnh hưởng.')) {
            return;
        }
        try {
            await deleteExistingClass(classId);
            fetchClasses(currentPage);
        } catch (err) {
            // Error is handled by store
        }
    };

    const getPaginationRange = (current: number, total: number) => {
        const delta = 1;
        const range: (number | string)[] = [];
        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
                range.push(i);
            } else if (range[range.length - 1] !== '...') {
                range.push('...');
            }
        }
        return range;
    };

    if (isInitializing || (isLoading && classes.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-semibold">Đang chuẩn bị danh sách lớp học...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto p-2 animate-fadeIn">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-black text-gray-800 tracking-tight uppercase flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block"></span>
                        Quản lý Lớp học ({totalItems})
                    </h1>
                    <p className="text-xs font-semibold text-gray-400">Danh sách các lớp học niên chế thuộc khoa</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Tạo lớp học mới
                </button>
            </div>

            {/* Filter and search */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                <form onSubmit={handleSearch} className="flex gap-2 w-full sm:max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên lớp..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                    <button
                        type="submit"
                        className="cursor-pointer bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-xl font-bold text-xs transition-colors"
                    >
                        Tìm kiếm
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[380px] flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-black text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Mã lớp</th>
                                <th className="px-6 py-4">Tên lớp học</th>
                                <th className="px-6 py-4">Ngành đào tạo</th>
                                <th className="px-6 py-4">Giảng viên cố vấn</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs font-medium text-gray-700">
                            {classes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-20 text-gray-400 font-semibold">
                                        Không tìm thấy lớp học nào thuộc khoa.
                                    </td>
                                </tr>
                            ) : (
                                classes.map((c) => (
                                    <tr key={c.class_id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-500">#{c.class_id}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{c.class_name}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {c.major?.major_name || 'Chưa định nghĩa'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-800">
                                            {c.lecturer?.fullname ? (
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{c.lecturer.fullname}</span>
                                                    <span className="text-[10px] text-gray-400 font-normal">{c.lecturer.email}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Chưa phân công</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => openEditModal(c)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="Sửa thông tin"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c.class_id)}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Xóa lớp học"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                        <div className="text-gray-400 font-semibold">
                            Hiển thị {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, totalItems)} trong tổng số {totalItems}
                        </div>
                        <nav className="inline-flex -space-x-px rounded-md shadow-sm">
                            <button
                                onClick={() => {
                                    if (currentPage > 1) {
                                        setCurrentPage(currentPage - 1);
                                    }
                                }}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center rounded-l-md px-3 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                Trước
                            </button>
                            {getPaginationRange(currentPage, totalPages).map((pageNum, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (typeof pageNum === 'number' && currentPage !== pageNum) {
                                            setCurrentPage(pageNum);
                                        }
                                    }}
                                    className={`relative inline-flex items-center px-3 py-1.5 text-xs font-bold focus:z-20 ${currentPage === pageNum
                                        ? 'z-10 bg-blue-600 text-white ring-1 ring-blue-600 focus-visible:outline focus-visible:outline-2 pointer-events-none'
                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    if (currentPage < totalPages) {
                                        setCurrentPage(currentPage + 1);
                                    }
                                }}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center rounded-r-md px-3 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                Sau
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-100 flex flex-col gap-4 animate-scaleUp">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                            <h2 className="text-sm font-black text-gray-800 uppercase">Tạo lớp học mới</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">Tên lớp học</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: CNTT K16A"
                                    value={formData.class_name}
                                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">Ngành học trực thuộc</label>
                                <select
                                    value={formData.major_id}
                                    onChange={(e) => setFormData({ ...formData, major_id: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                                >
                                    <option value="">-- Chọn ngành học --</option>
                                    {majors.map((m) => (
                                        <option key={m.major_id} value={m.major_id}>{m.major_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">Giảng viên cố vấn (Advisor)</label>
                                <select
                                    value={formData.lecturer_id}
                                    onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                                >
                                    <option value="">-- Chọn giảng viên --</option>
                                    {lecturers.map((l) => (
                                        <option key={l.user_id} value={l.user_id}>{l.fullname}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Đang tạo...' : 'Xác nhận tạo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-100 flex flex-col gap-4 animate-scaleUp">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                            <h2 className="text-sm font-black text-gray-800 uppercase">Cập nhật lớp học</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">Tên lớp học</label>
                                <input
                                    type="text"
                                    placeholder="Tên lớp học"
                                    value={formData.class_name}
                                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">Ngành học trực thuộc</label>
                                <select
                                    value={formData.major_id}
                                    onChange={(e) => setFormData({ ...formData, major_id: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                                >
                                    <option value="">-- Chọn ngành học --</option>
                                    {majors.map((m) => (
                                        <option key={m.major_id} value={m.major_id}>{m.major_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">Giảng viên cố vấn (Advisor)</label>
                                <select
                                    value={formData.lecturer_id}
                                    onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                                >
                                    <option value="">-- Chọn giảng viên --</option>
                                    {lecturers.map((l) => (
                                        <option key={l.user_id} value={l.user_id}>{l.fullname}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Đang lưu...' : 'Xác nhận lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
