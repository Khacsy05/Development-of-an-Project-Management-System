import { create } from 'zustand';
import { getCapstoneByUser } from '@/services/capstone.service';
import { getMilestoneList } from '@/services/milestone.service';
import { Capstone } from '@/type/capstone';
import { Milestone } from '@/type/milestone';

interface CapstoneStore {
    capstone: Capstone | null;
    milestones: Milestone[];
    isLoading: boolean;
    error: string | null;
    fetchCapstone: (userId: string, force?: boolean) => Promise<void>;
    fetchMilestones: (force?: boolean) => Promise<void>;
    setCapstone: (capstone: Capstone | null) => void;
    clearCapstone: () => void;
}

export const useCapstoneStore = create<CapstoneStore>((set, get) => ({
    capstone: null,
    milestones: [],
    isLoading: false,
    error: null,

    fetchCapstone: async (userId: string, force = false) => {
        // Tránh gọi API trùng lặp nếu dữ liệu đã được tải rồi (trừ khi ép buộc tải lại qua tham số force)
        if (get().capstone && !force) {
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const data = await getCapstoneByUser(userId);
            set({ capstone: data, isLoading: false });
        } catch (err: any) {
            console.error('Lỗi khi tải thông tin đồ án từ Store:', err);
            set({ 
                error: err?.message || 'Không thể tải thông tin đồ án', 
                isLoading: false,
                capstone: null // Reset về null nếu không tìm thấy hoặc lỗi
            });
        }
    },

    fetchMilestones: async (force = false) => {
        if (get().milestones.length > 0 && !force) {
            return;
        }
        try {
            const data = await getMilestoneList();
            const sortedMilestones = (data || []).sort(
                (a: Milestone, b: Milestone) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
            );
            set({ milestones: sortedMilestones });
        } catch (err: any) {
            console.error('Lỗi khi tải mốc thời gian từ Store:', err);
        }
    },

    setCapstone: (capstone) => set({ capstone }),
    clearCapstone: () => set({ capstone: null, milestones: [], error: null, isLoading: false }),
}));
