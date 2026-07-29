"use client"

import React, { useEffect, useState } from 'react';
import { updatedCapstone, uploadFile } from '@/services/capstone.service';
import { getLecturerList } from '@/services/lecturer.service';
import { useCapstoneStore } from '@/store/useCapstoneStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Lecturer } from '@/type/lecturer';

export default function RegisterLecturerPage() {
    const { capstone, fetchCapstone, setCapstone } = useCapstoneStore();
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const userId = useAuthStore((state) => state.userId);

    // States cho Modal đăng ký
    const [activeRegisterLecturer, setActiveRegisterLecturer] = useState<Lecturer | null>(null);
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchData = async () => {
        if (!userId) return;
        try {
            setIsLoading(true);
            await fetchCapstone(userId);
            const lecturersData = await getLecturerList({ limit: 100 });
            setLecturers(lecturersData.data || []);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu giảng viên:', error);
            toast.error('Không thể tải danh sách giảng viên');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userId]);

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
    const hasAnyActiveLecturerState = hasConfirmedLecturer || !!pendingLecturerRequest;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Lọc danh sách giảng viên theo tên
    const filteredLecturers = lecturers.filter((l) =>
        l.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.usercode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto p-4 animate-fadeIn">

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
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-5 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white placeholder-gray-400 font-medium"
                    />
                    <div className="absolute right-4 top-3.5 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Bảng danh sách giảng viên */}
                <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-bold">
                                    <th className="px-6 py-4">Mã GV</th>
                                    <th className="px-6 py-4">Họ và tên</th>
                                    <th className="px-6 py-4">Email liên hệ</th>
                                    <th className="px-6 py-4 text-center w-40">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {filteredLecturers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 text-gray-400 font-medium bg-white">
                                            Không tìm thấy giảng viên nào phù hợp.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLecturers.map((lecturer) => {
                                        const isSelected = hasConfirmedLecturer && String(capstone?.lecturer_id) === String(lecturer.user_id);
                                        const isPending = pendingLecturerRequest && String(pendingLecturerRequest.target_id) === String(lecturer.user_id);

                                        return (
                                            <tr key={lecturer.user_id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-900">{lecturer.usercode}</td>
                                                <td className="px-6 py-4 font-semibold text-gray-900">{lecturer.fullname}</td>
                                                <td className="px-6 py-4 text-gray-500 font-medium">{lecturer.email}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="relative group">
                                                        {/* Tooltip khi bị vô hiệu hoá */}
                                                        {!isSelected && !isPending && (hasConfirmedLecturer || capstone?.status === 'CANCEL_REQUESTED') && (
                                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
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
                                                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${isSelected
                                                                ? 'bg-blue-50 text-blue-600 border border-blue-200 cursor-default font-black'
                                                                : isPending
                                                                    ? 'bg-amber-50 text-amber-600 border border-amber-200 cursor-default font-black'
                                                                    : 'bg-[#2e7d32] hover:bg-[#205723] text-white disabled:bg-gray-300 disabled:text-gray-100 disabled:cursor-not-allowed'
                                                                }`}
                                                        >
                                                            {isSelected ? 'GVHD hiện tại' : isPending ? 'Chờ duyệt' : 'Đăng ký GV'}
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
                </div>
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
                                <span className="text-gray-400 block mb-1">Giảng viên hướng dẫn hiện tại:</span>
                                <strong className="text-sm text-[#2e7d32] leading-snug block">
                                    {capstone.lecturer?.fullname || 'Chưa đăng ký GVHD'}
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
                                    Yêu cầu GVHD đang chờ phê duyệt.
                                </div>
                            )}

                            {capstone.status === 'CANCEL_REQUESTED' && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-2xl border border-red-200 leading-relaxed font-semibold mt-2">
                                    Hồ sơ đang yêu cầu hủy. Không thể chọn giảng viên mới lúc này.
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
                                    Đăng ký Hướng dẫn
                                </h3>
                                <p className="text-[11px] opacity-90 font-semibold mt-0.5">
                                    Giảng viên: {activeRegisterLecturer.fullname}
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
                                    Lời nhắn gửi giảng viên
                                </label>
                                <textarea
                                    required
                                    placeholder="Viết lời nhắn gửi thầy/cô (VD: lý do chọn đề tài, nguyện vọng học tập...)"
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
