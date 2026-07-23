'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { loginUser } from '@/services/auth.service';
import { toast } from 'sonner'; // Sử dụng thư viện toast có sẵn trong project của em

const Login = () => { // 🌟 Sửa tên component viết hoa chữ cái đầu
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 🌟 Thêm loading state chống spam click
  const router = useRouter();

  const fetchLogin = async () => {
    setIsLoading(true);
    try {
      const res = await loginUser({ username, password });
      console.log(res.data);

      toast.success('Đăng nhập thành công! Đang chuyển hướng...');

      // Đọc callbackUrl từ query parameters, nếu không có thì mặc định về /dashboard
      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get('callbackUrl') || '/dashboard';

      // Chuyển hướng sau một khoảng trễ ngắn để người dùng kịp nhìn thấy Toast thành công
      setTimeout(() => {
        window.location.href = callbackUrl;
      }, 1000);
    } catch (error: any) {
      // Lấy thông báo lỗi chi tiết từ backend nếu có
      const errorMsg = error?.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại!';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

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
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-blue-400 flex items-center justify-center"
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
      </div>
    </div>
  );
}

export default Login // 🌟 Export component đã viết hoa
