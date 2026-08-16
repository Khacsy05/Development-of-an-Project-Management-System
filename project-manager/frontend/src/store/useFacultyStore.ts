import { create } from 'zustand';
import { getFacultyList, createFaculty, updateFaculty } from '@/services/faculty.service';
import { Faculty, CreateFacultyDto } from '@/type/faculty';
import { toast } from 'sonner';

interface FacultyStore {
    faculties: Faculty[];
    isLoading: boolean;
    fetchFaculties: (force?: boolean) => Promise<void>;
    createNewFaculty: (data: CreateFacultyDto) => Promise<void>;
    updateExistingFaculty: (id: string, data: CreateFacultyDto) => Promise<void>;
}

export const useFacultyStore = create<FacultyStore>((set, get) => ({
    faculties: [],
    isLoading: false,

    fetchFaculties: async (force = false) => {
        // Caching: Tránh gọi lại API nếu đã có dữ liệu và không bắt buộc force load
        if (get().faculties.length > 0 && !force) {
            return;
        }

        set({ isLoading: true });
        try {
            const res = await getFacultyList();
            set({ faculties: res || [] });
        } catch (error) {
            console.error('Lỗi khi tải danh sách khoa:', error);
            toast.error('Không thể tải danh sách khoa.');
        } finally {
            set({ isLoading: false });
        }
    },

    createNewFaculty: async (data: CreateFacultyDto) => {
        try {
            await createFaculty(data);
            toast.success('Thêm khoa mới thành công!');
            // Force reload danh sách khoa sau khi tạo mới
            await get().fetchFaculties(true);
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Thêm khoa mới thất bại!';
            toast.error(msg);
            throw error;
        }
    },

    updateExistingFaculty: async (id: string, data: CreateFacultyDto) => {
        try {
            await updateFaculty(id, data);
            toast.success('Cập nhật thông tin khoa thành công!');
            // Force reload danh sách khoa sau khi cập nhật
            await get().fetchFaculties(true);
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Cập nhật khoa thất bại!';
            toast.error(msg);
            throw error;
        }
    },
}));
