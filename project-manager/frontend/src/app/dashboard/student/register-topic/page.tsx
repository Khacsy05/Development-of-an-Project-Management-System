"use client"

import React, { useEffect, useState } from 'react';
import { updatedCapstone, uploadFile } from '@/services/capstone.service';
import { getTopicList } from '@/services/topic.service';
import { useCapstoneStore } from '@/store/useCapstoneStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Topic } from '@/type/topic';

export default function RegisterTopicPage() {
    const { capstone, fetchCapstone, setCapstone } = useCapstoneStore();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const userId = useAuthStore((state) => state.userId);

    // States cho Modal đăng ký
    const [activeRegisterTopic, setActiveRegisterTopic] = useState<Topic | null>(null);
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchData = async () => {
        if (!userId) return;
        try {
            setIsLoading(true);
            await fetchCapstone(userId);
            const topicsData = await getTopicList({ isAvailable: 'true' });
            setTopics(topicsData.data || []);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu đề tài:', error);
            toast.error('Không thể tải danh sách đề tài');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userId]);

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
    const hasAnyActiveTopicState = hasConfirmedTopic || !!pendingTopicRequest;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Lọc đề tài theo ô tìm kiếm
    const filteredTopics = topics.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto p-4 animate-fadeIn">

            {/* CỘT TRÁI: DANH SÁCH ĐỀ TÀI ĐỂ ĐĂNG KÝ */}
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
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-5 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white placeholder-gray-400 font-medium"
                    />
                    <div className="absolute right-4 top-3.5 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Danh sách đề tài */}
                <div className="flex flex-col gap-4">
                    {filteredTopics.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 font-medium bg-white rounded-[24px] border border-gray-100 shadow-sm">
                            Không tìm thấy đề tài nào khả dụng.
                        </div>
                    ) : (
                        filteredTopics.map((topic) => {
                            const isSelected = hasConfirmedTopic && String(capstone?.topic_id) === String(topic.topic_id);
                            const isPending = pendingTopicRequest && String(pendingTopicRequest.target_id) === String(topic.topic_id);

                            return (
                                <div
                                    key={topic.topic_id}
                                    className={`bg-white p-6 rounded-[24px] border transition-all flex flex-col gap-4 shadow-sm ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/10' : isPending ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 w-fit">
                                                {topic.expertise?.name || 'Lĩnh vực chuyên môn'}
                                            </span>
                                            <h3 className="text-base font-bold text-gray-900 mt-1 leading-snug">
                                                {topic.title}
                                            </h3>
                                        </div>

                                        <div className="relative group">
                                            {/* Tooltip khi bị vô hiệu hoá */}
                                            {!isSelected && !isPending && (hasConfirmedTopic || capstone?.status === 'CANCEL_REQUESTED') && (
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
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
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${isSelected
                                                    ? 'bg-blue-50 text-blue-600 border border-blue-200 cursor-default font-black'
                                                    : isPending
                                                        ? 'bg-amber-50 text-amber-600 border border-amber-200 cursor-default font-black'
                                                        : 'bg-[#2e7d32] hover:bg-[#205723] text-white disabled:bg-gray-300 disabled:text-gray-100 disabled:cursor-not-allowed'
                                                    }`}
                                            >
                                                {isSelected ? 'Đề tài hiện tại' : isPending ? 'Chờ duyệt' : 'Đăng ký đề tài'}
                                            </button>
                                        </div>
                                    </div>

                                    {topic.description && (
                                        <p className="text-sm text-gray-600 font-medium leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                                            {topic.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-500 items-center justify-between border-t border-gray-50 pt-3">
                                        <div>
                                            Công nghệ sử dụng: <strong className="text-gray-700">{topic.technologies}</strong>
                                        </div>
                                        {topic.creator && (
                                            <div>
                                                Người đề xuất: <strong className="text-gray-700">{topic.creator.fullname}</strong>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
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
