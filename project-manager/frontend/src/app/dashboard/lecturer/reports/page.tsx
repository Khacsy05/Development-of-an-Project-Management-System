"use client"

import React, { useEffect, useState } from 'react';
import { getCapstoneSubmissions, updateCapstoneSubmission } from '@/services/capstone.service';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

import { useCacheStore } from '@/store/useCacheStore';

export default function ReportsPage() {
    const { reports, setReports } = useCacheStore();
    const [capstones, setCapstones] = useState<any[]>(reports || []);
    const [isLoading, setIsLoading] = useState(!reports);
    const userId = useAuthStore((state) => state.userId);

    // States cho modal đánh giá
    const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
    const [lecturerNote, setLecturerNote] = useState('');
    const [status, setStatus] = useState<'PASSED' | 'FAILED'>('PASSED');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchReports = async () => {
        if (!userId) return;
        if (!reports) {
            setIsLoading(true);
        }
        try {
            const res = await getCapstoneSubmissions({ lecturer_id: userId, milestone_type: 'progress', limit: 100 });
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

            const capstonesList = Object.values(groupedMap);
            setCapstones(capstonesList);
            setReports(capstonesList);
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
            const updateData = {
                status,
                lecturer_note: lecturerNote,
            };

            await updateCapstoneSubmission(selectedSubmission.submission_id, updateData);
            toast.success('Đánh giá báo cáo tiến độ thành công!');
            setSelectedSubmission(null);
            fetchReports();
        } catch (error) {
            console.error('Lỗi khi lưu đánh giá:', error);
            toast.error('Không thể lưu đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !userId) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-4 border-[#3b4c80] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-semibold">Đang tải danh sách báo cáo tiến độ...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-2 flex flex-col gap-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Quản lý Báo cáo Tiến độ</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Theo dõi, phản hồi và duyệt các giai đoạn báo cáo tiến độ (Giai đoạn 1, 2, 3) của sinh viên.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#3b4c80] border border-blue-100">
                        {capstones.length} đồ án đang hướng dẫn
                    </span>
                </div>
            </div>

            {capstones.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm max-w-xl mx-auto mt-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Không có bài nộp nào</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">Hiện tại chưa có sinh viên nào tải lên báo cáo tiến độ giai đoạn 1, 2 hoặc 3.</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                                    <th className="px-4 py-3.5 w-[34%]">Sinh viên & Đề tài</th>
                                    <th className="px-4 py-3.5 w-[22%]">Giai đoạn 1</th>
                                    <th className="px-4 py-3.5 w-[22%]">Giai đoạn 2</th>
                                    <th className="px-4 py-3.5 w-[22%]">Giai đoạn 3</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-gray-700 text-xs">
                                {capstones.map((capstone) => {
                                    const progressSubmissions = capstone.submission
                                        ?.sort((a: any, b: any) => Number(a.milestone_id) - Number(b.milestone_id)) || [];

                                    const milestonesToShow = [1, 2, 3];

                                    return (
                                        <tr key={capstone.capstone_id} className="hover:bg-slate-50/50 transition-colors align-top">
                                            {/* Column 1: Info Student and Topic */}
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                                                        {capstone.topic?.title || 'Chưa đăng ký đề tài'}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 mt-0.5">
                                                        Sinh viên: <span className="font-mono font-semibold text-[#3b4c80]">{capstone.student?.user?.usercode || '---'}</span> - {capstone.student?.user?.fullname || '---'}
                                                    </span>
                                                    <div className="mt-1.5">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100/50">
                                                            {capstone.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Columns 2, 3, 4: Milestones 1, 2, 3 */}
                                            {milestonesToShow.map((mId) => {
                                                const sub = progressSubmissions.find((s: any) => Number(s.milestone_id) === mId);
                                                
                                                if (!sub) {
                                                    return (
                                                        <td key={mId} className="px-4 py-3">
                                                            <span className="text-gray-400 italic text-[11px]">Chưa tạo giai đoạn</span>
                                                        </td>
                                                    );
                                                }

                                                const fileUrl = sub.file_path
                                                    ? (sub.file_path.startsWith('http')
                                                        ? sub.file_path
                                                        : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace('/api', '') + sub.file_path)
                                                    : null;

                                                return (
                                                    <td key={mId} className="px-4 py-3 border-l border-gray-50">
                                                        <div className="flex flex-col gap-2 h-full">
                                                            {/* Badge & Link Row */}
                                                            <div className="flex items-center justify-between gap-1 flex-wrap">
                                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${sub.status === 'PASSED'
                                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                                    : sub.status === 'FAILED'
                                                                        ? 'bg-red-50 text-red-700 border-red-200'
                                                                        : sub.file_path
                                                                            ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                                                                            : 'bg-gray-100 text-gray-500 border-gray-200'
                                                                    }`}>
                                                                    {sub.status === 'PENDING' && sub.file_path ? 'Chờ duyệt' : sub.status}
                                                                </span>

                                                                {fileUrl ? (
                                                                    <a
                                                                        href={fileUrl}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 font-bold hover:underline"
                                                                    >
                                                                        Tải báo cáo
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-gray-400 italic text-[10px]">Chưa nộp file</span>
                                                                )}
                                                            </div>

                                                            {/* Notes block */}
                                                            {(sub.student_note || sub.lecturer_note) && (
                                                                <div className="space-y-1 text-[10px] bg-gray-50/70 p-2 rounded-xl border border-gray-100 leading-tight">
                                                                    {sub.student_note && (
                                                                        <p className="text-gray-600 line-clamp-2 hover:line-clamp-none transition-all duration-200">
                                                                            <span className="font-extrabold text-gray-400">SV:</span> {sub.student_note}
                                                                        </p>
                                                                    )}
                                                                    {sub.lecturer_note && (
                                                                        <p className="text-gray-600 line-clamp-2 hover:line-clamp-none transition-all duration-200 border-t border-gray-200/50 pt-1 mt-1">
                                                                            <span className="font-extrabold text-blue-500">GV:</span> {sub.lecturer_note}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Quick action button */}
                                                            {sub.status === 'PENDING' && sub.file_path && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedSubmission(sub);
                                                                        setLecturerNote(sub.lecturer_note || '');
                                                                        setStatus(sub.status === 'FAILED' ? 'FAILED' : 'PASSED');
                                                                    }}
                                                                    className="w-full py-1 bg-blue-50 hover:bg-[#3b4c80] text-[#3b4c80] hover:text-white rounded-lg text-[10px] font-bold transition-all border border-blue-100/50 hover:border-transparent flex items-center justify-center gap-1 shadow-sm mt-auto"
                                                                >
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                    Đánh giá
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* REVIEW REPORT MODAL */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
                    <form
                        onSubmit={handleSaveReview}
                        className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full border border-gray-100 flex flex-col animate-in fade-in zoom-in-95 duration-200"
                    >
                        <div className="bg-[#3b4c80] p-6 text-white flex justify-between items-center">
                            <div>
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100/20 text-white">
                                    ĐÁNH GIÁ TIẾN ĐỘ ĐỒ ÁN
                                </span>
                                <h3 className="text-lg font-bold mt-1">
                                    {selectedSubmission.milestone?.phase_name || 'Báo cáo tiến độ'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedSubmission(null)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all focus:outline-none"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
                                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4c80]/20 bg-white placeholder-gray-400 font-medium"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedSubmission(null)}
                                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2 bg-[#2e7d32] hover:bg-[#205723] text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
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