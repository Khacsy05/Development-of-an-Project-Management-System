import apiClient from "@/lib/apiClient";
import { DataLogin } from "@/type/auth";

export async function loginUser(data: DataLogin) {
    try {
        const login = await apiClient.post('/auth/login', data)
        return login
    } catch (error) {
        console.error('Lỗi khi dang nhap:', error);
        throw error;
    }
}

