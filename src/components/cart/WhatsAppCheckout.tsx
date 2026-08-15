'use client';

import { useCartStore } from '@/store/useCartStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { generateWhatsAppMessage, getWhatsAppLink } from '@/lib/whatsapp';
import { Button } from '@/components/ui/Button';
import { MessageCircle } from 'lucide-react';
import { useEffect } from 'react';

export function WhatsAppCheckout() {
  const { items, getTotalPrice } = useCartStore();
  const whatsappNumber = useSettingsStore((s) => s.whatsappNumber);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);
  
  const handleCheckout = () => {
    if (items.length === 0) return;
    
    const message = generateWhatsAppMessage(items, getTotalPrice());
    const link = getWhatsAppLink(message, whatsappNumber);
    
    window.open(link, '_blank');
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={items.length === 0}
      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold h-12 gap-2 text-lg"
    >
      <MessageCircle className="w-5 h-5" />
      Order via WhatsApp
    </Button>
  );
}
