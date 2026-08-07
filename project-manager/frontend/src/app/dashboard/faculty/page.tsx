"use client"

import React, { useEffect, useState } from 'react';
import { getTopicList } from '@/services/topic.service';
import { getCapstoneLists } from '@/services/capstone.service';
import { getCouncilList } from '@/services/council.service';
import { getLecturerList } from '@/services/lecturer.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useFacultyCacheStore } from '@/store/useFacultyCacheStore';
import { toast } from 'sonner';
import Link from 'next/link';

export default function FacultyDashboard() {
    const userName = useAuthStore((state) => state.userName);
    const facultyId = useAuthStore((state) => state.faculty_id);
    const isInitializing = useAuthStore((state) => state.isInitializing);

    const { stats: cachedStats, setStats } = useFacultyCacheStore();
    const [isLoading, setIsLoading] = useState(!cachedStats);

    const stats = cachedStats || {
        totalTopics: 0,
        totalCapstones: 0,
        totalCouncils: 0,
        totalLecturers: 0,
    };

    const fetchDashboardData = async () => {
        if (!facultyId) return;
        if (!cachedStats) {
            setIsLoading(true);
        }
        try {
            const [topicsRes, capstonesRes, councilsRes, lecturersRes] = await Promise.all([
                getTopicList({ facultyId: String(facultyId), limit: 1 }),
                getCapstoneLists({ faculty_id: String(facultyId), limit: 1 }),
                getCouncilList(),
                getLecturerList({ limit: 1 }),
            ]);

            const newStats = {
                totalTopics: topicsRes.pagination?.total || 0,
                totalCapstones: capstonesRes.pagination?.total || 0,
                totalCouncils: Array.isArray(councilsRes) ? councilsRes.length : (councilsRes?.data?.length || 0),
                totalLecturers: lecturersRes.pagination?.total || 0,
            };

            setStats(newStats);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu tổng quan khoa:', error);
            toast.error('Không thể tải dữ liệu thống kê tổng quan.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isInitializing) {
            if (facultyId) {
                fetchDashboardData();
            } else {
                setIsLoading(false);
            }
        }
    }, [facultyId, isInitializing]);

    if (isLoading || !facultyId) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-4 border-[#3b4c80] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-semibold">Đang chuẩn bị trang tổng quan khoa...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 max-w-7xl mx-auto p-2 animate-fadeIn">
            {/* Welcome banner */}
            <div className="bg-gradient-to-r from-[#2c3e50] to-[#3498db] rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 flex flex-col gap-2">
                    <span className="bg-white/20 text-white rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider self-start backdrop-blur-sm">
                        Cổng quản lý của Khoa
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Xin chào, {userName || 'Trưởng khoa'}!</h1>
                    <p className="text-xs md:text-sm text-white/80 max-w-xl font-medium leading-relaxed">
                        Chào mừng bạn quay lại hệ thống quản lý Đồ án & Thực tập. Dưới đây là tóm tắt nhanh tình hình triển khai đồ án trong học kỳ hiện tại của khoa.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-y-1/4 translate-x-1/10">
                    <svg className="w-72 h-72" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                    </svg>
                </div>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Topics Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng Đề Tài</span>
                        <span className="text-3xl font-extrabold text-[#2c3e50] tracking-tight group-hover:scale-105 transition-transform origin-left">
                            {stats.totalTopics}
                        </span>
                        <Link href="/dashboard/faculty/topics" className="text-[10px] text-blue-500 font-bold hover:underline flex items-center gap-0.5 mt-1">
                            Xem chi tiết &rarr;
                        </Link>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center border border-blue-100/50">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                </div>

                {/* Capstones Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Đồ án đang làm</span>
                        <span className="text-3xl font-extrabold text-[#2c3e50] tracking-tight group-hover:scale-105 transition-transform origin-left">
                            {stats.totalCapstones}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold mt-1">Học kỳ hiện tại</span>
                    </div>
                    <div className="w-12 h-12 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center border border-teal-100/50">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                </div>

                {/* Councils Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hội đồng bảo vệ</span>
                        <span className="text-3xl font-extrabold text-[#2c3e50] tracking-tight group-hover:scale-105 transition-transform origin-left">
                            {stats.totalCouncils}
                        </span>
                        <Link href="/dashboard/faculty/councils/manage" className="text-[10px] text-orange-500 font-bold hover:underline flex items-center gap-0.5 mt-1">
                            Xem quản lý &rarr;
                        </Link>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center border border-orange-100/50">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>

                {/* Lecturers Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Giảng viên khoa</span>
                        <span className="text-3xl font-extrabold text-[#2c3e50] tracking-tight group-hover:scale-105 transition-transform origin-left">
                            {stats.totalLecturers}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold mt-1">Tổng thành viên</span>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center border border-purple-100/50">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-extrabold text-gray-900 mb-4 tracking-tight">Thao tác Quản trị Nhanh</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/dashboard/faculty/topics" className="flex items-center gap-3 p-4 border border-gray-100 hover:border-blue-100 hover:bg-blue-50/20 rounded-xl transition-all group">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100/50">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Duyệt đề tài</span>
                            <span className="text-[10px] text-gray-400">Xem và sửa đề xuất đề tài</span>
                        </div>
                    </Link>

                    <Link href="/dashboard/faculty/councils/manage" className="flex items-center gap-3 p-4 border border-gray-100 hover:border-orange-100 hover:bg-orange-50/20 rounded-xl transition-all group">
                        <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100/50">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Quản lý Hội đồng</span>
                            <span className="text-[10px] text-gray-400">Thành lập & phân thành viên</span>
                        </div>
                    </Link>

                    <Link href="/dashboard/faculty/councils" className="flex items-center gap-3 p-4 border border-gray-100 hover:border-green-100 hover:bg-green-50/20 rounded-xl transition-all group">
                        <div className="w-9 h-9 rounded-lg bg-green-50 text-green-500 flex items-center justify-center border border-green-100/50">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-900 group-hover:text-green-600 transition-colors">Phân công hội đồng</span>
                            <span className="text-[10px] text-gray-400">Gán hội đồng chấm đồ án</span>
                        </div>
                    </Link>

                    <Link href="/dashboard/faculty/milestones" className="flex items-center gap-3 p-4 border border-gray-100 hover:border-purple-100 hover:bg-purple-50/20 rounded-xl transition-all group">
                        <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center border border-purple-100/50">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Mốc thời gian</span>
                            <span className="text-[10px] text-gray-400">Cấu hình thời hạn kế hoạch</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}