import { APP_CONFIG } from './constants';
import { CartItem } from '@/types';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const generateWhatsAppMessage = (items: CartItem[], totalAmount: number): string => {
  let message = `Halo ${APP_CONFIG.name}! 🎮\n`;
  message += `Saya ingin memesan:\n\n`;
  
  items.forEach((item, index) => {
    let variantText = '';
    if (item.selectedVariants && Object.keys(item.selectedVariants).length > 0) {
      const variants = Object.entries(item.selectedVariants)
        .map(([_, val]) => val)
        .join(', ');
      variantText = ` (${variants})`;
    }
    
    message += `${index + 1}. ${item.name}${variantText}\n`;
    message += `   ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.quantity * item.price)}\n\n`;
  });
  
  message += `*Total: ${formatCurrency(totalAmount)}*\n\n`;
  message += `Mohon info untuk proses selanjutnya. Terima kasih! 🙏`;
  
  return encodeURIComponent(message);
};

export const getWhatsAppLink = (message: string, phone: string = APP_CONFIG.defaultWhatsApp): string => {
  // Clean phone number (remove +, spaces, dashes)
  const cleanPhone = phone.replace(/[\s\-\+]/g, '');
  return `https://wa.me/${cleanPhone}?text=${message}`;
};
