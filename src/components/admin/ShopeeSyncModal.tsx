'use client';

import { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Upload, 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  X,
  FileCode
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ShopeeSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ShopeeSyncModal({ isOpen, onClose, onSuccess }: ShopeeSyncModalProps) {
  const [activeTab, setActiveTab] = useState<'console' | 'file' | 'clear'>('console');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileJson, setFileJson] = useState<any[] | null>(null);
  const [fileName, setFileName] = useState<string>('');

  if (!isOpen) return null;

  const consoleSnippet = `(async () => {
  console.log("Mengambil seluruh produk toko 0meg4t0y5...");
  const shopId = 797468204;
  let allItems = [];
  for (let offset = 0; offset <= 120; offset += 60) {
    const res = await fetch(\`https://shopee.co.id/api/v4/search/search_items?by=pop&limit=60&match_id=\${shopId}&newest=\${offset}&order=desc&page_type=shop&scenario=PAGE_OTHERS&version=2\`, {
      headers: { 'x-api-source': 'pc', 'x-shopee-language': 'id', 'accept': 'application/json' },
      credentials: 'include'
    });
    const json = await res.json();
    if (json.items) allItems.push(...json.items);
  }
  console.log(\`Ditemukan \${allItems.length} produk! Mengirim langsung ke e-katalog...\`);
  const postRes = await fetch('http://localhost:8000/api/admin/shopee/reset-and-import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: allItems })
  });
  const postJson = await postRes.json();
  alert(postJson.message || 'Sukses mengimpor produk Shopee!');
  location.reload();
})();`;

  const handleCopy = () => {
    navigator.clipboard.writeText(consoleSnippet);
    setCopied(true);
    toast.success('Kode skrip disalin ke clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const json = JSON.parse(text);
        const items = Array.isArray(json) ? json : (json.items || json.data || []);
        setFileJson(items);
        toast.success(`File berhasil dibaca: ${items.length} item ditemukan`);
      } catch (err) {
        toast.error('Format file JSON tidak valid');
        setFileJson(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImportFile = async () => {
    if (!fileJson || fileJson.length === 0) {
      toast.error('Tidak ada data produk untuk diimpor');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.admin.resetAndImportShopee(fileJson);
      if (res && res.status === 'success') {
        toast.success(res.message);
        onSuccess();
        onClose();
      } else {
        toast.error(res?.message || 'Gagal mengimpor produk');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat mengimpor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('PERINGATAN: Semua data produk, kategori, dan pesanan akan dihapus bersih. Lanjutkan?')) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.admin.clearCatalogData();
      if (res && res.status === 'success') {
        toast.success(res.message);
        onSuccess();
        onClose();
      } else {
        toast.error('Gagal mengosongkan katalog');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat mengosongkan data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-foreground">
                Sinkronisasi & Impor Toko Shopee (0meg4t0y5)
              </h2>
              <p className="text-xs text-muted-foreground">
                Reset database dan masukkan produk resmi dari toko Shopee Anda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b bg-muted/30 px-5 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('console')}
            className={`py-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'console'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>1. Sinkronisasi via Browser (Instan)</span>
          </button>

          <button
            onClick={() => setActiveTab('file')}
            className={`py-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'file'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>2. Unggah File JSON/CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('clear')}
            className={`py-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'clear'
                ? 'border-destructive text-destructive'
                : 'border-transparent text-muted-foreground hover:text-destructive'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>3. Kosongkan Data Saja</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'console' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cara Paling Cepat & Otomatis (3 Detik):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground leading-relaxed pl-1">
                  <li>
                    Buka toko Anda di browser: {' '}
                    <a
                      href="https://shopee.co.id/0meg4t0y5"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold underline inline-flex items-center gap-1"
                    >
                      shopee.co.id/0meg4t0y5 <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Tekan tombol <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">F12</kbd> (atau Klik Kanan &gt; Inspect) lalu pilih tab <strong>Console</strong>.</li>
                  <li>Salin dan tempel (Paste) kode skrip di bawah ini lalu tekan <strong>Enter</strong>.</li>
                  <li>Seluruh 107 produk, gambar asli beresolusi tinggi, harga, dan kategori akan langsung terkirim & tersimpan ke e-katalog Anda!</li>
                </ol>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-border">
                  {consoleSnippet}
                </pre>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Kode Skrip'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'file' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-muted/40 border space-y-2">
                <p className="font-bold text-foreground">
                  Unggah File Data Produk Shopee
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Pilih file JSON hasil scraping atau ekspor data produk untuk diimpor secara otomatis ke database.
                </p>
              </div>

              <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center space-y-3 hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground">
                    {fileName || 'Pilih file JSON data produk'}
                  </p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    {fileJson ? `${fileJson.length} produk siap diimpor` : 'Mendukung format JSON Shopee API'}
                  </p>
                </div>
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="shopee-file-input"
                />
                <Button asChild variant="outline" size="sm" className="rounded-xl cursor-pointer">
                  <label htmlFor="shopee-file-input">
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Pilih File
                  </label>
                </Button>
              </div>

              {fileJson && fileJson.length > 0 && (
                <Button
                  onClick={handleImportFile}
                  disabled={isLoading}
                  className="w-full rounded-xl font-bold gap-2 py-3 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Impor {fileJson.length} Produk Sekarang</span>
                </Button>
              )}
            </div>
          )}

          {activeTab === 'clear' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/20 space-y-3">
                <div className="flex items-center gap-2 text-destructive font-black text-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Kosongkan Seluruh Data Katalog</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Tindakan ini akan menghapus semua produk, gambar, kategori, dan pesanan simulasi lama di database sehingga e-katalog menjadi kosong dan bersih.
                </p>
                <p className="text-[11px] text-muted-foreground font-semibold">
                  Akun Admin, pengaturan sistem, dan log audit akan tetap aman dan tidak terhapus.
                </p>
              </div>

              <Button
                variant="destructive"
                onClick={handleClearAll}
                disabled={isLoading}
                className="w-full rounded-xl font-bold gap-2 py-3 cursor-pointer"
              >
                <Trash2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Sedang Membersihkan...' : 'Konfirmasi & Kosongkan Data Sekarang'}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/10 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
