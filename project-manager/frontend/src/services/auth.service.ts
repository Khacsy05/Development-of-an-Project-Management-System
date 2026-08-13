import apiClient from "@/lib/apiClient";
import { DataLogin, UpdatePassword } from "@/type/auth";

export async function loginUser(data: DataLogin) {
    try {
        const login = await apiClient.post('/auth/login', data)
        return login
    } catch (error) {
        console.error('Lỗi khi dang nhap:', error);
        throw error;
    }
}


export async function updatePassword(data: UpdatePassword) {
    try {
        const update = await apiClient.patch('/auth/updatePassword', data)
        return update
    } catch (error) {
        console.error('Lỗi khi cap nhat mat khau:', error);
        throw error;
    }
}   