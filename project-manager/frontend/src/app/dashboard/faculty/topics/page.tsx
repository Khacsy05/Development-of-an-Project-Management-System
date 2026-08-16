"use client"

import React, { useEffect, useState } from 'react';
import { getTopicList, createTopic, updateTopic, deleteTopic } from '@/services/topic.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useCacheStore } from '@/store/useCacheStore';
import { useFacultyCacheStore } from '@/store/useFacultyCacheStore';
import { toast } from 'sonner';
import { Topic } from '@/type/topic';

export default function FacultyTopicsPage() {
    const facultyId = useAuthStore((state) => state.faculty_id);
    const isInitializing = useAuthStore((state) => state.isInitializing);
    const { fetchExpertises } = useCacheStore();
    const { topicsCache, setTopicsCache, clearTopicsCache } = useFacultyCacheStore();

    const [topics, setTopics] = useState<Topic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expertiseList, setExpertiseList] = useState<any[]>([]);
    // Modal UI States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    // Form States
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formTechnologies, setFormTechnologies] = useState('');
    const [formExpertiseId, setFormExpertiseId] = useState('');
    const [formIsAvailable, setFormIsAvailable] = useState(true);

    const handleOpenCreate = () => {
        setFormTitle('');
        setFormDescription('');
        setFormTechnologies('');
        setFormExpertiseId('');
        setFormIsAvailable(true);
        setIsCreateOpen(true);
    };

    const handleOpenEdit = (topic: Topic) => {
        setSelectedTopic(topic);
        setFormTitle(topic.title);
        setFormDescription(topic.description || '');
        setFormTechnologies(topic.technologies);
        setFormExpertiseId(topic.expertise_id);
        setFormIsAvailable(topic.is_available);
        setIsEditOpen(true);
    };

    const handleOpenDelete = (topic: Topic) => {
        setSelectedTopic(topic);
        setIsDeleteOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!facultyId) return;
            await createTopic({
                title: formTitle,
                description: formDescription,
                technologies: formTechnologies,
                expertise_id: formExpertiseId
            });
            toast.success('Thêm đề tài mới thành công!');
            setIsCreateOpen(false);
            clearTopicsCache();
            fetchTopics(currentPage);
        } catch (error: any) {
            console.error('Lỗi khi thêm đề tài:', error);
            toast.error(typeof error === 'string' ? error : 'Không thể tạo đề tài mới.');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!selectedTopic) return;
            await updateTopic(selectedTopic.topic_id, {
                title: formTitle,
                description: formDescription,
                technologies: formTechnologies,
                expertise_id: formExpertiseId,
                is_available: formIsAvailable
            });
            toast.success('Cập nhật đề tài thành công!');
            setIsEditOpen(false);
            clearTopicsCache();
            fetchTopics(currentPage);
        } catch (error: any) {
            console.error('Lỗi khi cập nhật đề tài:', error);
            toast.error(typeof error === 'string' ? error : 'Không thể cập nhật đề tài.');
        }
    };

    const handleDelete = async () => {
        try {
            if (!selectedTopic) return;
            await deleteTopic(selectedTopic.topic_id);
            toast.success('Xóa đề tài thành công!');
            setIsDeleteOpen(false);
            clearTopicsCache();
            fetchTopics(currentPage);
        } catch (error: any) {
            console.error('Lỗi khi xóa đề tài:', error);
            toast.error(typeof error === 'string' ? error : 'Không thể xóa đề tài.');
        }
    };

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 6;

    const getPaginationRange = (current: number, total: number) => {
        const delta = 1; // Show 1 page on left & right of current page
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

    // Filter states
    const [searchTitle, setSearchTitle] = useState('');
    const [isAvailableFilter, setIsAvailableFilter] = useState<string>('all');

    const fetchTopics = async (page: number) => {
        if (!facultyId) return;

        // Tạo khóa định danh duy nhất cho trang và bộ lọc hiện tại
        const cacheKey = `${page}_${searchTitle.trim()}_${isAvailableFilter}`;

        if (topicsCache.has(cacheKey)) {
            // Nếu đã từng tải trang này, hiển thị ngay lập tức (0ms) và không gọi API nữa
            const cached = topicsCache.get(cacheKey)!;
            setTopics(cached.topics);
            setCurrentPage(cached.pagination.page);
            setTotalPages(cached.pagination.totalPages);
            setTotalItems(cached.pagination.total);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            const params: any = {
                page,
                limit,
                facultyId: String(facultyId),
            };

            if (searchTitle.trim()) {
                params.title = searchTitle.trim();
            }

            if (isAvailableFilter !== 'all') {
                params.isAvailable = isAvailableFilter;
            }

            const res = await getTopicList(params);

            // Backend responses usually follow the { data, pagination } structure
            const topicsData = res.data || [];

            setTopics(topicsData);

            if (res.pagination) {
                setCurrentPage(res.pagination.page);
                setTotalPages(res.pagination.totalPages);
                setTotalItems(res.pagination.total);

                // Lưu vào bộ nhớ đệm
                setTopicsCache(cacheKey, {
                    topics: topicsData,
                    pagination: res.pagination
                });
            }
        } catch (error: any) {
            console.error('Lỗi khi tải đề tài:', error);
            toast.error(typeof error === 'string' ? error : 'Không thể tải danh sách đề tài.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadExpertises = async () => {
        const data = await fetchExpertises();
        setExpertiseList(data);
    };
    // Tự động cuộn mượt mà lên đầu trang khi chuyển trang
    useEffect(() => {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, [currentPage]);

    useEffect(() => {
        if (!isInitializing && facultyId) {
            fetchTopics(currentPage);
        }
    }, [facultyId, isInitializing, currentPage, isAvailableFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchTopics(1);
    };

    useEffect(() => {
        loadExpertises();
    }, []);

    return (
        <div className="flex flex-col gap-4 max-w-7xl mx-auto p-2 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Quản lý Đề tài Khoa</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Quản lý danh sách các đề tài nghiên cứu khoa học, đề xuất đồ án tốt nghiệp của khoa.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleOpenCreate}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Thêm đề tài mới
                    </button>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#3b4c80] border border-blue-100">
                        Tổng số: {totalItems} đề tài
                    </span>
                </div>
            </div>

            {/* Filter controls */}
            <form onSubmit={handleSearch} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Search box */}
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên đề tài..."
                            value={searchTitle}
                            onChange={(e) => setSearchTitle(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 text-gray-700"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Filter Status */}
                    <div className="w-full md:w-48">
                        <select
                            value={isAvailableFilter}
                            onChange={(e) => {
                                setIsAvailableFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 text-gray-700 bg-white"
                        >
                            <option value="all">Tất cả đề tài</option>
                            <option value="true">Đề tài trống (Available)</option>
                            <option value="false">Đề tài đã đăng ký (Used)</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full md:w-auto px-5 py-2 bg-[#3b4c80] hover:bg-[#2d3a63] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                    Tìm kiếm
                </button>
            </form>

            {/* Topics Table list */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-10 h-10 border-4 border-[#3b4c80] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500 font-semibold">Đang tải danh sách đề tài...</p>
                </div>
            ) : topics.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm max-w-xl mx-auto mt-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Không tìm thấy đề tài</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">Khoa hiện tại chưa có đề tài nào phù hợp với bộ lọc tìm kiếm của bạn.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto min-h-[290px]">
                            <table className="w-full text-left border-collapse table-fixed">
                                <thead>
                                    <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                                        <th className="px-4 py-3.5 w-[30%]">Tên đề tài & Mô tả</th>
                                        <th className="px-4 py-3.5 w-[15%]">Chuyên môn</th>
                                        <th className="px-4 py-3.5 w-[15%]">Công nghệ sử dụng</th>
                                        <th className="px-4 py-3.5 w-[15%]">Người đề xuất</th>
                                        <th className="px-4 py-3.5 w-[10%]">Trạng thái</th>
                                        <th className="px-4 py-3.5 w-[15%] text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-gray-700 text-xs">
                                    {topics.map((topic) => (
                                        <tr key={topic.topic_id} className="hover:bg-slate-50/50 transition-colors align-middle">
                                            {/* Title and description */}
                                            <td className="px-3 py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">
                                                        {topic.title}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 line-clamp-2">
                                                        {topic.description || 'Chưa có mô tả chi tiết cho đề tài này.'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Expertise */}
                                            <td className="px-3 py-3">
                                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-gray-600 border border-gray-200/50">
                                                    {topic.expertise?.name || '---'}
                                                </span>
                                            </td>

                                            {/* Technologies */}
                                            <td className="px-3 py-3 font-semibold text-gray-600 truncate">
                                                {topic.technologies || '---'}
                                            </td>

                                            {/* Creator */}
                                            <td className="px-3 py-3 text-gray-700">
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{topic.creator?.fullname || '---'}</span>
                                                    <span className="text-[10px] text-gray-400 mt-0.5">{topic.creator?.role?.role_name || '---'}</span>
                                                </div>
                                            </td>

                                            <td className="px-3 py-3">
                                                <div className="flex items-center">
                                                    <span className={`inline-block w-2 h-2 mr-2 rounded-full ${topic.is_available ? 'bg-green-500' : 'bg-red-500'
                                                        }`}></span>
                                                    {topic.is_available ? 'Mở' : 'Đóng'}
                                                </div>
                                            </td>

                                            <td className="px-3 py-3 text-center">
                                                <div className="flex gap-1.5 items-center justify-center">
                                                    <button
                                                        onClick={() => handleOpenEdit(topic)}
                                                        className="inline-flex items-center justify-center h-6 px-2 rounded-md text-[10px] font-semibold border border-indigo-100 bg-indigo-50 text-indigo-700 hover:border-indigo-200 hover:bg-indigo-100 transition-all"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Sửa
                                                    </button>

                                                    <button
                                                        onClick={() => handleOpenDelete(topic)}
                                                        className="inline-flex items-center justify-center h-6 px-2 rounded-md text-[10px] font-semibold border border-red-100 bg-red-50 text-red-700 hover:border-red-200 hover:bg-red-100 transition-all"
                                                        title="Xóa"
                                                    >
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-2xl shadow-sm border mt-2">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Trước
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Sau
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs text-gray-700">
                                        Hiển thị trang <span className="font-bold">{currentPage}</span> / <span className="font-bold">{totalPages}</span> (Tổng <span className="font-bold">{totalItems}</span> đề tài)
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center rounded-l-md px-2.5 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:hover:bg-white"
                                        >
                                            <span className="sr-only">Trước</span>
                                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {getPaginationRange(currentPage, totalPages).map((page, idx) => {
                                            if (page === '...') {
                                                return (
                                                    <span
                                                        key={`ellipsis-${idx}`}
                                                        className="relative inline-flex items-center px-3 py-1.5 text-xs font-semibold text-gray-400 ring-1 ring-inset ring-gray-300 bg-white"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }
                                            const pageNum = Number(page);
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`relative inline-flex items-center px-3 py-1.5 text-xs font-semibold focus:z-20 ${currentPage === pageNum
                                                        ? 'z-10 bg-[#3b4c80] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center rounded-r-md px-2.5 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:hover:bg-white"
                                        >
                                            <span className="sr-only">Sau</span>
                                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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

            {/* MODAL: THÊM ĐỀ TÀI MỚI */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-100 flex flex-col gap-4 mx-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="text-sm font-bold text-gray-900">Thêm đề tài nghiên cứu mới</h3>
                            <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="flex flex-col gap-3.5 text-xs text-gray-700">
                            <div>
                                <label className="block font-bold mb-1">Tên đề tài <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="Ví dụ: Hệ thống quản lý đề tài tốt nghiệp..."
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Mô tả đề tài</label>
                                <textarea
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder="Mô tả tóm tắt mục tiêu, nhiệm vụ của đề tài..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Công nghệ sử dụng <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formTechnologies}
                                    onChange={(e) => setFormTechnologies(e.target.value)}
                                    placeholder="Ví dụ: React, Next.js, NestJS, MySQL..."
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Chuyên môn <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={formExpertiseId}
                                    onChange={(e) => setFormExpertiseId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white"
                                >
                                    <option value="">-- Chọn chuyên môn --</option>
                                    {expertiseList.map((exp: any) => (
                                        <option key={String(exp.expertise_id)} value={String(exp.expertise_id)}>
                                            {exp.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-2">
                                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold transition-all text-gray-600">
                                    Hủy
                                </button>
                                <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-sm">
                                    Thêm mới
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: CHỈNH SỬA ĐỀ TÀI */}
            {isEditOpen && selectedTopic && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-100 flex flex-col gap-4 mx-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="text-sm font-bold text-gray-900">Chỉnh sửa đề tài</h3>
                            <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="flex flex-col gap-3.5 text-xs text-gray-700">
                            <div>
                                <label className="block font-bold mb-1">Tên đề tài <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Mô tả đề tài</label>
                                <textarea
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Công nghệ sử dụng <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formTechnologies}
                                    onChange={(e) => setFormTechnologies(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Chuyên môn <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={formExpertiseId}
                                    onChange={(e) => setFormExpertiseId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white"
                                >
                                    <option value="">-- Chọn chuyên môn --</option>
                                    {expertiseList.map((exp: any) => (
                                        <option key={String(exp.expertise_id)} value={String(exp.expertise_id)}>
                                            {exp.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-2">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold transition-all text-gray-600">
                                    Hủy
                                </button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-sm">
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: XÁC NHẬN XÓA */}
            {isDeleteOpen && selectedTopic && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-100 flex flex-col gap-4 mx-4">
                        <div className="flex items-center gap-3 text-red-600">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Xác nhận xóa đề tài</h3>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Bạn có chắc chắn muốn xóa đề tài <span className="font-bold text-gray-800">"{selectedTopic.title}"</span> không? Hành động này sẽ xóa vĩnh viễn đề tài khỏi ngân hàng đề xuất và không thể khôi phục lại.
                        </p>
                        <div className="flex justify-end gap-2 border-t border-gray-100 pt-3 mt-1">
                            <button onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold transition-all text-xs text-gray-600">
                                Hủy bỏ
                            </button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all text-xs shadow-sm">
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}