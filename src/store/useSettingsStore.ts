import { create } from 'zustand';
import { APP_CONFIG } from '@/lib/constants';

interface SettingsState {
  storeName: string;
  storeDescription: string;
  whatsappNumber: string;
  contactEmail: string;
  address: string;
  loaded: boolean;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  storeName: APP_CONFIG.name,
  storeDescription: APP_CONFIG.description,
  whatsappNumber: APP_CONFIG.defaultWhatsApp,
  contactEmail: APP_CONFIG.contactEmail,
  address: '',
  loaded: false,

  loadSettings: async () => {
    // Avoid duplicate fetches
    if (get().loaded) return;
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'https://api-omegatoys.luvion.my.id/api').replace(/\/api\/?$/, '');
      const res = await fetch(`${apiBase}/api/settings`);
      if (!res.ok) throw new Error(`Settings fetch failed: ${res.status}`);
      const json = await res.json();
      const s = json?.data || json || {};
      set({
        storeName: s.store_name || get().storeName,
        storeDescription: s.store_description || get().storeDescription,
        whatsappNumber: s.whatsapp_number || get().whatsappNumber,
        contactEmail: s.contact_email || get().contactEmail,
        address: s.address || get().address,
        loaded: true,
      });
    } catch (err) {
      console.error('[useSettingsStore] Failed to load settings:', err);
      // Keep defaults, mark loaded to avoid retry spam
      set({ loaded: true });
    }
  },
}));
