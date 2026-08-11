'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Toaster, toast } from 'sonner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import apiClient from '@/lib/apiClient';

import { useCacheStore } from '@/store/useCacheStore';
import { useFacultyCacheStore } from '@/store/useFacultyCacheStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuthStore();
  const { clearCache } = useCacheStore();
  const { clearFacultyCache } = useFacultyCacheStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // 1. Hiển thị Loading Toast lập tức để phản hồi người dùng
    const toastId = toast.loading('Đang đăng xuất...');

    // 2. Xóa trạng thái đăng nhập ở RAM ngay để giao diện đổi sang trạng thái Loading
    logout();
    clearCache();
    clearFacultyCache();

    try {
      // 3. Gọi API xóa HttpOnly Cookie phía Backend
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Lỗi khi gọi API đăng xuất:', error);
    } finally {
      toast.dismiss(toastId);
      // 4. Chuyển hướng về trang đăng nhập
      window.location.href = '/auth/login';
    }
  };

  if (isLoggingOut) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-800">
        <Toaster richColors position="top-right" />
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-sm font-semibold text-gray-600">Đang đăng xuất khỏi hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800 overflow-hidden relative">
      <Toaster richColors position="top-right" />

      {/* 1. HEADER COMPONENT */}
      <Header onLogout={handleLogout} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* 2. SIDEBAR COMPONENT */}
        <Sidebar
          onLogout={handleLogout}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* 3. MAIN CONTENT AREA */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>

      {/* 4. FOOTER COMPONENT */}
      <Footer />
    </div>
  );
}
