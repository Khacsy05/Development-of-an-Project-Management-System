import apiClient from "@/lib/apiClient";
import { UserQuery, UserCreatePayload, UserUpdatePayload } from "@/type/user";

export async function getUserList(params: UserQuery) {
    try {
        const response = await apiClient.get('/users', {
            params: params
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách giảng viên:', error);
        throw error;
    }
}

export async function getLecturerList(params?: any) {
    return getUserList({ ...params, role: 'Lecturer' });
}

export async function getUserById(id: string) {
    try {
        const response = await apiClient.get(`/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết giảng viên:', error);
        throw error;
    }
}

export async function createUser(data: UserCreatePayload) {
    try {
        const response = await apiClient.post('/users', data);
        return response.data;
    } catch (error: any) {
        console.error('Lỗi khi tạo người dùng:', error);
        throw error.response?.data || error;
    }
}

export async function updateUser(id: string, data: UserUpdatePayload) {
    try {
        const response = await apiClient.patch(`/users/${id}`, data);
        return response.data;
    } catch (error: any) {
        console.error('Lỗi khi cập nhật người dùng:', error);
        throw error.response?.data || error;
    }
}