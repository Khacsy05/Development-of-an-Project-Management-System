import { create } from 'zustand';

interface FacultyCacheStore {
    stats: any | null;
    topicsCache: Map<string, any>;
    councilsList: any[] | null;
    councilsAssignList: any[] | null;
    milestonesCache: Map<string, any[]>;

    setStats: (stats: any) => void;
    setTopicsCache: (key: string, data: any) => void;
    setCouncilsList: (list: any[] | null) => void;
    setCouncilsAssignList: (list: any[] | null) => void;
    setMilestonesCache: (key: string, list: any[]) => void;
    clearTopicsCache: () => void;
    clearMilestonesCache: () => void;
    clearFacultyCache: () => void;
}

export const useFacultyCacheStore = create<FacultyCacheStore>((set, get) => ({
    stats: null,
    topicsCache: new Map(),
    councilsList: null,
    councilsAssignList: null,
    milestonesCache: new Map(),

    setStats: (stats) => set({ stats }),
    setTopicsCache: (key, data) => {
        const cache = new Map(get().topicsCache);
        cache.set(key, data);
        set({ topicsCache: cache });
    },
    setCouncilsList: (councilsList) => set({ councilsList }),
    setCouncilsAssignList: (councilsAssignList) => set({ councilsAssignList }),
    setMilestonesCache: (key, list) => {
        const cache = new Map(get().milestonesCache);
        cache.set(key, list);
        set({ milestonesCache: cache });
    },
    clearTopicsCache: () => set({ topicsCache: new Map() }),
    clearMilestonesCache: () => set({ milestonesCache: new Map() }),
    clearFacultyCache: () => set({
        stats: null,
        topicsCache: new Map(),
        councilsList: null,
        councilsAssignList: null,
        milestonesCache: new Map(),
    })
}));
