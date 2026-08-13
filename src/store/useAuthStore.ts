import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isAdmin: () => boolean;
  isCustomer: () => boolean;
  login: (user: User | { name: string; role?: string; email?: string }, token?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isAdmin: () => {
        const user = get().user;
        return Boolean(user && (user.role === 'admin' || user.role === 'warehouse' || user.role === 'cs'));
      },
      isCustomer: () => {
        const user = get().user;
        return Boolean(user && user.role === 'customer');
      },
      login: (userData, token) => {
        const fullUser: User = {
          id: (userData as any).id || '1',
          name: userData.name,
          email: userData.email || '',
          phoneNumber: (userData as any).phoneNumber || (userData as any).phone_number || '',
          role: (userData.role as any) || 'customer',
        };

        set({
          isAuthenticated: true,
          user: fullUser,
          token: token || null,
        });
      },
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        });
      },
    }),
    {
      name: 'omega-app-auth',
    }
  )
);
