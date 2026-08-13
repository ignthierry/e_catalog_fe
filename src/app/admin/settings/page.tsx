'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState(APP_CONFIG.name);
  const [storeDesc, setStoreDesc] = useState(APP_CONFIG.description);
  const [whatsapp, setWhatsapp] = useState(APP_CONFIG.defaultWhatsApp);

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Informasi toko berhasil disimpan!');
  };

  const handleSaveWA = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Nomor WhatsApp Admin berhasil diperbarui!');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
          Pengaturan
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Konfigurasi informasi toko dan nomor WhatsApp penerima pesanan.
        </p>
      </div>
      
      <form onSubmit={handleSaveStore}>
        <Card className="rounded-2xl border shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">Informasi Toko</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nama Toko
              </label>
              <Input 
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Deskripsi Singkat
              </label>
              <Input 
                value={storeDesc} 
                onChange={(e) => setStoreDesc(e.target.value)} 
              />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 pb-4 bg-muted/20 flex justify-end">
            <Button type="submit" className="gap-2 font-bold shadow-xs">
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </Button>
          </CardFooter>
        </Card>
      </form>
      
      <form onSubmit={handleSaveWA}>
        <Card className="rounded-2xl border shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">Konfigurasi WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nomor WhatsApp Admin (Penerima Pesanan)
              </label>
              <Input 
                value={whatsapp} 
                onChange={(e) => setWhatsapp(e.target.value)} 
                placeholder="Misal: 628123456789" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                Gunakan format kode negara (62...) tanpa spasi atau tanda +.
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 pb-4 bg-muted/20 flex justify-end">
            <Button type="submit" className="gap-2 font-bold shadow-xs bg-[#25D366] hover:bg-[#1fa952] text-white">
              <Save className="w-4 h-4" />
              Simpan Nomor WA
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
