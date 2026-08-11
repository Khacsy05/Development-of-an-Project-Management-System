import { create } from 'zustand';
import { getUserList, createUser, updateUser } from '@/services/user.service';
import { User, UserQuery, UserCreatePayload, UserUpdatePayload } from '@/type/user';
import { toast } from 'sonner';

interface UserStore {
    users: User[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    isLoading: boolean;
    lastQuery: UserQuery | null;
    fetchUsersList: (query: UserQuery) => Promise<void>;
    createNewUser: (data: UserCreatePayload) => Promise<void>;
    updateExistingUser: (id: string, data: UserUpdatePayload) => Promise<void>;
    toggleUserActiveStatus: (id: string, currentStatus: boolean) => Promise<void>;
    setCurrentPage: (page: number) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
    users: [],
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    isLoading: false,
    lastQuery: null,

    fetchUsersList: async (query: UserQuery) => {
        // Nếu đã có dữ liệu và tham số tìm kiếm/phân trang giống hệt lần trước -> Không gọi lại API nữa
        if (get().users.length > 0 && JSON.stringify(query) === JSON.stringify(get().lastQuery)) {
            return;
        }

        if (get().users.length === 0) {
            set({ isLoading: true });
        }
        try {
            const res = await getUserList(query);
            set({
                users: res.data || [],
                totalItems: res.pagination?.total || 0,
                totalPages: res.pagination?.totalPages || 1,
                currentPage: res.pagination?.page || 1,
                lastQuery: query,
            });
        } catch (error: any) {
            console.error('Lỗi khi tải danh sách người dùng:', error);
            toast.error('Không thể tải danh sách tài khoản.');
        } finally {
            set({ isLoading: false });
        }
    },

    createNewUser: async (data: UserCreatePayload) => {
        try {
            await createUser(data);
            toast.success('Thêm tài khoản mới thành công!');
            set({ lastQuery: null }); // Invalidate cache để buộc phải tải lại danh sách mới
        } catch (error: any) {
            toast.error(error.message || 'Thêm tài khoản thất bại!');
            throw error;
        }
    },

    updateExistingUser: async (id: string, data: UserUpdatePayload) => {
        try {
            await updateUser(id, data);
            toast.success('Cập nhật tài khoản thành công!');
            set({ lastQuery: null }); // Invalidate cache để tải lại danh sách cập nhật
            set((state) => ({
                users: state.users.map((u) => (u.user_id === id ? { ...u, ...data } : u)),
            }));
        } catch (error: any) {
            toast.error(error.message || 'Cập nhật tài khoản thất bại!');
            throw error;
        }
    },

    toggleUserActiveStatus: async (id: string, currentStatus: boolean) => {
        const nextStatus = !currentStatus;
        try {
            await updateUser(id, { is_active: nextStatus });
            toast.success(nextStatus ? 'Kích hoạt tài khoản thành công!' : 'Vô hiệu hóa tài khoản thành công!');
            set({ lastQuery: null }); // Invalidate cache
            set((state) => ({
                users: state.users.map((u) => (u.user_id === id ? { ...u, is_active: nextStatus } : u)),
            }));
        } catch (error: any) {
            toast.error(error.message || 'Thay đổi trạng thái thất bại!');
            throw error;
        }
    },

    setCurrentPage: (page: number) => set({ currentPage: page }),
}));
