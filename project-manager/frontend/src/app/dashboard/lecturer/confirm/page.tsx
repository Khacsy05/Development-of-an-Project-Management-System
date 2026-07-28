'use client';

import { getCapstoneRequest, updateCapstoneRequest } from '@/services/capstone.service';
import { useAuthStore } from '@/store/useAuthStore';
import { CapstoneRequestStatus } from '@/type/capstone';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { GetCapstoneRequestDto } from '@/type/capstone';

export default function CapstonesPage() {
    const [capstoneRequests, setCapstoneRequests] = useState<GetCapstoneRequestDto[]>([]);
    const userId = useAuthStore((state) => state.userId);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 3;

    // State cho Modal chi tiết
    const [selectedRequest, setSelectedRequest] = useState<GetCapstoneRequestDto | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchCapstoneRequest = async (page: number) => {
        try {
            const result = await getCapstoneRequest({
                status: CapstoneRequestStatus.PENDING,
                target_id: userId ?? undefined,
                request_type: "REGISTER_LECTURER",
                page,
                limit,
            });
            setCapstoneRequests(result.data);
            setCurrentPage(result.pagination.page);
            setTotalPages(result.pagination.totalPages);
            setTotalItems(result.pagination.total);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu yêu cầu:", error);
        }
    }

    useEffect(() => {
        if (userId) {
            fetchCapstoneRequest(currentPage);
        }
    }, [userId, currentPage]);


    const handleAcceptRequest = async (id: string) => {
        setIsSubmitting(true);
        try {
            await updateCapstoneRequest(id, {
                status: CapstoneRequestStatus.APPROVED,
                feedback: feedback.trim() || undefined,
            });
            toast.success("Đã đồng ý hướng dẫn sinh viên");
            setSelectedRequest(null);
            setFeedback('');
            fetchCapstoneRequest(currentPage);
        } catch (error) {
            console.error("Lỗi khi chấp nhận yêu cầu:", error);
            toast.error("Không thể xác nhận yêu cầu");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleRejectRequest = async (id: string) => {
        setIsSubmitting(true);
        try {
            await updateCapstoneRequest(id, {
                status: CapstoneRequestStatus.REJECTED,
                feedback: feedback.trim() || undefined,
            });
            toast.success("Đã từ chối hướng dẫn sinh viên");
            setSelectedRequest(null);
            setFeedback('');
            fetchCapstoneRequest(currentPage);
        } catch (error) {
            console.error("Lỗi khi từ chối yêu cầu:", error);
            toast.error("Không thể từ chối yêu cầu");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

            {/* HEADER CỦA BẢNG */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight uppercase flex items-center gap-2.5">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block"></span>
                    Yêu cầu hướng dẫn
                </h2>

            </div>

            {/* BẢNG HIỂN THỊ DỮ LIỆU */}
            <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                            <th className="px-6 py-4 text-center w-16">STT</th>
                            <th className="px-6 py-4 w-28">Mã sinh viên</th>
                            <th className="px-6 py-4">Họ tên sinh viên</th>
                            <th className="px-6 py-4">Lớp</th>
                            <th className="px-6 py-4 w-36">Trạng thái</th>
                            <th className="px-6 py-4 text-center w-24">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                        {capstoneRequests.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-400">
                                    Không có yêu cầu hướng dẫn nào đang chờ duyệt.
                                </td>
                            </tr>
                        ) : (
                            capstoneRequests.map((request, index) => (
                                <tr key={request.request_id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-center font-medium text-gray-400">
                                        {(currentPage - 1) * limit + index + 1}
                                    </td>
                                    <td className="px-6 py-4 font-mono font-semibold text-blue-600">{request.student.student_code}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{request.student.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{request.student.class_name}</td>

                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${request.status === 'PENDING'
                                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                            : 'bg-green-50 text-green-600 border border-green-100'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${request.status === 'PENDING' ? 'bg-blue-500' : 'bg-green-500'
                                                }`}></span>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2.5">
                                            {/* Nút Xem chi tiết */}
                                            <button
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setFeedback(request.feedback || '');
                                                }}
                                                className="p-2 text-[#3b4c80] hover:bg-blue-50 rounded-xl transition-all"
                                                title="Xem chi tiết yêu cầu"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

            {/* PHÂN TRANG Ở DƯỚI BẢNG */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Previous
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${currentPage === page
                                    ? 'bg-blue-50 text-blue-600 border border-blue-100 font-bold'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            )}

            {/* MODAL CHI TIẾT YÊU CẦU HƯỚNG DẪN */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-[#f7f8fc] rounded-[32px] shadow-2xl overflow-hidden max-w-2xl w-full border border-gray-100 flex flex-col max-h-[90vh]">
                        
                        {/* Header Modal */}
                        <div className="flex items-center justify-between bg-[#5865f2] text-white">
                            <h3 className="text-[17px] font-bold uppercase tracking-wider pl-8 py-5">
                                Chi tiết yêu cầu hướng dẫn
                            </h3>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="w-16 h-16 flex items-center justify-center bg-red-600 hover:bg-red-700 transition-colors font-bold text-2xl text-white"
                                title="Đóng"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-8 overflow-y-auto flex-1 flex flex-col gap-6">
                            
                            {/* Card thông tin chi tiết */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col gap-5">
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-[10px] font-bold text-[#8d9299] tracking-wider uppercase mb-1">Mã sinh viên</h4>
                                        <p className="text-sm font-bold text-gray-900">{selectedRequest.student.student_code}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-bold text-[#8d9299] tracking-wider uppercase mb-1">Họ tên & Lớp</h4>
                                        <p className="text-sm font-bold text-gray-900">
                                            {selectedRequest.student.name} - {selectedRequest.student.class_name}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-bold text-[#8d9299] tracking-wider uppercase mb-1">Đề tài hướng dẫn (nếu có)</h4>
                                    <p className="text-sm font-bold text-gray-900 leading-relaxed">
                                        {selectedRequest.topic_title || 'Chưa đăng ký đề tài (Sinh viên tự đề xuất sau)'}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-bold text-[#8d9299] tracking-wider uppercase mb-1">Lời nhắn từ sinh viên</h4>
                                    <p className="text-sm font-bold text-gray-900 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        {selectedRequest.message || 'Không có lời nhắn'}
                                    </p>
                                </div>

                            </div>

                            {/* Trường Nhận xét */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-700">
                                    Nhận xét / Lý do từ chối (Gửi cho sinh viên):
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Nhập nhận xét chi tiết cho sinh viên tại đây..."
                                    rows={4}
                                    className="w-full p-4 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white text-sm text-gray-800 transition-all placeholder-gray-400"
                                />
                            </div>

                        </div>

                        {/* Footer Modal */}
                        <div className="px-8 py-5 bg-white border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                onClick={() => handleRejectRequest(selectedRequest.request_id)}
                                disabled={isSubmitting}
                                className="px-6 py-3 border border-red-500 text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-xs transition-colors"
                            >
                                Từ chối
                            </button>
                            <button
                                onClick={() => handleAcceptRequest(selectedRequest.request_id)}
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-[#5865f2] hover:bg-[#4652c7] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/10 transition-colors"
                            >
                                Nhận hướng dẫn
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}