
import apiClient from "@/lib/apiClient";

export async function getMilestoneList(semesterId?: string) {
    try {
        const response = await apiClient.get('/milestone', {
            params: { semester_id: semesterId }
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách mốc:', error);
        throw error;
    }
}

export async function updateMilestone(id: string | number, data: any) {
    try {
        const response = await apiClient.patch(`/milestone/${id}`, data);
        return response.data;
    } catch (error: any) {
        console.error('Lỗi khi cập nhật mốc thời gian:', error);
        throw error.response?.data?.message || 'Lỗi khi cập nhật mốc thời gian';
    }
}
