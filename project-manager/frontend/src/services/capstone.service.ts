import { GetCapstonesQueryDto } from "@/type/capstone";
import { api } from "@/lib/api";

export async function getCapstoneList(query?: GetCapstonesQueryDto) {
    try {
        const response = await api.get('/capstones', {
            params: query,
        });   
        return response.data
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đồ án:', error);
        throw error;
    }
}