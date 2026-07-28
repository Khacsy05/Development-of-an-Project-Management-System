
import apiClient from "@/lib/apiClient";

export async function getMilestoneList() {
    try {
        const response = await apiClient.get('/milestone');
        return response.data
    } catch (error) {
        console.error('Lỗi khi lấy danh sách mốc:', error);
        throw error;
    }
}
