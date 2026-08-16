import apiClient from "@/lib/apiClient";
import { CreateMajorDto } from "@/type/major";

export async function getMajorList() {
    try {
        const response = await apiClient.get('/majors');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách chuyên ngành:', error);
        throw error;
    }
}

export async function createMajor(data: CreateMajorDto) {
    try {
        const response = await apiClient.post('/majors', data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tạo chuyên ngành:', error);
        throw error;
    }
}

export async function updateMajor(id: string | number, data: CreateMajorDto) {
    try {
        const response = await apiClient.patch(`/majors/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật chuyên ngành:', error);
        throw error;
    }
}

export async function getMajorsByFaculty(facultyId: string | number) {
    try {
        const response = await apiClient.get(`/faculties/${facultyId}/majors`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách ngành học:', error);
        throw error;
    }
}
