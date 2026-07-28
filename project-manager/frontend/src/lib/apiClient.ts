// lib/apiClient.ts
import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

// 1. Đính Access Token từ RAM vào Header
apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Xử lý khi Access Token hết hạn giữa chừng (Trả về 401)
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu dính lỗi 401 và request này chưa từng retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Gọi API cấp lại Access Token mới
                const res = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/refreshToken`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = res.data.accessToken;

                // Lưu Access Token mới vào Zustand (RAM)
                useAuthStore.getState().setAuth(newAccessToken);

                // Gắn token mới vào request cũ và thực hiện lại
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);

            } catch (refreshError) {
                // Nếu Refresh Token cũng hết hạn -> Logout người dùng
                useAuthStore.getState().logout();
                if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
                    window.location.href = '/auth/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;