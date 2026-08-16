"use client"

import React, { useEffect, useState } from 'react';
import { useMajorStore } from '@/store/useMajorStore';
import { useFacultyStore } from '@/store/useFacultyStore';
import { Major } from '@/type/major';
import { toast } from 'sonner';

export default function AdminMajorsPage() {
    const {
        majors,
        isLoading: isMajorsLoading,
        fetchMajors,
        createNewMajor,
        updateExistingMajor,
    } = useMajorStore();

    const {
        faculties,
        fetchFaculties,
    } = useFacultyStore();

    // States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFacultyFilter, setSelectedFacultyFilter] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeMajor, setActiveMajor] = useState<Major | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form inputs state
    const [formData, setFormData] = useState({
        major_name: '',
        faculty_id: '',
    });

    // Load data
    const loadInitialData = async () => {
        try {
            await fetchMajors();
            await fetchFaculties();
        } catch (error) {
            console.error('Lỗi khi tải danh sách ngành hoặc khoa:', error);
            toast.error('Không thể tải danh sách chuyên ngành hoặc khoa.');
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const resetForm = () => {
        setFormData({
            major_name: '',
            faculty_id: '',
        });
    };

    const openAddModal = () => {
        resetForm();
        if (faculties.length > 0) {
            setFormData({
                major_name: '',
                faculty_id: faculties[0].faculty_id,
            });
        }
        setIsAddModalOpen(true);
    };

    const openEditModal = (m: Major) => {
        setActiveMajor(m);
        setFormData({
            major_name: m.major_name,
            faculty_id: String(m.faculty_id),
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.major_name.trim()) {
            toast.error('Vui lòng nhập tên chuyên ngành!');
            return;
        }
        if (!formData.faculty_id) {
            toast.error('Vui lòng chọn khoa trực thuộc!');
            return;
        }

        setIsSubmitting(true);
        try {
            await createNewMajor({
                major_name: formData.major_name.trim(),
                faculty_id: formData.faculty_id,
            });
            setIsAddModalOpen(false);
        } catch (err) {
            // Error handled by store
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeMajor) return;
        if (!formData.major_name.trim()) {
            toast.error('Vui lòng nhập tên chuyên ngành!');
            return;
        }
        if (!formData.faculty_id) {
            toast.error('Vui lòng chọn khoa trực thuộc!');
            return;
        }

        setIsSubmitting(true);
        try {
            await updateExistingMajor(activeMajor.major_id, {
                major_name: formData.major_name.trim(),
                faculty_id: formData.faculty_id,
            });
            setIsEditModalOpen(false);
        } catch (err) {
            // Error handled by store
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter majors locally by search query and faculty filter
    const filteredMajors = majors.filter((m) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch = m.major_name.toLowerCase().includes(query);
        const matchesFaculty = selectedFacultyFilter === '' || String(m.faculty_id) === selectedFacultyFilter;
        return matchesSearch && matchesFaculty;
    });

    if (isMajorsLoading && majors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-semibold">Đang tải danh sách chuyên ngành...</p>
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
                        Quản lý Chuyên ngành ({majors.length})
                    </h1>
                    <p className="text-xs font-semibold text-gray-400">Danh sách các chuyên ngành thuộc các khoa</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Tạo ngành mới
                </button>
            </div>

            {/* Filter and search */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 w-full sm:max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm kiếm chuyên ngành..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-gray-400 whitespace-nowrap">Lọc theo Khoa:</span>
                    <select
                        value={selectedFacultyFilter}
                        onChange={(e) => setSelectedFacultyFilter(e.target.value)}
                        className="w-full sm:w-60 px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                    >
                        <option value="">Tất cả các khoa</option>
                        {faculties.map((f) => (
                            <option key={f.faculty_id} value={f.faculty_id}>{f.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[350px] flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-black text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Mã ID</th>
                                <th className="px-6 py-4">Tên Chuyên Ngành</th>
                                <th className="px-6 py-4">Khoa Trực Thuộc</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs font-medium text-gray-700">
                            {filteredMajors.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-20 text-gray-400 font-semibold">
                                        Không tìm thấy chuyên ngành nào.
                                    </td>
                                </tr>
                            ) : (
                                filteredMajors.map((m) => (
                                    <tr key={m.major_id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-500">#{m.major_id}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{m.major_name}</td>
                                        <td className="px-6 py-4">
                                            {m.faculty ? (
                                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-bold text-[10px] uppercase">
                                                    {m.faculty.name} ({m.faculty.faculty_code})
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">Không rõ</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openEditModal(m)}
                                                className="cursor-pointer p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Sửa chuyên ngành"
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
                            <h2 className="text-sm font-black text-gray-800 uppercase">Tạo ngành học mới</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">Tên Chuyên Ngành</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: Kỹ thuật phần mềm"
                                    value={formData.major_name}
                                    onChange={(e) => setFormData({ ...formData, major_name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">Khoa trực thuộc</label>
                                <select
                                    value={formData.faculty_id}
                                    onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                                >
                                    {faculties.map((f) => (
                                        <option key={f.faculty_id} value={f.faculty_id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50"
                                >
                                    Hủy bộ
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
                            <h2 className="text-sm font-black text-gray-800 uppercase">Cập nhật ngành học</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">Tên Chuyên Ngành</label>
                                <input
                                    type="text"
                                    placeholder="Tên chuyên ngành"
                                    value={formData.major_name}
                                    onChange={(e) => setFormData({ ...formData, major_name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">Khoa trực thuộc</label>
                                <select
                                    value={formData.faculty_id}
                                    onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                                >
                                    {faculties.map((f) => (
                                        <option key={f.faculty_id} value={f.faculty_id}>{f.name}</option>
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
