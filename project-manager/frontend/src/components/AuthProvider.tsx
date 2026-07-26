// components/AuthProvider.tsx
'use client';


import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';


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
                // Refresh token hết hạn hoặc không tồn tại
                setIsInitializing(false);
            }
        };

        silentRefresh();
    }, [setAuth, setIsInitializing]);

    return <>{children}</>;
}