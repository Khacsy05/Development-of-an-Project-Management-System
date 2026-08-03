import apiClient from "@/lib/apiClient";
import { GetCapstoneRequestQueryDto, GetCapstonesQueryDto, GetCapstonesRequestUpdateDto } from "@/type/capstone";

export async function createCapstone() {
    try {
        const response = await apiClient.post('/capstones')
        return response.data
    } catch (error: any) {
        console.error('Lỗi khi tạo đồ án:', error.response?.data?.message);
        throw new Error(error.response?.data?.message);
    }
}

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

export async function updatedCapstone(id: string, data: any) {
    try {
        const response = await apiClient.patch(`/capstones/${id}`, data);
        return response.data
    } catch (error: any) {
        console.error('Lỗi khi tạo yêu cầu đồ án:', error.response?.data?.message);
        throw new Error(error.response?.data?.message);
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

export async function updateCapstoneSubmission(id: string, data: any) {
    try {
        const response = await apiClient.patch(`/capstones-submission/${id}`, data);
        return response.data
    } catch (error) {
        console.error('Lỗi khi cập nhật đồ án:', error);
        throw error;
    }
}



export async function uploadFile(file: File): Promise<{ file_path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export async function getCapstoneSubmissions(params?: {
    lecturer_id?: string;
    milestone_type?: 'progress' | 'final';
    status?: string;
    has_file?: boolean;
    page?: number;
    limit?: number;
}) {
    try {
        const response = await apiClient.get('/capstones-submission', { params });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bài nộp:', error);
        throw error;
    }
}

export async function assignCouncil(capstoneId: string, council_id: string) {
    try {
        const response = await apiClient.patch(`/capstones/${capstoneId}/assignCouncil`, { council_id });
        return response.data
    } catch (error) {
        console.error('Lỗi khi gán hội đồng:', error);
        throw error;
    }
}