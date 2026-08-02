import apiClient from "@/lib/apiClient";

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

export async function getCouncilList(faculty_id?: string) {
    try {
        const response = await apiClient.get('/councils', {
            params: {
                faculty_id
            }
        });
        console.log('Danh sách hội đồng:', response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách hội đồng:', error);
        throw error;
    }
}

export async function getCouncilEvaluations(lecturer_id?: string) {
    try {
        const response = await apiClient.get(`/council-evalution`, {
            params: {
                lecturer_id
            }
        });
        console.log('Danh sách đánh giá hội đồng:', response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đánh giá hội đồng:', error);
        throw error;
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