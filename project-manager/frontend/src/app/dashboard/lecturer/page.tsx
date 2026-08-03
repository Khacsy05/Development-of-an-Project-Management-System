"use client"

import React, { useEffect, useState } from 'react';
import { getCapstoneLists, getCapstoneRequest, getCapstoneSubmissions } from '@/services/capstone.service';
import { getCouncilEvaluations } from '@/services/council.service';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import Link from 'next/link';

import { useCacheStore } from '@/store/useCacheStore';

export default function LecturerDashboard() {
    const userName = useAuthStore((state) => state.userName);
    const userId = useAuthStore((state) => state.userId);
    const isInitializing = useAuthStore((state) => state.isInitializing);

    const { stats: cachedStats, setStats } = useCacheStore();
    const [isLoading, setIsLoading] = useState(!cachedStats);

    const stats = cachedStats || {
        supervisedCount: 0,
        pendingConfirms: 0,
        pendingReports: 0,
        pendingGrades: 0,
        pendingReviews: 0,
        pendingCancels: 0,
    };

    const fetchDashboardData = async () => {
        if (!userId) return;
        // Nếu đã có cache thì chạy ngầm, không hiện spinner xoay tròn nữa
        if (!cachedStats) {
            setIsLoading(true);
        }
        try {
            // Thực hiện gọi song song tất cả 6 API để tránh waterfall
            const [
                capstonesRes,
                confirmsRes,
                reportsRes,
                gradesRes,
                evaluationsRes,
                cancelsRes
            ] = await Promise.all([
                getCapstoneLists({ lecturer_id: userId, limit: 1 }),
                getCapstoneRequest({
                    status: 'PENDING' as any,
                    target_id: userId,
                    request_type: 'REGISTER_LECTURER',
                    limit: 1
                }),
                getCapstoneSubmissions({
                    lecturer_id: userId,
                    milestone_type: 'progress',
                    status: 'PENDING',
                    has_file: true,
                    limit: 1
                }),
                getCapstoneSubmissions({
                    lecturer_id: userId,
                    milestone_type: 'final',
                    status: 'PENDING',
                    has_file: true,
                    limit: 1
                }),
                getCouncilEvaluations({
                    lecturer_id: userId,
                    is_graded: 'false',
                    limit: 1
                } as any),
                getCapstoneLists({
                    lecturer_id: userId,
                    status: 'CANCEL_REQUESTED' as any,
                    limit: 1
                })
            ]);

            const supervisedCount = capstonesRes.pagination?.total || 0;
            const pendingConfirms = confirmsRes.pagination?.total || 0;
            const pendingReports = reportsRes.pagination?.total || 0;
            const pendingGrades = gradesRes.pagination?.total || 0;
            const pendingReviews = evaluationsRes.pagination?.total || 0;
            const pendingCancels = cancelsRes.pagination?.total || 0;

            const newStats = {
                supervisedCount,
                pendingConfirms,
                pendingReports,
                pendingGrades,
                pendingReviews,
                pendingCancels,
            };
            setStats(newStats);

        } catch (error) {
            console.error('Lỗi khi tải dữ liệu trang chủ:', error);
            toast.error('Không thể tải dữ liệu thống kê trang chủ.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isInitializing) {
            if (userId) {
                fetchDashboardData();
            } else {
                setIsLoading(false);
            }
        }
    }, [userId, isInitializing]);

    if (isLoading || !userId) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-4 border-[#3b4c80] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-semibold">Đang chuẩn bị trang chủ...</p>
            </div>
        );
    }

    const hasTasks =
        stats.pendingConfirms > 0 ||
        stats.pendingReports > 0 ||
        stats.pendingGrades > 0 ||
        stats.pendingReviews > 0 ||
        stats.pendingCancels > 0;

    return (
        <div className="max-w-7xl mx-auto p-2 flex flex-col gap-6 animate-fadeIn">
            {/* Greeting Header */}
            <div className="border-b border-gray-100 pb-5">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Chào bạn, {userName}!</h1>
                <p className="text-sm text-gray-500 mt-1">Học vị: Tiến sĩ | Bộ môn: Công nghệ phần mềm</p>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stat 1 */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
                    <div className="pl-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">SV HƯỚNG DẪN ĐỒ ÁN</span>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-3xl font-black text-gray-900">{stats.supervisedCount}</span>
                            <span className="text-sm text-gray-400 font-semibold">/ 20</span>
                        </div>
                        <span className="text-xs text-gray-400 mt-2 block">Giới hạn tối đa 20 sinh viên</span>
                    </div>
                </div>

                {/* Stat 3 */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                    <div className="pl-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">TÌNH TRẠNG HƯỚNG DẪN</span>
                        <div className="text-lg font-bold text-emerald-600 mt-3.5">
                            Đang nhận hướng dẫn
                        </div>
                    </div>
                </div>
            </div>

            {/* Tasks needing action */}
            {hasTasks && (
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4 mt-2">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Tác vụ cần xử lý ngay</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Danh sách các nhiệm vụ, yêu cầu của sinh viên đang chờ phản hồi từ bạn.</p>
                    </div>

                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr className="bg-gray-50/75 border-b border-gray-150 text-gray-700 text-[10px] font-bold uppercase tracking-wider">
                                    <th className="px-4 py-3 w-[25%]">Nghiệp vụ</th>
                                    <th className="px-4 py-3 w-[50%]">Nội dung yêu cầu</th>
                                    <th className="px-4 py-3 w-[15%] text-center">Trạng thái</th>
                                    <th className="px-4 py-3 w-[10%] text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-150 text-gray-700 text-xs">
                                {/* 1. Confirm Lecturer Request */}
                                {stats.pendingConfirms > 0 && (
                                    <tr className="hover:bg-slate-50/50 transition-colors align-middle">
                                        <td className="px-4 py-3 font-bold text-gray-800">Xác nhận HDĐA</td>
                                        <td className="px-4 py-3 text-gray-600">Có <span className="font-bold text-[#3b4c80]">{stats.pendingConfirms}</span> yêu cầu đăng ký hướng dẫn từ sinh viên mới chờ phê duyệt.</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">Chờ duyệt</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link href="/dashboard/lecturer/confirm" className="inline-flex px-2.5 py-1 bg-blue-50 hover:bg-[#3b4c80] hover:text-white rounded-lg text-[10px] font-bold text-[#3b4c80] border border-blue-100/50 hover:border-transparent transition-all shadow-sm">
                                                Xem & Duyệt
                                            </Link>
                                        </td>
                                    </tr>
                                )}

                                {/* 2. Progress reports review */}
                                {stats.pendingReports > 0 && (
                                    <tr className="hover:bg-slate-50/50 transition-colors align-middle">
                                        <td className="px-4 py-3 font-bold text-gray-800">Báo cáo tiến độ</td>
                                        <td className="px-4 py-3 text-gray-600">Có <span className="font-bold text-[#3b4c80]">{stats.pendingReports}</span> bài nộp báo cáo tiến độ giai đoạn 1, 2 hoặc 3 của sinh viên chờ nhận xét.</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">Chờ duyệt</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link href="/dashboard/lecturer/reports" className="inline-flex px-2.5 py-1 bg-blue-50 hover:bg-[#3b4c80] hover:text-white rounded-lg text-[10px] font-bold text-[#3b4c80] border border-blue-100/50 hover:border-transparent transition-all shadow-sm">
                                                Xem chi tiết
                                            </Link>
                                        </td>
                                    </tr>
                                )}

                                {/* 3. Final grades grading */}
                                {stats.pendingGrades > 0 && (
                                    <tr className="hover:bg-slate-50/50 transition-colors align-middle">
                                        <td className="px-4 py-3 font-bold text-gray-800">Chấm điểm hướng dẫn</td>
                                        <td className="px-4 py-3 text-gray-600">Có <span className="font-bold text-[#3b4c80]">{stats.pendingGrades}</span> sinh viên đã nộp báo cáo cuối cùng (Giai đoạn 4) chờ bạn nhập điểm hướng dẫn.</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">Chờ chấm</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link href="/dashboard/lecturer/grades" className="inline-flex px-2.5 py-1 bg-blue-50 hover:bg-[#3b4c80] hover:text-white rounded-lg text-[10px] font-bold text-[#3b4c80] border border-blue-100/50 hover:border-transparent transition-all shadow-sm">
                                                Nhập điểm
                                            </Link>
                                        </td>
                                    </tr>
                                )}

                                {/* 4. Council evaluations grading */}
                                {stats.pendingReviews > 0 && (
                                    <tr className="hover:bg-slate-50/50 transition-colors align-middle">
                                        <td className="px-4 py-3 font-bold text-gray-800">Chấm điểm hội đồng</td>
                                        <td className="px-4 py-3 text-gray-600">Có <span className="font-bold text-[#3b4c80]">{stats.pendingReviews}</span> đồ án bảo vệ trước hội đồng khoa đang phân công bạn chấm điểm phản biện.</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">Chờ chấm</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link href="/dashboard/lecturer/reviews" className="inline-flex px-2.5 py-1 bg-blue-50 hover:bg-[#3b4c80] hover:text-white rounded-lg text-[10px] font-bold text-[#3b4c80] border border-blue-100/50 hover:border-transparent transition-all shadow-sm">
                                                Nhập điểm
                                            </Link>
                                        </td>
                                    </tr>
                                )}

                                {/* 5. Cancel requests review */}
                                {stats.pendingCancels > 0 && (
                                    <tr className="hover:bg-slate-50/50 transition-colors align-middle">
                                        <td className="px-4 py-3 font-bold text-gray-800">Yêu cầu hủy đồ án</td>
                                        <td className="px-4 py-3 text-gray-600">Có <span className="font-bold text-[#3b4c80]">{stats.pendingCancels}</span> sinh viên đã gửi yêu cầu xin hủy/rút đồ án tốt nghiệp cần bạn xét duyệt.</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-red-50 text-red-600 border border-red-100 animate-pulse">Chờ duyệt</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link href="/dashboard/lecturer/cancels" className="inline-flex px-2.5 py-1 bg-blue-50 hover:bg-[#3b4c80] hover:text-white rounded-lg text-[10px] font-bold text-[#3b4c80] border border-blue-100/50 hover:border-transparent transition-all shadow-sm">
                                                Xem & Duyệt
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}