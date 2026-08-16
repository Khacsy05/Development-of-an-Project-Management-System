import apiClient from "@/lib/apiClient";

export async function getMyExpertises() {
    try {
        const response = await apiClient.get('/lecturer-expertise/my');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy chuyên môn cá nhân:', error);
        throw error;
    }
}

export async function saveMyExpertises(expertiseIds: string[]) {
    try {
        const response = await apiClient.post('/lecturer-expertise/my', {
            expertise_ids: expertiseIds
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lưu chuyên môn cá nhân:', error);
        throw error;
    }
}
