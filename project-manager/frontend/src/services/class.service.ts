import apiClient from "@/lib/apiClient";
import { ClassQueryDto, ClassCreatePayload, ClassUpdatePayload } from "@/type/class";

export async function getClassList(query: ClassQueryDto) {
    try {
        const response = await apiClient.get('/classes', {
            params: query
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp:', error);
        throw error;
    }
}

export async function createClass(data: ClassCreatePayload) {
    try {
        const response = await apiClient.post('/classes', data);
        return response.data;
    } catch (error: any) {
        console.error('Lỗi khi tạo lớp học:', error);
        throw error.response?.data || error;
    }
}

export async function updateClass(id: string, data: ClassUpdatePayload) {
    try {
        const response = await apiClient.patch(`/classes/${id}`, data);
        return response.data;
    } catch (error: any) {
        console.error('Lỗi khi cập nhật lớp học:', error);
        throw error.response?.data || error;
    }
}

export async function deleteClass(id: string) {
    try {
        const response = await apiClient.delete(`/classes/${id}`);
        return response.data;
    } catch (error: any) {
        console.error('Lỗi khi xóa lớp học:', error);
        throw error.response?.data || error;
    }
}
