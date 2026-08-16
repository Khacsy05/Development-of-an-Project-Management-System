"use client"

import React, { useEffect, useState } from 'react';
import { useFacultyStore } from '@/store/useFacultyStore';
import { getUserList } from '@/services/user.service';
import { Faculty } from '@/type/faculty';
import { User } from '@/type/user';
import { toast } from 'sonner';

export default function AdminFacultiesPage() {
    const {
        faculties,
        isLoading,
        fetchFaculties,
        createNewFaculty,
        updateExistingFaculty,
    } = useFacultyStore();

    // States
    const [lecturers, setLecturers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeFaculty, setActiveFaculty] = useState<Faculty | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form inputs state
    const [formData, setFormData] = useState({
        faculty_code: '',
        name: '',
        dean_id: '',
    });

    // Load faculties and lecturers list
    const loadInitialData = async () => {
        try {
            await fetchFaculties();
            const lecturersRes = await getUserList({ role: 'Lecturer', limit: 1000 });
            setLecturers(lecturersRes.data || []);
        } catch (error) {
            console.error('Lỗi khi tải danh sách dữ liệu:', error);
            toast.error('Không thể tải danh sách khoa hoặc giảng viên.');
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const resetForm = () => {
        setFormData({
            faculty_code: '',
            name: '',
            dean_id: '',
        });
    };

    const openAddModal = () => {
        resetForm();
        setIsAddModalOpen(true);
    };

    const openEditModal = (f: Faculty) => {
        setActiveFaculty(f);
        setFormData({
            faculty_code: f.faculty_code,
            name: f.name,
            dean_id: f.dean_id ? String(f.dean_id) : '',
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.faculty_code.trim()) {
            toast.error('Vui lòng nhập mã khoa!');
            return;
        }
        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên khoa!');
            return;
        }

        setIsSubmitting(true);
        try {
            await createNewFaculty({
                faculty_code: formData.faculty_code.trim().toUpperCase(),
                name: formData.name.trim(),
                dean_id: formData.dean_id || null,
            });
            setIsAddModalOpen(false);
        } catch (err) {
            // Error is handled by store
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeFaculty) return;
        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên khoa!');
            return;
        }

        setIsSubmitting(true);
        try {
            await updateExistingFaculty(activeFaculty.faculty_id, {
                faculty_code: activeFaculty.faculty_code,
                name: formData.name.trim(),
                dean_id: formData.dean_id || null,
            });
            setIsEditModalOpen(false);
        } catch (err) {
            // Error is handled by store
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter faculties locally by search query
    const filteredFaculties = faculties.filter((f) => {
        const query = searchQuery.trim().toLowerCase();
        return (
            f.name.toLowerCase().includes(query) ||
            f.faculty_code.toLowerCase().includes(query)
        );
    });

    if (isLoading && faculties.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-semibold">Đang tải danh sách khoa...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto p-2 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-black text-gray-800 tracking-tight uppercase flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block"></span>
                        Quản lý Khoa ({faculties.length})
                    </h1>
                    <p className="text-xs font-semibold text-gray-400">Danh sách các Khoa đào tạo của trường đại học</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Tạo khoa mới
                </button>
            </div>

            {/* Filter and search */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 w-full sm:max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã khoa, tên khoa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[350px] flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-black text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Mã ID</th>
                                <th className="px-6 py-4">Mã Khoa</th>
                                <th className="px-6 py-4">Tên Khoa</th>
                                <th className="px-6 py-4">Trưởng Khoa (Dean)</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs font-medium text-gray-700">
                            {filteredFaculties.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-20 text-gray-400 font-semibold">
                                        Không tìm thấy khoa nào.
                                    </td>
                                </tr>
                            ) : (
                                filteredFaculties.map((f) => (
                                    <tr key={f.faculty_id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-500">#{f.faculty_id}</td>
                                        <td className="px-6 py-4 font-bold text-blue-600">{f.faculty_code}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{f.name}</td>
                                        <td className="px-6 py-4 text-gray-800">
                                            {f.dean?.fullname ? (
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">{f.dean.fullname}</span>
                                                    <span className="text-[10px] text-gray-400 font-normal">{f.dean.email}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Chưa chỉ định</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openEditModal(f)}
                                                className="cursor-pointer p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Sửa khoa"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-100 flex flex-col gap-4 animate-scaleUp">
                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                            <h2 className="text-sm font-black text-gray-800 uppercase">Tạo khoa mới</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">Mã Khoa (Unique Code)</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: CNTT, CƠKHÍ"
                                    value={formData.faculty_code}
                                    onChange={(e) => setFormData({ ...formData, faculty_code: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">Tên Khoa</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: Công nghệ thông tin"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">Trưởng khoa (Dean - Không bắt buộc)</label>
                                <select
                                    value={formData.dean_id}
                                    onChange={(e) => setFormData({ ...formData, dean_id: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                                >
                                    <option value="">-- Chưa chỉ định --</option>
                                    {lecturers.map((l) => (
                                        <option key={l.user_id} value={l.user_id}>{l.fullname} ({l.email})</option>
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
                            <h2 className="text-sm font-black text-gray-800 uppercase">Cập nhật khoa</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">Mã Khoa (Không thể sửa)</label>
                                <input
                                    type="text"
                                    value={formData.faculty_code}
                                    disabled
                                    className="w-full px-4 py-2.5 border border-gray-100 bg-gray-50 text-gray-400 rounded-xl text-xs outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">Tên Khoa</label>
                                <input
                                    type="text"
                                    placeholder="Tên khoa"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">Trưởng khoa (Dean)</label>
                                <select
                                    value={formData.dean_id}
                                    onChange={(e) => setFormData({ ...formData, dean_id: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                                >
                                    <option value="">-- Chưa chỉ định --</option>
                                    {lecturers.map((l) => (
                                        <option key={l.user_id} value={l.user_id}>{l.fullname} ({l.email})</option>
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
