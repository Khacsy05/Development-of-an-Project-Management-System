import apiClient from "@/lib/apiClient";
import { CreateFacultyDto } from "@/type/faculty";

export async function getFacultyList() {
    try {
        const response = await apiClient.get('/faculties');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách khoa:', error);
        throw error;
    }
}

export async function createFaculty(data: CreateFacultyDto) {
    try {
        const response = await apiClient.post('/faculties', data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tạo khoa:', error);
        throw error;
    }
}

export async function updateFaculty(id: string | number, data: CreateFacultyDto) {
    try {
        const response = await apiClient.patch(`/faculties/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật khoa:', error);
        throw error;
    }
}
