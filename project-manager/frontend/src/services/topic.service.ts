import apiClient from "@/lib/apiClient";

export async function getTopicList(params?: { isAvailable?: string; title?: string; page?: number; limit?: number }) {
    try {
        const response = await apiClient.get('/topics', { params });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đề tài:', error);
        throw error;
    }
}