import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Student' | 'Lecturer';
    exp: number;
}

interface AuthStore {
    accessToken: string | null;
    role: 'Admin' | 'Student' | 'Lecturer' | null;
    userName: string | null;
    userEmail: string | null;
    isInitializing: boolean;

    setAuth: (accessToken: string) => void;
    logout: () => void;
    setIsInitializing: (status: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    accessToken: null,
    role: null,
    userName: null,
    userEmail: null,
    isInitializing: true,

    setAuth: (accessToken: string) => {
        try {
            const decoded = jwtDecode<JwtPayload>(accessToken);
            set({
                accessToken: accessToken,
                role: decoded.role,
                userName: decoded.name,
                userEmail: decoded.email,
                isInitializing: false,
            });
        } catch (error) {
            console.error('Invalid Access Token:', error);
        }
    },

    logout: () => set({
        accessToken: null,
        role: null,
        userName: null,
        userEmail: null,
        isInitializing: false,
    }),

    setIsInitializing: (status: boolean) => set({ isInitializing: status })
}))