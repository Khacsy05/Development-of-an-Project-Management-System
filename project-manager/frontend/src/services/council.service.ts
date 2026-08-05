import apiClient from "@/lib/apiClient";
import { GetCouncilEvaluationsQueryDto } from "@/type/council";

export async function getCounciMember(lecturer_id?: string) {
    try {
        const response = await apiClient.get('/councils-members', {
            params: {
                lecturer_id
            }
        });
        console.log('Danh sách thành viên hội đồng:', response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách thành viên hội đồng:', error);
        throw error;
    }
}

export async function getCouncilList() {
    try {
        const response = await apiClient.get('/councils');
        console.log('Danh sách hội đồng:', response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách hội đồng:', error);
        throw error;
    }
}

export async function getCouncilEvaluations(query?: GetCouncilEvaluationsQueryDto) {
    try {
        const response = await apiClient.get(`/council-evalution`, {
            params: query
        });
        return response.data;
    } catch (error: any) {
        console.error('Lỗi khi lấy danh sách đánh giá hội đồng:', error.response?.data?.message);
        throw new Error(error.response?.data?.message);
    }
}

export async function updateCouncilEvaluation(evalution_id: number, updateCouncilEvalutionDto: any) {
    try {
        const response = await apiClient.patch(`/council-evalution/${evalution_id}`, updateCouncilEvalutionDto);
        console.log('Cập nhật đánh giá hội đồng:', response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật đánh giá hội đồng:', error);
        throw error;
    }
}

export async function createCouncil(data: any) {
    try {
        const response = await apiClient.post('/councils', data);
        return response.data;
    } catch (error: any) {
        console.error('Lỗi khi tạo hội đồng:', error);
        throw error.response?.data?.message || 'Lỗi khi tạo hội đồng';
    }
}

export async function updateCouncil(id: string | number, data: any) {
    try {
        const response = await apiClient.patch(`/councils/${id}`, data);
        return response.data;
    } catch (error: any) {
        console.error('Lỗi khi cập nhật hội đồng:', error);
        throw error.response?.data?.message || 'Lỗi khi cập nhật hội đồng';
    }
}

export async function deleteCouncil(id: string | number) {
    try {
        const response = await apiClient.delete(`/councils/${id}`);
        return response.data;
    } catch (error: any) {
        console.error('Lỗi khi xóa hội đồng:', error);
        throw error.response?.data?.message || 'Lỗi khi xóa hội đồng';
    }
}