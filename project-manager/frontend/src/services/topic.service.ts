import apiClient from "@/lib/apiClient";
import { CreateTopicDto, TopicParams, UpdateTopicDto } from "@/type/topic";

export async function getTopicList(params: TopicParams) {
    try {
        const response = await apiClient.get('/topics', { params });
        return response.data;
    } catch (error: any) {
        console.error('Lỗi khi lấy danh sách đề tài:', error);
        throw error.response?.data?.message || 'Lỗi khi lấy danh sách đề tài';
    }
}

export async function createTopic(data: CreateTopicDto) {
    try {
        const response = await apiClient.post('/topics', data);
        return response.data;
    } catch (error: any) {
        console.error('Lỗi khi tạo đề tài:', error);
        throw error.response?.data?.message || 'Lỗi khi tạo đề tài';
    }
}

export async function updateTopic(id: string, data: UpdateTopicDto) {
    try {
        const response = await apiClient.patch(`/topics/${id}`, data);
        return response.data;
    } catch (error: any) {
        console.error('Lỗi khi cập nhật đề tài:', error);
        throw error.response?.data?.message || 'Lỗi khi cập nhật đề tài';
    }
}

export async function deleteTopic(id: string) {
    try {
        const response = await apiClient.delete(`/topics/${id}`);
        return response.data;
    } catch (error: any) {
        console.error('Lỗi khi xóa đề tài:', error);
        throw error.response?.data?.message || 'Lỗi khi xóa đề tài';
    }
}