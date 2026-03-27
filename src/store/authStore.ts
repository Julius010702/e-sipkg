// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'ADMIN_PUSAT' | 'ADMIN_SEKOLAH';

export interface AuthUser {
  userId: string;
  nama: string;
  email: string;
  role: UserRole;
  sekolahId?: string | null;
  sekolahNama?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
      logout: async () => {
        set({ user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('esipkg-auth');
          document.cookie = 'esipkg_token=; Max-Age=0; path=/;';
          window.location.href = '/login';
        }
      },
    }),
    { name: 'esipkg-auth' }
  )
);