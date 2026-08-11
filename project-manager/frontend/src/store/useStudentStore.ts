import { create } from 'zustand';
import { getTopicList } from '@/services/topic.service';
import { getUserList } from '@/services/user.service';
import { Topic } from '@/type/topic';
import { User, UserQuery } from '@/type/user';
import { toast } from 'sonner';

interface StudentStore {
    // Topics Cache
    topics: Topic[];
    topicsTotalItems: number;
    topicsTotalPages: number;
    topicsCurrentPage: number;
    topicsIsLoading: boolean;
    topicsLastQuery: any | null;
    fetchTopics: (query: any) => Promise<void>;
    invalidateTopicsCache: () => void;

    // Lecturers Cache
    lecturers: any[];
    lecturersTotalItems: number;
    lecturersTotalPages: number;
    lecturersCurrentPage: number;
    lecturersIsLoading: boolean;
    lecturersLastQuery: any | null;
    fetchLecturers: (query: UserQuery) => Promise<void>;
    invalidateLecturersCache: () => void;
}

export const useStudentStore = create<StudentStore>((set, get) => ({
    // Topics Initial State
    topics: [],
    topicsTotalItems: 0,
    topicsTotalPages: 1,
    topicsCurrentPage: 1,
    topicsIsLoading: false,
    topicsLastQuery: null,

    // Lecturers Initial State
    lecturers: [],
    lecturersTotalItems: 0,
    lecturersTotalPages: 1,
    lecturersCurrentPage: 1,
    lecturersIsLoading: false,
    lecturersLastQuery: null,

    fetchTopics: async (query: any) => {
        // Tránh gọi lại API nếu tham số tìm kiếm/phân trang giống hệt lần trước
        if (get().topics.length > 0 && JSON.stringify(query) === JSON.stringify(get().topicsLastQuery)) {
            return;
        }

        if (get().topics.length === 0) {
            set({ topicsIsLoading: true });
        }
        try {
            const res = await getTopicList(query);
            set({
                topics: res.data || [],
                topicsTotalItems: res.pagination?.total || 0,
                topicsTotalPages: res.pagination?.totalPages || 1,
                topicsCurrentPage: res.pagination?.page || 1,
                topicsLastQuery: query,
            });
        } catch (error: any) {
            console.error('Lỗi khi tải danh sách đề tài:', error);
            toast.error('Không thể tải danh sách đề tài.');
        } finally {
            set({ topicsIsLoading: false });
        }
    },

    invalidateTopicsCache: () => set({ topicsLastQuery: null }),

    fetchLecturers: async (query: UserQuery) => {
        // Tránh gọi lại API nếu tham số tìm kiếm/phân trang giống hệt lần trước
        if (get().lecturers.length > 0 && JSON.stringify(query) === JSON.stringify(get().lecturersLastQuery)) {
            return;
        }

        if (get().lecturers.length === 0) {
            set({ lecturersIsLoading: true });
        }
        try {
            const res = await getUserList(query);
            set({
                lecturers: res.data || [],
                lecturersTotalItems: res.pagination?.total || 0,
                lecturersTotalPages: res.pagination?.totalPages || 1,
                lecturersCurrentPage: res.pagination?.page || 1,
                lecturersLastQuery: query,
            });
        } catch (error: any) {
            console.error('Lỗi khi tải danh sách giảng viên:', error);
            toast.error('Không thể tải danh sách giảng viên.');
        } finally {
            set({ lecturersIsLoading: false });
        }
    },

    invalidateLecturersCache: () => set({ lecturersLastQuery: null }),
}));
