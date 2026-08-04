import apiClient from "@/lib/apiClient";
export async function getExpertiseList() {
    try {
        const response = await apiClient.get('/expertises');
        return response.data;
    } catch (error) {
        console.log(error);
    }
}