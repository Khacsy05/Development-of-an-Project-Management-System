"use client"

import React, { useEffect, useState } from 'react';
import { getCapstoneSubmissions, updateCapstoneSubmission } from '@/services/capstone.service';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export default function LecturerReportsPage() {
    const userId = useAuthStore((state) => state.userId);
    const [capstones, setCapstones] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal state for reviewing progress report
    const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
    const [lecturerNote, setLecturerNote] = useState('');
    const [status, setStatus] = useState<'PASSED' | 'FAILED'>('PASSED');

    const fetchReports = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            // Lấy trực tiếp danh sách các bài nộp tiến độ từ backend
            const res = await getCapstoneSubmissions({ lecturer_id: userId, milestone_type: 'progress' });
            const submissions = Array.isArray(res) ? res : (res?.data || []);

            // Nhóm các bài nộp theo từng đồ án/sinh viên để hiển thị trực quan
            const groupedMap: { [key: string]: any } = {};
            submissions.forEach((sub: any) => {
                const capId = sub.capstone_id;
                if (!groupedMap[capId] && sub.capstone) {
                    groupedMap[capId] = {
                        ...sub.capstone,
                        submission: []
                    };
                }
                if (groupedMap[capId]) {
                    groupedMap[capId].submission.push(sub);
                }
            });

            setCapstones(Object.values(groupedMap));
        } catch (error) {
            console.error('Lỗi khi tải báo cáo:', error);
            toast.error('Không thể tải danh sách báo cáo đồ án');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [userId]);

    const handleSaveReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubmission) return;

        setIsSubmitting(true);
        try {
            await updateCapstoneSubmission(selectedSubmission.submission_id, {
                status,
                lecturer_note: lecturerNote.trim() || undefined,
            } as any);
            toast.success('Đánh giá tiến độ thành công!');
            setSelectedSubmission(null);
            fetchReports();
        } catch (error: any) {
            console.error('Lỗi khi đánh giá:', error);
            toast.error(error.message || 'Đánh giá báo cáo thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 flex flex-col gap-6 animate-fadeIn">
            <div className="border-b border-gray-100 pb-4">
                <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">
                    Quản lý báo cáo tiến độ đồ án
                </h1>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                    Theo dõi và đánh giá 3 giai đoạn nộp báo cáo tiến độ đầu tiên của sinh viên (Chỉ hiển thị sinh viên đã nộp bài)
                </p>
            </div>

            {capstones.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-400 font-semibold shadow-sm">
                    Hiện chưa có sinh viên nào nộp báo cáo tiến độ (Giai đoạn 1, 2, 3).
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {capstones.map((capstone) => {
                        const progressSubmissions = capstone.submission
                            ?.sort((a: any, b: any) => Number(a.milestone_id) - Number(b.milestone_id)) || [];

                        return (
                            <div key={capstone.capstone_id} className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm flex flex-col gap-5 hover:shadow-md transition-shadow">
                                {/* Student & Topic info header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-50 pb-4">
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 leading-snug">
                                            {capstone.topic?.title || 'Chưa đăng ký đề tài'}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-semibold mt-1">
                                            Sinh viên: <span className="text-blue-600 font-mono">#{capstone.student?.user?.usercode}</span> - <span className="text-gray-700">{capstone.student?.user?.fullname}</span>
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                        {capstone.status}
                                    </span>
                                </div>

                                {/* Progress Milestone Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {progressSubmissions.map((sub: any) => {
                                        const fileUrl = sub.file_path
                                            ? (sub.file_path.startsWith('http')
                                                ? sub.file_path
                                                : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace('/api', '') + sub.file_path)
                                            : null;

                                        return (
                                            <div key={sub.submission_id} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                                            {sub.milestone?.phase_name || `Giai đoạn ${sub.milestone_id}`}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${sub.status === 'PASSED'
                                                            ? 'bg-green-50 text-green-600 border border-green-100'
                                                            : sub.status === 'FAILED'
                                                                ? 'bg-red-50 text-red-600 border border-red-100'
                                                                : sub.file_path
                                                                    ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
                                                                    : 'bg-gray-100 text-gray-400'
                                                            }`}>
                                                            {sub.status === 'PENDING' && sub.file_path ? 'Chờ duyệt' : sub.status}
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 flex flex-col gap-1.5 text-xs text-gray-600">
                                                        {fileUrl ? (
                                                            <a
                                                                href={fileUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="flex items-center gap-1.5 text-blue-600 font-bold hover:underline"
                                                            >
                                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                Tải file nộp bài
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400 italic">Chưa nộp file báo cáo</span>
                                                        )}

                                                        {sub.student_note && (
                                                            <p className="mt-2 bg-white/60 p-2 rounded-lg border border-gray-100/60 leading-relaxed text-[11px]">
                                                                <strong className="text-[10px] text-gray-400 block mb-0.5">Sinh viên viết:</strong>
                                                                {sub.student_note}
                                                            </p>
                                                        )}

                                                        {sub.lecturer_note && (
                                                            <p className="mt-1 bg-blue-50/30 p-2 rounded-lg border border-blue-100/30 leading-relaxed text-[11px]">
                                                                <strong className="text-[10px] text-blue-500 block mb-0.5">GV nhận xét:</strong>
                                                                {sub.lecturer_note}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {sub.file_path && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSubmission(sub);
                                                            setLecturerNote(sub.lecturer_note || '');
                                                            setStatus(sub.status === 'FAILED' ? 'FAILED' : 'PASSED');
                                                        }}
                                                        className="mt-3 w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-colors border border-blue-100"
                                                    >
                                                        Đánh giá báo cáo
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* REVIEW REPORT MODAL */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <form
                        onSubmit={handleSaveReview}
                        className="bg-[#f7f8fc] rounded-[32px] shadow-2xl overflow-hidden max-w-lg w-full border border-gray-100 flex flex-col animate-scaleUp"
                    >
                        <div className="bg-gradient-to-r from-[#5865f2] to-[#404eed] p-6 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">
                                    Đánh giá Tiến độ
                                </h3>
                                <p className="text-[11px] opacity-90 font-semibold mt-0.5">
                                    {selectedSubmission.milestone?.phase_name || 'Báo cáo tiến độ'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedSubmission(null)}
                                className="text-white hover:text-gray-200 transition-colors focus:outline-none"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 flex flex-col gap-5">
                            {/* Chọn trạng thái */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    Trạng thái đánh giá
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStatus('PASSED')}
                                        className={`py-3 rounded-2xl text-xs font-bold transition-all border ${status === 'PASSED'
                                            ? 'bg-green-50 text-green-600 border-green-200 shadow-sm'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        ĐẠT (PASSED)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatus('FAILED')}
                                        className={`py-3 rounded-2xl text-xs font-bold transition-all border ${status === 'FAILED'
                                            ? 'bg-red-50 text-red-600 border-red-200 shadow-sm'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        CHƯA ĐẠT (FAILED)
                                    </button>
                                </div>
                            </div>

                            {/* Ô Nhận xét */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    Lời nhận xét / Ghi chú của giảng viên
                                </label>
                                <textarea
                                    placeholder="Viết nhận xét chi tiết hướng dẫn sinh viên cải thiện đồ án..."
                                    value={lecturerNote}
                                    onChange={(e) => setLecturerNote(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#5865f2]/20 bg-white placeholder-gray-400 font-medium"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedSubmission(null)}
                                className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2.5 bg-[#2e7d32] hover:bg-[#205723] text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Đang lưu...' : 'Lưu đánh giá'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}