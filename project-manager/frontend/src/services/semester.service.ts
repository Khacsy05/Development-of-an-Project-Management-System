import apiClient from "@/lib/apiClient";

export async function getSemesterList() {
    try {
        const response = await apiClient.get('/semesters');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách học kỳ:', error);
        throw error;
    }
}
