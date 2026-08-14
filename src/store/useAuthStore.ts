import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isAdmin: () => boolean;
  isCustomer: () => boolean;
  login: (user: Partial<User> | { name: string; role?: string; email?: string; [key: string]: any }, token?: string) => void;
  updateUser: (partialUser: Partial<User>) => void;
  logout: () => void;
}

function normalizeUser(userData: any): User {
  return {
    id: userData.id || '1',
    name: userData.name || '',
    email: userData.email || '',
    phoneNumber: userData.phoneNumber || userData.phone_number || '',
    phone_number: userData.phone_number || userData.phoneNumber || '',
    avatar: userData.avatar || '',
    avatarUrl: userData.avatarUrl || userData.avatar_url || '',
    avatar_url: userData.avatar_url || userData.avatarUrl || '',
    role: userData.role || 'customer',
    address: userData.address || '',
    provinceId: userData.provinceId || userData.province_id || '',
    province_id: userData.province_id || userData.provinceId || '',
    provinceName: userData.provinceName || userData.province_name || '',
    province_name: userData.province_name || userData.provinceName || '',
    cityId: userData.cityId || userData.city_id || '',
    city_id: userData.city_id || userData.cityId || '',
    cityName: userData.cityName || userData.city_name || '',
    city_name: userData.city_name || userData.cityName || '',
    subdistrictId: userData.subdistrictId || userData.subdistrict_id || '',
    subdistrict_id: userData.subdistrict_id || userData.subdistrictId || '',
    subdistrictName: userData.subdistrictName || userData.subdistrict_name || '',
    subdistrict_name: userData.subdistrict_name || userData.subdistrictName || '',
    postalCode: userData.postalCode || userData.postal_code || '',
    postal_code: userData.postal_code || userData.postalCode || '',
    createdAt: userData.createdAt || userData.created_at || '',
    created_at: userData.created_at || userData.createdAt || '',
  };
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
        const fullUser = normalizeUser(userData);
        set({
          isAuthenticated: true,
          user: fullUser,
          token: token !== undefined ? token : get().token,
        });
      },
      updateUser: (partialUser) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const updated = normalizeUser({ ...currentUser, ...partialUser });
        set({
          user: updated,
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
