'use client'
import React, { useState, Suspense } from 'react'
import { loginUser } from '@/services/auth.service';
import { toast } from 'sonner'; // Sử dụng thư viện toast có sẵn trong project của em
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

const LoginForm = () => { // 🌟 Đổi tên để chuẩn bị bọc Suspense
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 🌟 Thêm loading state chống spam click
  const setAuth = useAuthStore((state) => state.setAuth);
  const setIsFirstLogin = useAuthStore((state) => state.setIsFirstLogin);
  const router = useRouter();
  const searchParams = useSearchParams();

  const getSafeCallbackUrl = (urlParam: string | null, fallback = '/dashboard') => {
    if (!urlParam) return fallback;

    // Chỉ chấp nhận đường dẫn tương đối bắt đầu bằng / (ví dụ: /dashboard, /profile)
    // Bỏ qua các URL bắt đầu bằng // (protocol-relative URL nguy hiểm)
    const isRelative = urlParam.startsWith('/') && !urlParam.startsWith('//');

    return isRelative ? urlParam : fallback;
  };

  const fetchLogin = async () => {
    setIsLoading(true);
    try {
      const res = await loginUser({ username, password });

      // Đắp Access Token vào Zustand RAM lập tức để cập nhật trạng thái đăng nhập
      const isFirst = res.data?.firstLogin;
      if (res.data?.accessToken) {
        setAuth(res.data.accessToken);
        setIsFirstLogin(isFirst);
      }

      toast.success('Đăng nhập thành công! Đang chuyển hướng...');

      // Đọc callbackUrl từ query parameters, nếu không có thì mặc định về /dashboard
      const rawCallback = searchParams.get('callbackUrl');
      const safeCallbackUrl = getSafeCallbackUrl(rawCallback, '/dashboard');

      // Chuyển hướng sau một khoảng trễ ngắn để người dùng kịp nhìn thấy Toast thành công
      setTimeout(() => {
        router.push(safeCallbackUrl);
      }, 500);
    } catch (error: any) {
      // Lấy thông báo lỗi chi tiết từ backend nếu có
      const errorMsg = error?.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại!';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  const handleQuickLogin = async (roleName: 'admin' | 'lecturer' | 'student') => {
    let targetUser = '';
    const targetPass = 'password_da_ma_hoa_cho_nay';

    if (roleName === 'admin') {
      targetUser = 'admin';
    } else if (roleName === 'lecturer') {
      targetUser = 'gv_giangvien1';
    } else {
      targetUser = 'sv_sinhvien1';
    }

    setUsername(targetUser);
    setPassword(targetPass);

    setIsLoading(true);
    const toastId = toast.loading('Đang tự động kết nối...');
    try {
      const res = await loginUser({ username: targetUser, password: targetPass });
      const isFirst = res.data?.firstLogin;
      if (res.data?.accessToken) {
        setAuth(res.data.accessToken);
        setIsFirstLogin(isFirst);
      }

      toast.success('Đăng nhập nhanh thành công!');
      const rawCallback = searchParams.get('callbackUrl');
      const safeCallbackUrl = getSafeCallbackUrl(rawCallback, '/dashboard');
      setTimeout(() => {
        router.push(safeCallbackUrl);
      }, 500);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Đăng nhập nhanh thất bại!';
      toast.error(errorMsg);
    } finally {
      toast.dismiss(toastId);
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { // 🌟 Định nghĩa chuẩn type cho Event
    e.preventDefault();
    if (!isLoading) {
      fetchLogin();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Đăng Nhập
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Tên đăng nhập / Email
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập username..."
              required
              disabled={isLoading} // Disable input khi đang gửi request
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100"
            />
          </div>

          {/* Input Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              required
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100"
            />
          </div>

          {/* Quên mật khẩu / Ghi nhớ */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-600">
              <input
                type="checkbox"
                disabled={isLoading}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Ghi nhớ tôi
            </label>
            <a href="#" className="font-medium text-blue-600 hover:underline">
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading} // Tránh spam click
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-blue-400 flex items-center justify-center cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang đăng nhập...
              </>
            ) : 'Đăng nhập'}
          </button>
        </form>

        {/* Quick Login Section */}
        <div className="mt-8 border-t border-gray-100 pt-6">
          <div className="text-center mb-4">
            <span className="bg-white px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
              Đăng nhập nhanh cho nhà tuyển dụng
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              disabled={isLoading}
              className="w-full flex items-center justify-between px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 bg-red-500 text-white rounded-lg group-hover:scale-105 transition-transform text-xs font-black">AD</span>
                <div className="text-left">
                  <p className="text-xs font-bold text-red-900">Quản trị viên (Admin)</p>
                  <p className="text-[10px] text-red-500 font-semibold">Tài khoản quản trị tối cao</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('lecturer')}
              disabled={isLoading}
              className="w-full flex items-center justify-between px-4 py-3 bg-teal-50 hover:bg-teal-100 border border-teal-100 rounded-xl transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 bg-teal-600 text-white rounded-lg group-hover:scale-105 transition-transform text-xs font-black">GV</span>
                <div className="text-left">
                  <p className="text-xs font-bold text-teal-900">Trưởng khoa / Giảng viên</p>
                  <p className="text-[10px] text-teal-500 font-semibold">GV001 - Trưởng khoa CNTT</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              disabled={isLoading}
              className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 bg-blue-600 text-white rounded-lg group-hover:scale-105 transition-transform text-xs font-black">SV</span>
                <div className="text-left">
                  <p className="text-xs font-bold text-blue-900">Sinh viên</p>
                  <p className="text-[10px] text-blue-500 font-semibold">SV001 - Sinh viên làm đồ án</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="text-sm font-semibold text-gray-600 flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Đang tải trang đăng nhập...
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
