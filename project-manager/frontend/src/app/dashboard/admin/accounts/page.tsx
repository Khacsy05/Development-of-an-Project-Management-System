"use client"

import React, { useEffect, useState } from 'react';

import { getFacultyList } from '@/services/faculty.service';
import { getClassList } from '@/services/class.service';
import { User, UserQuery } from '@/type/user';
import { toast } from 'sonner';

import { useUserStore } from '@/store/useUserStore';

export default function AccountManagementPage() {
    const {
        users,
        isLoading,
        totalItems,
        totalPages,
        currentPage,
        fetchUsersList,
        createNewUser,
        updateExistingUser,
        toggleUserActiveStatus,
        setCurrentPage,
    } = useUserStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>(''); // empty means All
    const limit = 6;

    const getPaginationRange = (current: number, total: number) => {
        const delta = 1;
        const range: (number | string)[] = [];

        for (let i = 1; i <= total; i++) {
            if (
                i === 1 ||
                i === total ||
                (i >= current - delta && i <= current + delta)
            ) {
                range.push(i);
            } else if (range[range.length - 1] !== '...') {
                range.push('...');
            }
        }
        return range;
    };

    // Dropdown Data
    const [faculties, setFaculties] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullname: '',
        email: '',
        usercode: '',
        gender: 'Nam',
        phone_number: '',
        role_id: '3', // Default: Student
        faculty_id: '',
        class_id: '',
    });

    const rolesMap = {
        '1': 'Admin',
        '2': 'Lecturer',
        '3': 'Student',
        '4': 'Faculty',
    };

    const getRoleName = (roleId: any) => {
        const idStr = String(roleId);
        if (idStr === '1') return 'Quản trị viên';
        if (idStr === '2') return 'Giảng viên';
        if (idStr === '3') return 'Sinh viên';
        if (idStr === '4') return 'Giáo vụ Khoa';
        return 'Chưa xác định';
    };

    const fetchUsers = (page: number) => {
        const queryParams: UserQuery = {
            page,
            limit,
            ...(selectedRole && { role: selectedRole }),
        };
        if (searchQuery.trim()) {
            queryParams.fullname = searchQuery.trim();
        }
        fetchUsersList(queryParams);
    };

    const fetchDropdownData = async () => {
        try {
            const [facsRes, classesRes] = await Promise.all([
                getFacultyList(),
                getClassList({ limit: 1000 }), // Lấy tất cả lớp học để tự động lọc trên client
            ]);
            setFaculties(facsRes || []);
            setClasses(classesRes.data || []);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu cấu hình:', error);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage, selectedRole]);

    // Cuộn lên đầu trang khi thay đổi trang phân trang
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchUsers(1);
    };

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const resetForm = () => {
        setFormData({
            username: '',
            password: '',
            fullname: '',
            email: '',
            usercode: '',
            gender: 'Nam',
            phone_number: '',
            role_id: '3',
            faculty_id: '',
            class_id: '',
        });
        setSelectedUser(null);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            password: '', // Password is not editable
            fullname: user.fullname,
            email: user.email,
            usercode: user.usercode,
            gender: user.gender || 'Nam',
            phone_number: user.phone_number || '',
            role_id: String(user.role_id),
            faculty_id: user.faculty_id ? String(user.faculty_id) : '',
            class_id: user.student?.class_id ? String(user.student.class_id) : '',
        });
        setIsEditModalOpen(true);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!formData.username || !formData.password || !formData.fullname || !formData.email || !formData.usercode) {
                toast.error('Vui lòng điền đầy đủ các trường bắt buộc!');
                return;
            }

            const payload: any = { ...formData };
            if (payload.role_id !== '3') {
                delete payload.class_id;
            }
            if (!payload.faculty_id) {
                delete payload.faculty_id;
            }

            await createNewUser(payload);
            setIsAddModalOpen(false);
            fetchUsers(currentPage);
        } catch (error: any) {
            // Error toast handled inside store
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        try {
            if (!formData.fullname || !formData.email) {
                toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
                return;
            }

            const payload: any = {
                fullname: formData.fullname,
                email: formData.email,
                gender: formData.gender,
                phone_number: formData.phone_number,
                role_id: formData.role_id,
                faculty_id: formData.faculty_id || null,
            };

            if (formData.role_id === '3' && formData.class_id) {
                payload.class_id = formData.class_id;
            }

            await updateExistingUser(selectedUser.user_id, payload);
            setIsEditModalOpen(false);
            fetchUsers(currentPage);
        } catch (error: any) {
            // Error toast handled inside store
        }
    };

    const handleToggleStatus = async (user: User) => {
        try {
            await toggleUserActiveStatus(user.user_id, user.is_active);
            fetchUsers(currentPage);
        } catch (error: any) {
            // Error toast handled inside store
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 animate-fadeIn">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Quản lý tài khoản người dùng</h1>
                    <p className="text-xs text-gray-500 font-semibold mt-1">
                        Quản lý thông tin, vai trò và trạng thái hoạt động của mọi thành viên trên hệ thống
                    </p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 self-start"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Thêm tài khoản mới
                </button>
            </div>

            {/* Filter/Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 w-full">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc mã người dùng..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-5 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white placeholder-gray-400 font-medium"
                    />
                    <div className="absolute left-4 top-3.5 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="w-full md:w-48">
                    <select
                        value={selectedRole}
                        onChange={(e) => {
                            setSelectedRole(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none bg-white font-semibold text-gray-700"
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="Lecturer">Giảng viên</option>
                        <option value="Student">Sinh viên</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gray-800 hover:bg-gray-900 text-white font-bold text-sm transition-all"
                >
                    Tìm kiếm
                </button>
            </form>

            {/* Users Table */}
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto min-h-[380px]">
                        <table className="w-full border-collapse text-left text-xs font-medium">
                            <thead>
                                <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                                    <th className="px-6 py-4">Mã người dùng</th>
                                    <th className="px-6 py-4">Họ và tên</th>
                                    <th className="px-6 py-4">Tên đăng nhập</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Vai trò</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4 text-center w-36">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16 text-gray-400 font-bold bg-white">
                                            Không tìm thấy tài khoản nào.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.user_id} className="hover:bg-slate-50/50 transition-colors align-middle">
                                            <td className="px-6 py-4 font-bold text-gray-900">{user.usercode}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-800">{user.fullname}</td>
                                            <td className="px-6 py-4 text-gray-500">{user.username}</td>
                                            <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${String(user.role_id) === '1' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                                    String(user.role_id) === '2' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                        String(user.role_id) === '3' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                            'bg-amber-50 text-amber-600 border border-amber-100'
                                                    }`}>
                                                    {getRoleName(user.role_id)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${user.is_active
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-red-50 text-red-700 border border-red-200'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                    {user.is_active ? 'Đang hoạt động' : 'Đã vô hiệu'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenEditModal(user)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        title="Sửa thông tin"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        className={`p-2 rounded-xl transition-all ${user.is_active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                                                            }`}
                                                        title={user.is_active ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'}
                                                    >
                                                        {user.is_active ? (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        )}
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
                        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-5 py-4">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Trước
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Sau
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold">
                                        Hiển thị trang <span className="text-gray-900 font-bold">{currentPage}</span> / <span className="text-gray-900 font-bold">{totalPages}</span> (Tổng <span className="text-gray-900 font-bold">{totalItems}</span> tài khoản)
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center rounded-l-lg px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                                        >
                                            <span className="sr-only">Trước</span>
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {getPaginationRange(currentPage, totalPages).map((page, idx) => {
                                            if (page === '...') {
                                                return (
                                                    <span
                                                        key={`ellipsis-${idx}`}
                                                        className="relative inline-flex items-center px-3 py-1.5 text-xs font-semibold text-gray-400 ring-1 ring-inset ring-gray-300 bg-white select-none"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }
                                            const pageNum = Number(page);
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => {
                                                        if (currentPage !== pageNum) {
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
                                            );
                                        })}

                                        <button
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center rounded-r-lg px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                                        >
                                            <span className="sr-only">Sau</span>
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Thêm tài khoản hệ thống mới</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Tên đăng nhập *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Mật khẩu khởi tạo *</label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Mã định danh (Usercode) *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ví dụ: SV123, GV099..."
                                        value={formData.usercode}
                                        onChange={(e) => setFormData({ ...formData, usercode: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Họ và tên *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.fullname}
                                        onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Email liên hệ *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Số điện thoại</label>
                                    <input
                                        type="text"
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Giới tính</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                                    >
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Vai trò hệ thống</label>
                                    <select
                                        value={formData.role_id}
                                        onChange={(e) => setFormData({ ...formData, role_id: e.target.value, class_id: '', faculty_id: '' })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                                    >
                                        <option value="3">Sinh viên</option>
                                        <option value="2">Giảng viên</option>
                                    </select>
                                </div>
                            </div>

                            {/* Conditional Select for Faculty */}
                            {formData.role_id !== '1' && (
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Khoa trực thuộc</label>
                                    <select
                                        value={formData.faculty_id}
                                        onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value, class_id: '' })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                                    >
                                        <option value="">-- Chọn khoa --</option>
                                        {faculties.map((f) => (
                                            <option key={f.faculty_id} value={f.faculty_id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Conditional Select for Class (only if Student) */}
                            {formData.role_id === '3' && (
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Lớp học niên chế</label>
                                    <select
                                        value={formData.class_id}
                                        onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                                    >
                                        <option value="">-- Chọn lớp học --</option>
                                        {classes
                                            .filter((c) => !formData.faculty_id || String(c.faculty_id) === String(formData.faculty_id))
                                            .map((c) => (
                                                <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
                                            ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-3 justify-end mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                                >
                                    Tạo tài khoản
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Sửa thông tin tài khoản</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="p-6 flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Tên đăng nhập (Không thể sửa)</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={formData.username}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 text-gray-400 cursor-not-allowed outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Mã định danh (Không thể sửa)</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={formData.usercode}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 text-gray-400 cursor-not-allowed outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Họ và tên *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.fullname}
                                        onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Email liên hệ *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Số điện thoại</label>
                                    <input
                                        type="text"
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Giới tính</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                                    >
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Vai trò hệ thống</label>
                                    <select
                                        value={formData.role_id}
                                        onChange={(e) => setFormData({ ...formData, role_id: e.target.value, class_id: '', faculty_id: '' })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                                    >
                                        <option value="3">Sinh viên</option>
                                        <option value="2">Giảng viên</option>
                                    </select>
                                </div>

                                {formData.role_id !== '1' && (
                                    <div>
                                        <label className="block text-xs text-gray-500 font-bold mb-1">Khoa trực thuộc</label>
                                        <select
                                            value={formData.faculty_id}
                                            onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value, class_id: '' })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                                        >
                                            <option value="">-- Chọn khoa --</option>
                                            {faculties.map((f) => (
                                                <option key={f.faculty_id} value={f.faculty_id}>{f.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Conditional Select for Class (only if Student) */}
                            {formData.role_id === '3' && (
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">Lớp học niên chế</label>
                                    <select
                                        value={formData.class_id}
                                        onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs outline-none bg-white"
                                    >
                                        <option value="">-- Chọn lớp học --</option>
                                        {classes
                                            .filter((c) => !formData.faculty_id || String(c.faculty_id) === String(formData.faculty_id))
                                            .map((c) => (
                                                <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
                                            ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-3 justify-end mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
