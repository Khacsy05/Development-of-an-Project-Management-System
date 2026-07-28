import apiClient from "@/lib/apiClient";
import { GetCapstoneRequestQueryDto, GetCapstonesQueryDto, GetCapstonesRequestUpdateDto } from "@/type/capstone";


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

export async function getCapstoneByUser(userId?: string) {
    try {
        const response = await apiClient.get(`/capstones/${userId}`);
        return response.data
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đồ án:', error);
        throw error;
    }
}

export async function getCapstoneRequest(query?: GetCapstoneRequestQueryDto) {
    try {
        const response = await apiClient.get('/capstones-request', {
            params: query,
        });
        return response.data
    } catch (error) {
        console.error('Lỗi khi lấy danh sách yêu cầu đồ án:', error);
        throw error;
    }
}

export async function updateCapstoneRequest(id: string, data: GetCapstonesRequestUpdateDto) {
    try {
        const response = await apiClient.patch(`/capstones-request/${id}`, data);
        return response.data
    } catch (error) {
        console.error('Lỗi khi cập nhật yêu cầu đồ án:', error);
        throw error;
    }
}

export async function updateCapstoneSubmission(id: string, data: GetCapstonesRequestUpdateDto) {
    try {
        const response = await apiClient.patch(`/capstones-submission/${id}`, data);
        return response.data
    } catch (error) {
        console.error('Lỗi khi cập nhật đồ án:', error);
        throw error;
    }
}
