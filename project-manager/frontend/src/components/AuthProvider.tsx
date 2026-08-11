// components/AuthProvider.tsx
'use client';


import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const setAuth = useAuthStore((state) => state.setAuth);
    const setIsInitializing = useAuthStore((state) => state.setIsInitializing);

    useEffect(() => {
        const silentRefresh = async () => {
            try {
                // Backend sẽ tự đọc Refresh Token trong HttpOnly Cookie
                // và trả về { accessToken: "..." } mới
                const res = await apiClient.post('/auth/refreshToken');

                if (res.data?.accessToken) {
                    setAuth(res.data.accessToken);
                } else {
                    setIsInitializing(false);
                }
            } catch (error) {
                // Gọi API logout để xóa cookie Refresh Token trên trình duyệt
                try {
                    await apiClient.post('/auth/logout');
                } catch (logoutError) {
                    console.error('Lỗi khi xóa cookie refresh token:', logoutError);
                }

                // Hiển thị thông báo tài khoản bị khóa/vô hiệu hóa (chỉ hiển thị nếu không ở trang login)
                if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
                    toast.error('Tài khoản của bạn đã bị vô hiệu hóa hoặc phiên đăng nhập hết hạn!');
                }

                useAuthStore.getState().logout();
                if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
                    // Delay 2.5 giây để người dùng kịp nhìn thấy thông báo trước khi bị chuyển trang
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    window.location.href = '/auth/login';
                }
                setIsInitializing(false);
            }
        };

        silentRefresh();
    }, [setAuth, setIsInitializing]);

    return <>{children}</>;
}