import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Student' | 'Lecturer';
    isDean: boolean;
    exp: number;
}

interface AuthStore {
    accessToken: string | null;
    role: 'Admin' | 'Student' | 'Lecturer' | null;
    userId: string | null;
    isDean: boolean | null;
    sidebarMode: 'lecturer' | 'dean';
    userName: string | null;
    userEmail: string | null;
    isInitializing: boolean;

    setAuth: (accessToken: string) => void;
    logout: () => void;
    setIsInitializing: (status: boolean) => void;
    setSidebarMode: (mode: 'lecturer' | 'dean') => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    accessToken: null,
    role: null,
    userId: null,
    isDean: null,
    sidebarMode: 'lecturer',
    userName: null,
    userEmail: null,
    isInitializing: true,

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
        isInitializing: false,
    }),

    setIsInitializing: (status: boolean) => set({ isInitializing: status }),
    setSidebarMode: (mode: 'lecturer' | 'dean') => set({ sidebarMode: mode })
}))