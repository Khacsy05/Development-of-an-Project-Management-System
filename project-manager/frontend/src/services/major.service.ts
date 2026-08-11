import apiClient from "@/lib/apiClient";

export async function getMajorsByFaculty(facultyId: string | number) {
    try {
        const response = await apiClient.get(`/faculties/${facultyId}/majors`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách ngành học:', error);
        throw error;
    }
}
