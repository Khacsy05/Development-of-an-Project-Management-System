import apiClient from "@/lib/apiClient";

export async function getCounciMember(lecturer_id?: string) {
    try {
        const response = await apiClient.get('/councils-members', {
            params: {
                lecturer_id
            }
        });
        console.log('Danh sách thành viên hội đồng:', response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách thành viên hội đồng:', error);
        throw error;
    }
}