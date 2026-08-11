"use client"

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCacheStore } from '@/store/useCacheStore';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminDashboard() {
    const userName = useAuthStore((state) => state.userName);
    const isInitializing = useAuthStore((state) => state.isInitializing);
    const { stats, fetchStats } = useCacheStore();
    const [isLoading, setIsLoading] = useState(!stats);

    const fetchDashboardData = async () => {
        try {
            if (!stats) {
                setIsLoading(true);
            }
            await fetchStats();
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu tổng quan admin:', error);
            toast.error('Không thể tải dữ liệu thống kê tổng quan.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isInitializing) {
            fetchDashboardData();
        }
    }, [isInitializing]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-4 border-[#3b4c80] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-semibold">Đang chuẩn bị trang tổng quan quản trị...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 max-w-7xl mx-auto p-2 animate-fadeIn">
            {/* Welcome banner */}
            <div className="bg-gradient-to-r from-[#2c3e50] to-[#2980b9] rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 flex flex-col gap-2">
                    <span className="bg-white/20 text-white rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider self-start backdrop-blur-sm">
                        Cổng quản trị viên
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Xin chào, {userName || 'Admin'}!</h1>
                    <p className="text-xs md:text-sm text-white/80 max-w-xl font-medium leading-relaxed">
                        Chào mừng bạn quay lại hệ thống quản lý hệ thống. Dưới đây là tóm tắt nhanh về số lượng tài nguyên hoạt động trên toàn hệ thống.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-y-1/4 translate-x-1/10">
                    <svg className="w-72 h-72" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                    </svg>
                </div>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Users Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tài khoản hệ thống</span>
                        <span className="text-2xl font-black text-gray-800 tracking-tight group-hover:text-blue-600 transition-colors">{stats.totalUsers}</span>
                        <span className="text-[10px] text-gray-500 font-semibold mt-1">Đang hoạt động trên hệ thống</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                </div>

                {/* Topics Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Đề tài tốt nghiệp</span>
                        <span className="text-2xl font-black text-gray-800 tracking-tight group-hover:text-emerald-600 transition-colors">{stats.totalTopics}</span>
                        <span className="text-[10px] text-gray-500 font-semibold mt-1">Trong ngân hàng đề tài chung</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                </div>

                {/* Capstones Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Đồ án hoạt động</span>
                        <span className="text-2xl font-black text-gray-800 tracking-tight group-hover:text-amber-600 transition-colors">{stats.totalCapstones}</span>
                        <span className="text-[10px] text-gray-500 font-semibold mt-1">Đang triển khai kỳ này</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                <h2 className="text-lg font-black text-gray-800 tracking-tight uppercase">Phím tắt quản trị</h2>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/dashboard/admin/accounts"
                        className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-sm shadow-blue-500/10 flex items-center gap-2"
                    >
                        Quản lý tài khoản người dùng
                    </Link>
                </div>
            </div>
        </div>
    );
}
