import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';
import { toast } from 'sonner';

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

        // Bỏ qua cơ chế refresh token nếu endpoint là các yêu cầu Auth cơ bản (để tránh lặp hoặc tự động logout)
        const isAuthRequest = originalRequest?.url?.includes('/auth/login') ||
            originalRequest?.url?.includes('/auth/refreshToken') ||
            originalRequest?.url?.includes('/auth/logout');

        // Nếu dính lỗi 401 và request này không phải là auth request và chưa từng retry
        if (error.response?.status === 401 && !isAuthRequest && !originalRequest._retry) {
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

            } catch (refreshError: any) {
                // Gọi API logout để xóa Cookie HTTP-only "refreshToken" ở trình duyệt
                try {
                    await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
                        {},
                        { withCredentials: true }
                    );
                } catch (logoutError) {
                    console.error('Lỗi khi xóa cookie refresh token:', logoutError);
                }

                // Chỉ hiển thị thông báo nếu người dùng vẫn đang đăng nhập (không phải chủ động logout)
                if (useAuthStore.getState().accessToken) {
                    if (!refreshError.response) {
                        toast.error('Không thể kết nối tới Máy chủ. Vui lòng kiểm tra lại trạng thái Backend!');
                    } else {
                        toast.error('Tài khoản của bạn đã bị vô hiệu hóa hoặc phiên đăng nhập hết hạn!');
                    }
                }

                // Nếu Refresh Token cũng hết hạn -> Logout người dùng
                useAuthStore.getState().logout();
                if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
                    // Delay 2.5 giây để thông báo kịp hiển thị rõ ràng trên màn hình trước khi chuyển trang
                    await new Promise((resolve) => setTimeout(resolve, 800));
                    window.location.href = '/auth/login';
                }

                // Trả về một Promise treo (Pending) để chặn không cho lỗi truyền về Component tạo thêm Toast thứ 2
                return new Promise(() => { });
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;