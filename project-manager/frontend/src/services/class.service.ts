import apiClient from "@/lib/apiClient";

export async function getClassList(limit = 100) {
    try {
        const response = await apiClient.get('/classes', {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp:', error);
        throw error;
    }
}
