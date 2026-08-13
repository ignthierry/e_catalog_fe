'use client';

import { useState } from 'react';
import { Share2, Link2, Check, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProductShareButtonsProps {
  productName: string;
}

export function ProductShareButtons({ productName }: ProductShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Tautan produk berhasil disalin!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `https://wa.me/?text=${encodeURIComponent(
        `Lihat mainan keren ini di OMEGA TOYS: ${productName}\n${window.location.href}`
      )}`;
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
        <Share2 className="w-3.5 h-3.5" /> Bagikan:
      </span>

      <button
        onClick={handleShareWhatsApp}
        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        WhatsApp
      </button>

      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Link2 className="w-3.5 h-3.5" />}
        {copied ? 'Tersalin' : 'Salin Link'}
      </button>
    </div>
  );
}
