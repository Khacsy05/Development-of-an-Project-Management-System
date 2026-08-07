import { getExpertiseList } from '@/services/expertise.service';
import { create } from 'zustand';

interface CacheStore {
    stats: any | null;
    confirmRequests: any[] | null;
    reports: any[] | null;
    grades: any[] | null;
    reviews: any[] | null;
    cancels: any[] | null;
    expertises: any[] | null;
    facultyStats: any | null;

    setStats: (stats: any) => void;
    setConfirmRequests: (requests: any[] | null) => void;
    setReports: (reports: any[] | null) => void;
    setGrades: (grades: any[] | null) => void;
    setReviews: (reviews: any[] | null) => void;
    setCancels: (cancels: any[] | null) => void;
    fetchExpertises: () => Promise<any[]>;
    setExpertises: (expertises: any[] | null) => void;
    setFacultyStats: (stats: any) => void;
    clearCache: () => void;
}

export const useCacheStore = create<CacheStore>((set, get) => ({
    stats: null,
    confirmRequests: null,
    reports: null,
    grades: null,
    reviews: null,
    cancels: null,
    expertises: null,
    facultyStats: null,

    setStats: (stats) => set({ stats }),
    setConfirmRequests: (confirmRequests) => set({ confirmRequests }),
    setReports: (reports) => set({ reports }),
    setGrades: (grades) => set({ grades }),
    setReviews: (reviews) => set({ reviews }),
    setCancels: (cancels) => set({ cancels }),
    setExpertises: (expertises) => set({ expertises }),
    setFacultyStats: (facultyStats) => set({ facultyStats }),
    fetchExpertises: async () => {
        const { expertises } = get();
        // 1. Nếu đã có dữ liệu trong cache toàn cục thì trả về ngay lập tức, không gọi API nữa
        if (expertises) return expertises;
        // 2. Nếu chưa có, gọi API lấy danh sách và lưu vào cache
        try {
            const res = await getExpertiseList();
            const data = Array.isArray(res) ? res : (res?.data || []);
            set({ expertises: data });
            return data;
        } catch (error) {
            console.error("Lỗi khi tải chuyên môn:", error);
            return [];
        }
    },
    clearCache: () => set({
        stats: null,
        confirmRequests: null,
        reports: null,
        grades: null,
        reviews: null,
        cancels: null,
        expertises: null,
        facultyStats: null,
    })
}));
