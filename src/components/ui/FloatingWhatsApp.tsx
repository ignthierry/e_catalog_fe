'use client';

import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { APP_CONFIG } from '@/lib/constants';
import { getWhatsAppLink } from '@/lib/whatsapp';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useEffect } from 'react';

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const whatsappNumber = useSettingsStore((s) => s.whatsappNumber);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const whatsappUrl = getWhatsAppLink(
    encodeURIComponent(`Halo ${APP_CONFIG.name}! Saya ingin bertanya seputar katalog mainan. 🎮`),
    whatsappNumber
  );

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hubungi kami via WhatsApp"
      className="fixed bottom-20 lg:bottom-6 right-6 z-40 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#20ba5a] hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group"
    >
      <MessageCircle className="w-6 h-6 animate-pulse" />
      <span className="text-sm font-semibold hidden sm:inline-block max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
        Chat Admin
      </span>
    </a>
  );
}
