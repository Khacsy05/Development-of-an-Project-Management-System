import { create } from 'zustand';
import { getClassList, createClass, updateClass, deleteClass } from '@/services/class.service';
import { Class, ClassQueryDto, ClassCreatePayload, ClassUpdatePayload } from '@/type/class';
import { toast } from 'sonner';

interface ClassStore {
    classes: Class[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    isLoading: boolean;
    lastQuery: ClassQueryDto | null;
    fetchClassesList: (query: ClassQueryDto) => Promise<void>;
    createNewClass: (data: ClassCreatePayload) => Promise<void>;
    updateExistingClass: (id: string, data: ClassUpdatePayload) => Promise<void>;
    deleteExistingClass: (id: string) => Promise<void>;
    setCurrentPage: (page: number) => void;
}

export const useClassStore = create<ClassStore>((set, get) => ({
    classes: [],
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    isLoading: false,
    lastQuery: null,

    fetchClassesList: async (query: ClassQueryDto) => {
        // Tránh gọi lại API nếu tham số tìm kiếm/phân trang giống hệt lần trước
        if (get().classes.length > 0 && JSON.stringify(query) === JSON.stringify(get().lastQuery)) {
            return;
        }

        if (get().classes.length === 0) {
            set({ isLoading: true });
        }
        try {
            const res = await getClassList(query);
            set({
                classes: res.data || [],
                totalItems: res.pagination?.total || 0,
                totalPages: res.pagination?.totalPages || 1,
                currentPage: res.pagination?.page || 1,
                lastQuery: query,
            });
        } catch (error: any) {
            console.error('Lỗi khi tải danh sách lớp học:', error);
            toast.error('Không thể tải danh sách lớp học.');
        } finally {
            set({ isLoading: false });
        }
    },

    createNewClass: async (data: ClassCreatePayload) => {
        try {
            await createClass(data);
            toast.success('Thêm lớp học mới thành công!');
            set({ lastQuery: null }); // Invalidate cache để tải lại danh sách mới
        } catch (error: any) {
            toast.error(error.message || 'Thêm lớp học thất bại!');
            throw error;
        }
    },

    updateExistingClass: async (id: string, data: ClassUpdatePayload) => {
        try {
            await updateClass(id, data);
            toast.success('Cập nhật thông tin lớp học thành công!');
            set({ lastQuery: null }); // Invalidate cache
        } catch (error: any) {
            toast.error(error.message || 'Cập nhật lớp học thất bại!');
            throw error;
        }
    },

    deleteExistingClass: async (id: string) => {
        try {
            await deleteClass(id);
            toast.success('Xóa lớp học thành công!');
            set({ lastQuery: null }); // Invalidate cache
        } catch (error: any) {
            toast.error(error.message || 'Xóa lớp học thất bại!');
            throw error;
        }
    },

    setCurrentPage: (page: number) => set({ currentPage: page }),
}));
