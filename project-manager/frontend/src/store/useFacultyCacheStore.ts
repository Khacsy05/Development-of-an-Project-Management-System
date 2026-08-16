import { create } from 'zustand';

interface FacultyCacheStore {
    stats: any | null;
    topicsCache: Map<string, any>;
    councilsCache: Map<string, any>;
    councilsAssignCache: Map<string, any>;
    milestonesCache: Map<string, any[]>;
    approveCache: Map<string, any>;
    semestersList: any[] | null;
    selectedSemesterId: string;

    setStats: (stats: any) => void;
    setTopicsCache: (key: string, data: any) => void;
    setCouncilsCache: (key: string, data: any) => void;
    setCouncilsAssignCache: (key: string, data: any) => void;
    setMilestonesCache: (key: string, list: any[]) => void;
    setApproveCache: (key: string, data: any) => void;
    setSemestersList: (list: any[] | null) => void;
    setSelectedSemesterId: (id: string) => void;
    clearTopicsCache: () => void;
    clearCouncilsCache: () => void;
    clearCouncilsAssignCache: () => void;
    clearMilestonesCache: () => void;
    clearApproveCache: () => void;
    clearFacultyCache: () => void;
}

export const useFacultyCacheStore = create<FacultyCacheStore>((set, get) => ({
    stats: null,
    topicsCache: new Map(),
    councilsCache: new Map(),
    councilsAssignCache: new Map(),
    milestonesCache: new Map(),
    approveCache: new Map(),
    semestersList: null,
    selectedSemesterId: '',

    setStats: (stats) => set({ stats }),
    setTopicsCache: (key, data) => {
        const cache = new Map(get().topicsCache);
        cache.set(key, data);
        set({ topicsCache: cache });
    },
    setCouncilsCache: (key, data) => {
        const cache = new Map(get().councilsCache);
        cache.set(key, data);
        set({ councilsCache: cache });
    },
    setCouncilsAssignCache: (key, data) => {
        const cache = new Map(get().councilsAssignCache);
        cache.set(key, data);
        set({ councilsAssignCache: cache });
    },
    setMilestonesCache: (key, list) => {
        const cache = new Map(get().milestonesCache);
        cache.set(key, list);
        set({ milestonesCache: cache });
    },
    setApproveCache: (key, data) => {
        const cache = new Map(get().approveCache);
        cache.set(key, data);
        set({ approveCache: cache });
    },
    setSemestersList: (semestersList) => set({ semestersList }),
    setSelectedSemesterId: (selectedSemesterId) => set({ selectedSemesterId }),
    clearTopicsCache: () => set({ topicsCache: new Map() }),
    clearCouncilsCache: () => set({ councilsCache: new Map() }),
    clearCouncilsAssignCache: () => set({ councilsAssignCache: new Map() }),
    clearMilestonesCache: () => set({ milestonesCache: new Map() }),
    clearApproveCache: () => set({ approveCache: new Map() }),
    clearFacultyCache: () => set({
        stats: null,
        topicsCache: new Map(),
        councilsCache: new Map(),
        councilsAssignCache: new Map(),
        milestonesCache: new Map(),
        approveCache: new Map(),
        semestersList: null,
        selectedSemesterId: '',
    })
}));
