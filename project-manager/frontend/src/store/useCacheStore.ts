import { create } from 'zustand';

interface CacheStore {
    stats: any | null;
    confirmRequests: any[] | null;
    reports: any[] | null;
    grades: any[] | null;
    reviews: any[] | null;
    cancels: any[] | null;

    setStats: (stats: any) => void;
    setConfirmRequests: (requests: any[] | null) => void;
    setReports: (reports: any[] | null) => void;
    setGrades: (grades: any[] | null) => void;
    setReviews: (reviews: any[] | null) => void;
    setCancels: (cancels: any[] | null) => void;
    clearCache: () => void;
}

export const useCacheStore = create<CacheStore>((set) => ({
    stats: null,
    confirmRequests: null,
    reports: null,
    grades: null,
    reviews: null,
    cancels: null,

    setStats: (stats) => set({ stats }),
    setConfirmRequests: (confirmRequests) => set({ confirmRequests }),
    setReports: (reports) => set({ reports }),
    setGrades: (grades) => set({ grades }),
    setReviews: (reviews) => set({ reviews }),
    setCancels: (cancels) => set({ cancels }),

    clearCache: () => set({
        stats: null,
        confirmRequests: null,
        reports: null,
        grades: null,
        reviews: null,
        cancels: null,
    })
}));
