import { api } from "@/lib/api";
import { DataLogin } from "@/type/auth";

export async function loginUser(data : DataLogin){
    try {
        const login = await api.post('/auth/login',data)
        return login
    } catch (error) {
        console.error('Lỗi khi dang nhap:', error);
        throw error;
    }
}