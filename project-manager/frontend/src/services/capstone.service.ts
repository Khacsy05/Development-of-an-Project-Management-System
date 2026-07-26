import apiClient from "@/lib/apiClient";
import { GetCapstonesQueryDto } from "@/type/capstone";


export async function getCapstoneLists(query?: GetCapstonesQueryDto) {
    try {
        const response = await apiClient.get('/capstones', {
            params: query,
        });
        return response.data
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đồ án:', error);
        throw error;
    }
}