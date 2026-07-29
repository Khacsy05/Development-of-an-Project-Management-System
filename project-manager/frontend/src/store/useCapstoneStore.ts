import { create } from 'zustand';
import { getCapstoneByUser } from '@/services/capstone.service';
import { Capstone } from '@/type/capstone';

interface CapstoneStore {
    capstone: Capstone | null;
    isLoading: boolean;
    error: string | null;
    fetchCapstone: (userId: string, force?: boolean) => Promise<void>;
    setCapstone: (capstone: Capstone | null) => void;
    clearCapstone: () => void;
}

export const useCapstoneStore = create<CapstoneStore>((set, get) => ({
    capstone: null,
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

    setCapstone: (capstone) => set({ capstone }),
    clearCapstone: () => set({ capstone: null, error: null, isLoading: false }),
}));
