"use client"

import React, { useEffect, useState } from 'react';
import { updatedCapstone, uploadFile } from '@/services/capstone.service';
import { getUserById, getUserList } from '@/services/user.service';
import { useCapstoneStore } from '@/store/useCapstoneStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Lecturer } from '@/type/lecturer';

import { useStudentStore } from '@/store/useStudentStore';

export default function RegisterLecturerPage() {
    const { capstone, fetchCapstone, setCapstone } = useCapstoneStore();
    const {
        lecturers,
        lecturersTotalItems: totalItems,
        lecturersTotalPages: totalPages,
        fetchLecturers,
        invalidateLecturersCache,
    } = useStudentStore();

    const [searchQuery, setSearchQuery] = useState('');
    // Khởi tạo là false nếu đã có sẵn dữ liệu trong bộ nhớ cache
    const [isLoading, setIsLoading] = useState(!capstone || lecturers.length === 0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const userId = useAuthStore((state) => state.userId);
    const isInitializing = useAuthStore((state) => state.isInitializing);

    // States cho Modal đăng ký
    const [activeRegisterLecturer, setActiveRegisterLecturer] = useState<any | null>(null);
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
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

    const fetchLecturersData = async (page: number) => {
        try {
            if (lecturers.length === 0) {
                setIsLoading(true);
            }
            const params: any = {
                role: 'Lecturer',
                page,
                limit,
            };
            if (searchQuery.trim()) {
                params.fullname = searchQuery.trim();
            }
            await fetchLecturers(params);
        } catch (error) {
            console.error('Lỗi khi tải danh sách giảng viên:', error);
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

    // Load lecturers when page or search query changes
    useEffect(() => {
        if (!isInitializing && userId) {
            fetchLecturersData(currentPage);
        }
    }, [currentPage, searchQuery, userId, isInitializing]);

    const handleRegister = async (lecturerId: string, msg: string, file: File | null) => {
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

            // 2. Sử dụng đường dẫn thực tế từ backend trả về để lưu vào yêu cầu đăng ký
            const res = await updatedCapstone(capstone.capstone_id, {
                lecturer_id: lecturerId,
                message: msg,
                file_path: uploadResult.file_path
            });
            toast.success('Gửi yêu cầu đăng ký giảng viên hướng dẫn thành công!');
            setCapstone(res);
            setActiveRegisterLecturer(null);
            setSelectedFile(null);
            fetchLecturersData(currentPage);
        } catch (error: any) {
            console.error('Lỗi đăng ký giảng viên:', error);
            toast.error(error.message || 'Đăng ký giảng viên thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Kiểm tra trạng thái đăng ký giảng viên hướng dẫn
    const pendingLecturerRequest = capstone?.requests?.find(
        (r: any) => r.request_type === 'REGISTER_LECTURER' && r.status === 'PENDING'
    );
    const hasConfirmedLecturer = capstone?.lecturer_id !== null && capstone?.lecturer_id !== undefined;

    const [pendingLecturer, setPendingLecturer] = useState<Lecturer | null>(null);

    useEffect(() => {
        const fetchPendingLecturer = async () => {
            if (pendingLecturerRequest?.target_id) {
                try {
                    const data = await getUserById(pendingLecturerRequest.target_id);
                    setPendingLecturer(data);
                } catch (e) {
                    console.error(e);
                }
            } else {
                setPendingLecturer(null);
            }
        };
        fetchPendingLecturer();
    }, [pendingLecturerRequest?.target_id]);

    let displayLecturers = [...lecturers];

    if (currentPage === 1) {
        if (hasConfirmedLecturer && capstone?.lecturer) {
            const exists = lecturers.some((l) => String(l.user_id) === String(capstone.lecturer_id));
            if (!exists) {
                displayLecturers.unshift(capstone.lecturer);
            }
        }
        if (pendingLecturerRequest && pendingLecturer) {
            const exists = lecturers.some((l) => String(l.user_id) === String(pendingLecturer.user_id));
            if (!exists) {
                displayLecturers.unshift(pendingLecturer);
            }
        }

        displayLecturers.sort((a, b) => {
            const aSelected = hasConfirmedLecturer && String(capstone?.lecturer_id) === String(a.user_id);
            const bSelected = hasConfirmedLecturer && String(capstone?.lecturer_id) === String(b.user_id);
            const aPending = pendingLecturerRequest && String(pendingLecturerRequest.target_id) === String(a.user_id);
            const bPending = pendingLecturerRequest && String(pendingLecturerRequest.target_id) === String(b.user_id);

            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            if (aPending && !bPending) return -1;
            if (!aPending && bPending) return 1;
            return 0;
        });
    } else {
        if (hasConfirmedLecturer) {
            displayLecturers = displayLecturers.filter((l) => String(l.user_id) !== String(capstone.lecturer_id));
        }
        if (pendingLecturerRequest) {
            displayLecturers = displayLecturers.filter((l) => String(l.user_id) !== String(pendingLecturerRequest.target_id));
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto p-4 animate-fadeIn">
            {/* CỘT TRÁI: DANH SÁCH GIẢNG VIÊN ĐỂ ĐĂNG KÝ */}
            <div className="flex-1 flex flex-col gap-6">
                <div className="border-b border-gray-100 pb-4">
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">
                        Đăng ký giảng viên hướng dẫn
                    </h1>
                    <p className="text-xs text-gray-500 font-semibold mt-1">
                        Chọn và đăng ký giảng viên để nhận sự hướng dẫn khoa học cho đồ án của bạn
                    </p>
                </div>

                {/* Ô tìm kiếm */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm giảng viên theo tên hoặc mã giảng viên..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1); // Reset về trang 1 khi gõ tìm kiếm
                        }}
                        className="w-full px-5 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white placeholder-gray-400 font-medium"
                    />
                    <div className="absolute right-4 top-3.5 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Bảng danh sách giảng viên */}
                {isLoading ? (
                    <div className="flex items-center justify-center min-h-[300px]">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs font-medium">
                                <thead>
                                    <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4">Mã GV</th>
                                        <th className="px-6 py-4">Họ và tên</th>
                                        <th className="px-6 py-4">Email liên hệ</th>
                                        <th className="px-6 py-4 text-center w-40">Đăng ký</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {displayLecturers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-16 text-gray-400 font-bold bg-white">
                                                Không tìm thấy giảng viên nào phù hợp.
                                            </td>
                                        </tr>
                                    ) : (
                                        displayLecturers.map((lecturer) => {
                                            const isSelected = hasConfirmedLecturer && String(capstone?.lecturer_id) === String(lecturer.user_id);
                                            const isPending = pendingLecturerRequest && String(pendingLecturerRequest.target_id) === String(lecturer.user_id);

                                            return (
                                                <tr
                                                    key={lecturer.user_id}
                                                    className={`hover:bg-slate-50/50 transition-colors align-middle ${isSelected ? 'bg-blue-50/30' : isPending ? 'bg-amber-50/20' : ''
                                                        }`}
                                                >
                                                    <td className="px-6 py-4 font-bold text-gray-900">{lecturer.usercode}</td>
                                                    <td className="px-6 py-4 font-bold text-gray-900">{lecturer.fullname}</td>
                                                    <td className="px-6 py-4 text-gray-500 font-semibold">{lecturer.email}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="relative group inline-block">
                                                            {/* Tooltip khi bị vô hiệu hoá */}
                                                            {!isSelected && !isPending && (hasConfirmedLecturer || capstone?.status === 'CANCEL_REQUESTED') && (
                                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap z-10">
                                                                    {capstone?.status === 'CANCEL_REQUESTED'
                                                                        ? 'Hồ sơ đang yêu cầu hủy'
                                                                        : 'Bạn đã có GVHD chính thức'}
                                                                </span>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    setActiveRegisterLecturer(lecturer);
                                                                    setMessage('');
                                                                    setSelectedFile(null);
                                                                }}
                                                                disabled={isSubmitting || isSelected || isPending || hasConfirmedLecturer || capstone?.status === 'CANCEL_REQUESTED'}
                                                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${isSelected
                                                                    ? 'bg-blue-50 text-blue-600 border border-blue-200 cursor-default font-black'
                                                                    : isPending
                                                                        ? 'bg-amber-50 text-amber-600 border border-amber-200 cursor-default font-black'
                                                                        : 'bg-[#2e7d32] hover:bg-[#205723] text-white disabled:bg-gray-200 disabled:text-gray-100 disabled:cursor-not-allowed'
                                                                    }`}
                                                            >
                                                                {isSelected ? 'GVHD hiện tại' : isPending ? 'Chờ duyệt' : 'Đăng ký'}
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
                                            Hiển thị trang <span className="text-gray-900 font-bold">{currentPage}</span> / <span className="text-gray-900 font-bold">{totalPages}</span> (Tổng <span className="text-gray-900 font-bold">{totalItems}</span> giảng viên)
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
                                                        className={`relative inline-flex items-center px-3 py-1.5 text-xs font-bold focus:z-20 ${currentPage === pageNum
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
                                <span className="text-gray-400 block mb-1">Giảng viên hướng dẫn:</span>
                                <strong className="text-sm text-gray-900 leading-snug block">
                                    {capstone.lecturer?.fullname || 'Chưa đăng ký giảng viên'}
                                </strong>
                            </div>

                            <div>
                                <span className="text-gray-400 block mb-1">Trạng thái hồ sơ:</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                    {capstone.status}
                                </span>
                            </div>

                            {pendingLecturerRequest && (
                                <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200 leading-relaxed font-semibold mt-2">
                                    Yêu cầu đăng ký GVHD đang chờ phê duyệt.
                                </div>
                            )}

                            {capstone.status === 'CANCEL_REQUESTED' && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-2xl border border-red-200 leading-relaxed font-semibold mt-2">
                                    Hồ sơ đang yêu cầu hủy. Không thể đăng ký giảng viên mới lúc này.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* POPUP MODAL ĐĂNG KÝ GIẢNG VIÊN */}
            {activeRegisterLecturer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleRegister(activeRegisterLecturer.user_id, message, selectedFile);
                        }}
                        className="bg-[#f7f8fc] rounded-[32px] shadow-2xl overflow-hidden max-w-lg w-full border border-gray-100 flex flex-col animate-scaleUp"
                    >
                        <div className="bg-gradient-to-r from-[#5865f2] to-[#404eed] p-6 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">
                                    Đăng ký Giảng viên Hướng dẫn
                                </h3>
                                <p className="text-[11px] opacity-90 font-semibold mt-0.5">
                                    Giảng viên: {activeRegisterLecturer.fullname} ({activeRegisterLecturer.usercode})
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveRegisterLecturer(null)}
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
                                    Lời nhắn gửi Giảng viên
                                </label>
                                <textarea
                                    required
                                    placeholder="Viết lời nhắn bày tỏ mong muốn được thầy/cô hướng dẫn..."
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
                                onClick={() => setActiveRegisterLecturer(null)}
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
