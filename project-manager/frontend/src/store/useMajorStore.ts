import { create } from 'zustand';
import { getMajorList, createMajor, updateMajor } from '@/services/major.service';
import { Major, CreateMajorDto } from '@/type/major';
import { toast } from 'sonner';

interface MajorStore {
    majors: Major[];
    isLoading: boolean;
    fetchMajors: (force?: boolean) => Promise<void>;
    createNewMajor: (data: CreateMajorDto) => Promise<void>;
    updateExistingMajor: (id: string, data: CreateMajorDto) => Promise<void>;
}

export const useMajorStore = create<MajorStore>((set, get) => ({
    majors: [],
    isLoading: false,

    fetchMajors: async (force = false) => {
        if (get().majors.length > 0 && !force) {
            return;
        }

        set({ isLoading: true });
        try {
            const res = await getMajorList();
            set({ majors: res || [] });
        } catch (error) {
            console.error('Lỗi khi tải danh sách chuyên ngành:', error);
            toast.error('Không thể tải danh sách chuyên ngành.');
        } finally {
            set({ isLoading: false });
        }
    },

    createNewMajor: async (data: CreateMajorDto) => {
        try {
            await createMajor(data);
            toast.success('Thêm chuyên ngành mới thành công!');
            await get().fetchMajors(true);
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Thêm chuyên ngành thất bại!';
            toast.error(msg);
            throw error;
        }
    },

    updateExistingMajor: async (id: string, data: CreateMajorDto) => {
        try {
            await updateMajor(id, data);
            toast.success('Cập nhật chuyên ngành thành công!');
            await get().fetchMajors(true);
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Cập nhật chuyên ngành thất bại!';
            toast.error(msg);
            throw error;
        }
    },
}));
