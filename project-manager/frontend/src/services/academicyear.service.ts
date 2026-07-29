import apiClient from "@/lib/apiClient";

export async function getAcademicYearList() {
    try {
        const response = await apiClient.get('/academic-years');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách năm học:', error);
        throw error;
    }
}
