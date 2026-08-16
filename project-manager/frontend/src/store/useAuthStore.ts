import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Student' | 'Lecturer';
    isDean: boolean;
    exp: number;
    faculty_id: string | null;
    username: string;
}

interface AuthStore {
    accessToken: string | null;
    role: 'Admin' | 'Student' | 'Lecturer' | null;
    userId: string | null;
    isDean: boolean | null;
    sidebarMode: 'lecturer' | 'dean';
    userName: string | null;
    userEmail: string | null;
    username: string | null;
    isInitializing: boolean;
    faculty_id: string | null;
    isFirstLogin: boolean | null;
    setIsFirstLogin: (isFirstLogin: boolean) => void;
    setAuth: (accessToken: string) => void;
    logout: () => void;
    setIsInitializing: (status: boolean) => void;
    setSidebarMode: (mode: 'lecturer' | 'dean') => void;
    updateUserDetail: (name: string, email: string) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    accessToken: null,
    role: null,
    userId: null,
    isDean: null,
    sidebarMode: 'lecturer',
    userName: null,
    userEmail: null,
    username: null,
    isInitializing: true,
    faculty_id: null,
    isFirstLogin: null,
    setAuth: (accessToken: string) => {
        try {
            const decoded = jwtDecode<JwtPayload>(accessToken);
            set((state) => ({
                accessToken: accessToken,
                role: decoded.role,
                userId: decoded.id,
                isDean: decoded.isDean || false,
                // Giữ nguyên sidebarMode hiện tại nếu có, tránh bị reset khi refresh token
                sidebarMode: state.sidebarMode || 'lecturer',
                userName: decoded.name,
                userEmail: decoded.email,
                username: decoded.username,
                faculty_id: decoded.faculty_id,
                isInitializing: false,
            }));
        } catch (error) {
            console.error('Invalid Access Token:', error);
        }
    },

    logout: () => set({
        accessToken: null,
        role: null,
        userId: null,
        isDean: null,
        sidebarMode: 'lecturer',
        userName: null,
        userEmail: null,
        username: null,
        faculty_id: null,
        isInitializing: false,
        isFirstLogin: null,
    }),

    setIsInitializing: (status: boolean) => set({ isInitializing: status }),
    setSidebarMode: (mode: 'lecturer' | 'dean') => set({ sidebarMode: mode }),
    setIsFirstLogin: (isFirstLogin: boolean) => set({ isFirstLogin: isFirstLogin }),
    updateUserDetail: (name: string, email: string) => set({ userName: name, userEmail: email }),
}))