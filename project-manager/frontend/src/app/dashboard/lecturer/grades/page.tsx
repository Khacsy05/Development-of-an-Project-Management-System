"use client"

import React, { useEffect, useState } from 'react';
import { getCapstoneSubmissions, updateCapstoneSubmission } from '@/services/capstone.service';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

import { useCacheStore } from '@/store/useCacheStore';

export default function LecturerGradesPage() {
    const userId = useAuthStore((state) => state.userId);
    const { grades, setGrades } = useCacheStore();
    const [submissions, setSubmissions] = useState<any[]>(grades || []);
    const [isLoading, setIsLoading] = useState(!grades);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal state for grading final report
    const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
    const [grade, setGrade] = useState<string>('');
    const [lecturerNote, setLecturerNote] = useState('');
    const [status, setStatus] = useState<'PASSED' | 'FAILED'>('PASSED');

    const fetchGrades = async () => {
        if (!userId) return;
        if (!grades) {
            setIsLoading(true);
        }
        try {
            // Lấy trực tiếp danh sách bài nộp cuối kỳ (Milestone 4) từ backend
            const res = await getCapstoneSubmissions({ lecturer_id: userId, milestone_type: 'final', limit: 100 });
            const finalSubmissions = Array.isArray(res) ? res : (res?.data || []);
            setSubmissions(finalSubmissions);
            setGrades(finalSubmissions);
        } catch (error) {
            console.error('Lỗi khi tải danh sách chấm điểm:', error);
            toast.error('Không thể tải danh sách chấm điểm đồ án');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchGrades();
        }
    }, [userId]);

    const handleSaveGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubmission) return;

        const gradeNum = parseFloat(grade);
        if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 10) {
            toast.error('Điểm hướng dẫn phải là số từ 0 đến 10!');
            return;
        }

        setIsSubmitting(true);
        try {
            await updateCapstoneSubmission(selectedSubmission.submission_id, {
                status,
                grade: gradeNum,
                lecturer_note: lecturerNote.trim() || undefined,
            } as any);
            toast.success('Chấm điểm hướng dẫn đồ án thành công!');
            setSelectedSubmission(null);
            fetchGrades();
        } catch (error: any) {
            console.error('Lỗi khi chấm điểm:', error);
            toast.error(error.message || 'Chấm điểm thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !userId) {
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
                    Đánh giá & Chấm điểm đồ án tốt nghiệp
                </h1>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                    Nhập điểm hướng dẫn chi tiết dựa trên báo cáo cuối kỳ (Báo cáo cuối cùng - Giai đoạn 4) của sinh viên (Chỉ hiển thị bài đã nộp)
                </p>
            </div>

            {submissions.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-400 font-semibold shadow-sm">
                    Hiện chưa có sinh viên nào nộp báo cáo cuối kỳ (Giai đoạn 4).
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-[28px] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-bold">
                                    <th className="px-6 py-4">Mã sinh viên</th>
                                    <th className="px-6 py-4">Họ và tên</th>
                                    <th className="px-6 py-4">Tên đề tài</th>
                                    <th className="px-6 py-4 text-center">Tệp báo cáo (GĐ 4)</th>
                                    <th className="px-6 py-4 text-center">Điểm hướng dẫn</th>
                                    <th className="px-6 py-4 text-center w-36">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {submissions.map((sub) => {
                                    const capstone = sub.capstone || {};
                                    const fileUrl = sub.file_path
                                        ? (sub.file_path.startsWith('http')
                                            ? sub.file_path
                                            : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace('/api', '') + sub.file_path)
                                        : null;

                                    return (
                                        <tr key={sub.submission_id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-gray-900">
                                                {capstone.student?.user?.usercode || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                {capstone.student?.user?.fullname || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-700 max-w-xs truncate" title={capstone.topic?.title}>
                                                {capstone.topic?.title || 'Chưa đăng ký đề tài'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {fileUrl ? (
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        Xem tệp cuối cùng
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 italic">Chưa nộp bài cuối kỳ</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center font-black text-sm">
                                                {sub.grade !== null && sub.grade !== undefined ? (
                                                    <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                                                        {parseFloat(sub.grade).toFixed(1)} / 10
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 italic font-medium">Chưa có điểm</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {sub.file_path ? (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSubmission(sub);
                                                            setGrade(sub.grade !== null ? String(sub.grade) : '');
                                                            setLecturerNote(sub.lecturer_note || '');
                                                            setStatus(sub.status === 'FAILED' ? 'FAILED' : 'PASSED');
                                                        }}
                                                        className="px-4 py-1.5 bg-[#2e7d32] hover:bg-[#205723] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                                                    >
                                                        {sub.grade !== null ? 'Sửa điểm' : 'Chấm điểm'}
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-400 font-semibold" title="Sinh viên chưa nộp bài, không thể chấm điểm">
                                                        Chờ nộp bài
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* GRADING MODAL */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <form
                        onSubmit={handleSaveGrade}
                        className="bg-[#f7f8fc] rounded-[32px] shadow-2xl overflow-hidden max-w-lg w-full border border-gray-100 flex flex-col animate-scaleUp"
                    >
                        <div className="bg-gradient-to-r from-[#2e7d32] to-[#1b5e20] p-6 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">
                                    Chấm Điểm Đồ Án
                                </h3>
                                <p className="text-[11px] opacity-90 font-semibold mt-0.5">
                                    Giai đoạn 4: Báo cáo cuối cùng & Quy chuẩn điểm hướng dẫn
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
                            {/* Điểm hướng dẫn */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    Điểm Hướng Dẫn (Thang điểm 10)
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    placeholder="Ví dụ: 8.5"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 bg-white placeholder-gray-400 font-bold text-lg text-gray-800"
                                />
                            </div>

                            {/* Đánh giá kết quả đạt/không đạt */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    Đánh giá kết quả đồ án
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
                                        ĐẠT (Để sinh viên ra Hội đồng)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatus('FAILED')}
                                        className={`py-3 rounded-2xl text-xs font-bold transition-all border ${status === 'FAILED'
                                                ? 'bg-red-50 text-red-600 border-red-200 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        CHƯA ĐẠT (Không đủ điều kiện)
                                    </button>
                                </div>
                            </div>

                            {/* Nhận xét */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    Lời nhận xét / Đóng góp ý kiến (Không bắt buộc)
                                </label>
                                <textarea
                                    placeholder="Viết nhận xét hướng dẫn tổng quan..."
                                    value={lecturerNote}
                                    onChange={(e) => setLecturerNote(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 bg-white placeholder-gray-400 font-medium"
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
                                className="px-6 py-2.5 bg-[#2e7d32] hover:bg-[#205723] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                            >
                                {isSubmitting ? 'Đang lưu...' : 'Xác nhận lưu'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}