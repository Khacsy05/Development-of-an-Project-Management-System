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

import { updatePassword } from '@/services/auth.service';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, isFirstLogin, username, setIsFirstLogin } = useAuthStore();
  const { clearCache } = useCacheStore();
  const { clearFacultyCache } = useFacultyCacheStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // States for password change modal
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ tất cả các trường!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không trùng khớp!');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword({
        username: username || '',
        oldPassword,
        newPassword,
        confirmPassword,
      });
      toast.success('Đổi mật khẩu thành công! Giờ đây bạn có thể sử dụng hệ thống.');
      setIsFirstLogin(false);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ!';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
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

      {/* 5. MANDATORY CHANGE PASSWORD MODAL */}
      {isFirstLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-md select-none">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-gray-100 flex flex-col gap-5 animate-scaleUp">
            <div className="flex flex-col gap-1 border-b border-gray-100 pb-3">
              <h2 className="text-base font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-6 bg-red-500 rounded-full inline-block"></span>
                Đổi mật khẩu bắt buộc
              </h2>
              <p className="text-[11px] font-semibold text-gray-400">
                Đây là lần đăng nhập đầu tiên của bạn. Hãy đổi mật khẩu để bảo vệ tài khoản.
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-gray-500 font-bold mb-1">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu cũ"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-bold mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-bold mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end mt-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Đăng xuất
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
