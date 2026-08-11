import apiClient from "@/lib/apiClient";

export async function getFacultyList() {
    try {
        const response = await apiClient.get('/faculties');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách khoa:', error);
        throw error;
    }
}
