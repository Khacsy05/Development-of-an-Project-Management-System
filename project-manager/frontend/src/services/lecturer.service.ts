import apiClient from "@/lib/apiClient";

export async function getLecturerList(params?: { fullname?: string; page?: number; limit?: number }) {
    try {
        const response = await apiClient.get('/users', {
            params: {
                role: 'Lecturer',
                ...params
            }
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách giảng viên:', error);
        throw error;
    }
}