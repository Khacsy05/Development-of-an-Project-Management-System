"use client"

import React, { useEffect, useState } from 'react';
import { updatedCapstone, uploadFile } from '@/services/capstone.service';
import { getTopicList, getTopicById } from '@/services/topic.service';
import { useCapstoneStore } from '@/store/useCapstoneStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Topic } from '@/type/topic';

import { useStudentStore } from '@/store/useStudentStore';

export default function RegisterTopicPage() {
    const { capstone, fetchCapstone, setCapstone } = useCapstoneStore();
    const {
        topics,
        topicsTotalItems: totalItems,
        topicsTotalPages: totalPages,
        fetchTopics,
        invalidateTopicsCache,
    } = useStudentStore();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    // Khởi tạo là false nếu đã có sẵn dữ liệu trong bộ nhớ cache
    const [isLoading, setIsLoading] = useState(!capstone || topics.length === 0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const userId = useAuthStore((state) => state.userId);
    const isInitializing = useAuthStore((state) => state.isInitializing);

    // States cho Modal đăng ký
    const [activeRegisterTopic, setActiveRegisterTopic] = useState<Topic | null>(null);
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    const fetchTopicsData = async (page: number) => {
        try {
            if (topics.length === 0) {
                setIsLoading(true);
            }
            const params: any = {
                isAvailable: 'true',
                page,
                limit,
            };
            if (searchQuery.trim()) {
                params.title = searchQuery.trim();
            }
            await fetchTopics(params);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu đề tài:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load capstone initially
    useEffect(() => {
        if (!isInitializing && userId) {
            fetchCapstone(userId);
        }
    }, [userId, isInitializing]);

    // Cuộn lên đầu trang khi thay đổi trang phân trang
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentPage]);

    // Load topics when page or query changes
    useEffect(() => {
        if (!isInitializing && userId) {
            fetchTopicsData(currentPage);
        }
    }, [currentPage, searchQuery, userId, isInitializing]);

    const handleRegister = async (topicId: string, msg: string, file: File | null) => {
        if (!capstone?.capstone_id) {
            toast.error('Bạn chưa khởi tạo đồ án! Vui lòng quay lại trang chủ để đăng ký đồ án trước.');
            return;
        }
        if (!file) {
            toast.error('Vui lòng chọn file bảng điểm!');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Thực hiện upload file lên backend trước
            const uploadResult = await uploadFile(file);

            // 2. Sử dụng đường dẫn thực tế từ backend để lưu vào yêu cầu
            const res = await updatedCapstone(capstone.capstone_id, {
                topic_id: topicId,
                message: msg,
                file_path: uploadResult.file_path
            });
            toast.success('Gửi yêu cầu đăng ký đề tài thành công!');
            setCapstone(res);
            setActiveRegisterTopic(null);
            setSelectedFile(null);
            fetchTopicsData(currentPage);
        } catch (error: any) {
            console.error('Lỗi đăng ký đề tài:', error);
            toast.error(error.message || 'Đăng ký đề tài thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Kiểm tra trạng thái đăng ký đề tài
    const pendingTopicRequest = capstone?.requests?.find(
        (r: any) => r.request_type === 'REGISTER_TOPIC' && r.status === 'PENDING'
    );
    const hasConfirmedTopic = capstone?.topic_id !== null && capstone?.topic_id !== undefined;

    const [pendingTopic, setPendingTopic] = useState<Topic | null>(null);

    useEffect(() => {
        const fetchPendingTopic = async () => {
            if (pendingTopicRequest?.target_id) {
                try {
                    const data = await getTopicById(pendingTopicRequest.target_id);
                    setPendingTopic(data);
                } catch (e) {
                    console.error(e);
                }
            } else {
                setPendingTopic(null);
            }
        };
        fetchPendingTopic();
    }, [pendingTopicRequest?.target_id]);

    let displayTopics = [...topics];

    if (currentPage === 1) {
        if (hasConfirmedTopic && capstone?.topic) {
            const exists = topics.some((t) => String(t.topic_id) === String(capstone.topic_id));
            if (!exists) {
                displayTopics.unshift(capstone.topic);
            }
        }
        if (pendingTopicRequest && pendingTopic) {
            const exists = topics.some((t) => String(t.topic_id) === String(pendingTopic.topic_id));
            if (!exists) {
                displayTopics.unshift(pendingTopic);
            }
        }

        displayTopics.sort((a, b) => {
            const aSelected = hasConfirmedTopic && String(capstone?.topic_id) === String(a.topic_id);
            const bSelected = hasConfirmedTopic && String(capstone?.topic_id) === String(b.topic_id);
            const aPending = pendingTopicRequest && String(pendingTopicRequest.target_id) === String(a.topic_id);
            const bPending = pendingTopicRequest && String(pendingTopicRequest.target_id) === String(b.topic_id);

            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            if (aPending && !bPending) return -1;
            if (!aPending && bPending) return 1;
            return 0;
        });
    } else {
        if (hasConfirmedTopic) {
            displayTopics = displayTopics.filter((t) => String(t.topic_id) !== String(capstone.topic_id));
        }
        if (pendingTopicRequest) {
            displayTopics = displayTopics.filter((t) => String(t.topic_id) !== String(pendingTopicRequest.target_id));
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto p-4 animate-fadeIn">
            {/* CỘT TRÁI: DANH SÁCH ĐỀ TÀI ĐỂ ĐĂNG KÝ (DẠNG BẢNG & PHÂN TRANG) */}
            <div className="flex-1 flex flex-col gap-6">
                <div className="border-b border-gray-100 pb-4">
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">
                        Đăng ký đề tài tốt nghiệp
                    </h1>
                    <p className="text-xs text-gray-500 font-semibold mt-1">
                        Chọn và đăng ký đề tài trong ngân hàng đề tài được duyệt của Khoa
                    </p>
                </div>

                {/* Ô tìm kiếm */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm đề tài theo tên..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
                        }}
                        className="w-full px-5 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white placeholder-gray-400 font-medium"
                    />
                    <div className="absolute right-4 top-3.5 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Dạng Bảng Đề Tài */}
                {isLoading ? (
                    <div className="flex items-center justify-center min-h-[300px]">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                                        <th className="px-5 py-4 w-[40%]">Tên đề tài & mô tả</th>
                                        <th className="px-5 py-4 w-[15%]">Chuyên môn</th>
                                        <th className="px-5 py-4 w-[20%]">Công nghệ sử dụng</th>
                                        <th className="px-5 py-4 w-[15%]">Người đề xuất</th>
                                        <th className="px-5 py-4 w-[10%] text-center">Đăng ký</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700 text-xs font-medium">
                                    {displayTopics.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-16 text-gray-400 font-bold">
                                                Không tìm thấy đề tài nào khả dụng.
                                            </td>
                                        </tr>
                                    ) : (
                                        displayTopics.map((topic) => {
                                            const isSelected = hasConfirmedTopic && String(capstone?.topic_id) === String(topic.topic_id);
                                            const isPending = pendingTopicRequest && String(pendingTopicRequest.target_id) === String(topic.topic_id);

                                            return (
                                                <tr
                                                    key={topic.topic_id}
                                                    className={`hover:bg-slate-50/50 transition-colors align-middle ${
                                                        isSelected ? 'bg-blue-50/30' : isPending ? 'bg-amber-50/20' : ''
                                                    }`}
                                                >
                                                    {/* Title & Description */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-extrabold text-gray-900 text-sm leading-snug">
                                                                {topic.title}
                                                            </span>
                                                            <span className="text-[11px] text-gray-400 font-medium line-clamp-2">
                                                                {topic.description || 'Chưa có mô tả chi tiết cho đề tài này.'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Expertise */}
                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/50">
                                                            {topic.expertise?.name || '---'}
                                                        </span>
                                                    </td>

                                                    {/* Technologies */}
                                                    <td className="px-5 py-4 text-gray-600 font-semibold leading-relaxed">
                                                        {topic.technologies || '---'}
                                                    </td>

                                                    {/* Creator */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-900">{topic.creator?.fullname || '---'}</span>
                                                            <span className="text-[10px] text-gray-400 mt-0.5">{topic.creator?.role?.role_name === 'Lecturer' ? 'Giảng viên' : 'Sinh viên'}</span>
                                                        </div>
                                                    </td>

                                                    {/* Register Action */}
                                                    <td className="px-5 py-4 text-center">
                                                        <div className="relative group inline-block">
                                                            {!isSelected && !isPending && (hasConfirmedTopic || capstone?.status === 'CANCEL_REQUESTED') && (
                                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap z-10">
                                                                    {capstone?.status === 'CANCEL_REQUESTED'
                                                                        ? 'Hồ sơ đang yêu cầu hủy'
                                                                        : 'Bạn đã có đề tài chính thức'}
                                                                </span>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    setActiveRegisterTopic(topic);
                                                                    setMessage('');
                                                                    setSelectedFile(null);
                                                                }}
                                                                disabled={isSubmitting || isSelected || isPending || hasConfirmedTopic || capstone?.status === 'CANCEL_REQUESTED'}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                                                    isSelected
                                                                        ? 'bg-blue-50 text-blue-600 border border-blue-200 cursor-default font-black'
                                                                        : isPending
                                                                            ? 'bg-amber-50 text-amber-600 border border-amber-200 cursor-default font-black'
                                                                            : 'bg-[#2e7d32] hover:bg-[#205723] text-white disabled:bg-gray-200 disabled:text-gray-100 disabled:cursor-not-allowed'
                                                                }`}
                                                            >
                                                                {isSelected ? 'Đề tài của bạn' : isPending ? 'Chờ duyệt' : 'Đăng ký'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Phân Trang ở cuối bảng */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-100 bg-white px-5 py-4">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Trước
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="relative ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Sau
                                    </button>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">
                                            Hiển thị trang <span className="text-gray-900 font-bold">{currentPage}</span> / <span className="text-gray-900 font-bold">{totalPages}</span> (Tổng <span className="text-gray-900 font-bold">{totalItems}</span> đề tài)
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
                                            <button
                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`relative inline-flex items-center px-3 py-1.5 text-xs font-bold focus:z-20 ${
                                                            currentPage === pageNum
                                                                ? 'z-10 bg-blue-600 text-white ring-1 ring-blue-600 focus-visible:outline focus-visible:outline-2'
                                                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}

                                            <button
                                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
            </div>

            {/* CỘT PHẢI: TRẠNG THÁI HIỆN TẠI */}
            <div className="w-full lg:w-80 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col gap-5 sticky top-6">
                    <h2 className="text-sm font-bold text-gray-800 uppercase border-b border-gray-50 pb-3 tracking-wider">
                        Trạng thái đăng ký
                    </h2>

                    {!capstone ? (
                        <div className="p-4 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200 text-xs font-semibold leading-relaxed">
                            Bạn chưa khởi tạo hồ sơ đồ án. Hãy đăng nhập và ấn nút Đăng ký đồ án ở Trang chủ trước.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 text-xs font-semibold text-gray-600">
                            <div>
                                <span className="text-gray-400 block mb-1">Mã đồ án:</span>
                                <strong className="text-sm text-gray-900">#{capstone.capstone_id}</strong>
                            </div>

                            <div>
                                <span className="text-gray-400 block mb-1">Đề tài hiện tại:</span>
                                <strong className="text-sm text-gray-900 leading-snug block">
                                    {capstone.topic?.title || 'Chưa đăng ký đề tài'}
                                </strong>
                            </div>

                            <div>
                                <span className="text-gray-400 block mb-1">Trạng thái hồ sơ:</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                    {capstone.status}
                                </span>
                            </div>

                            {pendingTopicRequest && (
                                <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200 leading-relaxed font-semibold mt-2">
                                    Yêu cầu đề tài đang chờ phê duyệt.
                                </div>
                            )}

                            {capstone.status === 'CANCEL_REQUESTED' && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-2xl border border-red-200 leading-relaxed font-semibold mt-2">
                                    Hồ sơ đang yêu cầu hủy. Không thể đăng ký đề tài mới lúc này.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* POPUP MODAL ĐĂNG KÝ ĐỀ TÀI */}
            {activeRegisterTopic && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleRegister(activeRegisterTopic.topic_id, message, selectedFile);
                        }}
                        className="bg-[#f7f8fc] rounded-[32px] shadow-2xl overflow-hidden max-w-lg w-full border border-gray-100 flex flex-col animate-scaleUp"
                    >
                        <div className="bg-gradient-to-r from-[#5865f2] to-[#404eed] p-6 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">
                                    Đăng ký Đề tài
                                </h3>
                                <p className="text-[11px] opacity-90 font-semibold mt-0.5">
                                    Đề tài: {activeRegisterTopic.title}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveRegisterTopic(null)}
                                className="text-white hover:text-gray-200 transition-colors focus:outline-none"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 flex flex-col gap-5">
                            {/* Ô Lời nhắn */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    Lời nhắn gửi Khoa / Giảng viên
                                </label>
                                <textarea
                                    required
                                    placeholder="Viết lời nhắn gửi hội đồng xét duyệt đề tài (VD: lý do chọn đề tài, sự chuẩn bị...)"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#5865f2]/20 bg-white placeholder-gray-400 font-medium"
                                />
                            </div>

                            {/* Ô Bảng điểm */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    Chọn file bảng điểm (PDF, Ảnh...)
                                </label>
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setSelectedFile(e.target.files[0]);
                                        }
                                    }}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-200 rounded-xl p-2 bg-white"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setActiveRegisterTopic(null)}
                                className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2.5 bg-[#2e7d32] hover:bg-[#205723] text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
