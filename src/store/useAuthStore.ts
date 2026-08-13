import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminUser {
  id?: number | string;
  name: string;
  email?: string;
  role?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  user: AdminUser | null;
  token: string | null;
  login: (user: string | AdminUser, token?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      user: null,
      token: null,
      login: (user, token) => {
        if (typeof user === 'string') {
          set({
            isAuthenticated: true,
            username: user,
            user: { name: user },
            token: token || null,
          });
        } else {
          set({
            isAuthenticated: true,
            username: user.name,
            user,
            token: token || null,
          });
        }
      },
      logout: () => {
        set({
          isAuthenticated: false,
          username: null,
          user: null,
          token: null,
        });
      },
    }),
    {
      name: 'omega-admin-auth',
    }
  )
);
