'use client';

import { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import { UploadCloud, Link as LinkIcon, X, CheckCircle2, Loader2, Image as ImageIcon, Server, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: 'square' | 'banner' | 'video' | 'cover';
  description?: string;
  required?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  label = 'Gambar',
  aspectRatio = 'square',
  description = 'Format: PNG, JPG, WEBP, GIF (Maks. 10MB)',
  required = false,
}: ImageUploadProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');
  const [isFtpStored, setIsFtpStored] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrlInput(value || '');
    if (value && (value.includes('/storage/uploads/') || value.includes('192.168.1.103') || value.includes('/api/images/'))) {
      setIsFtpStored(true);
    } else {
      setIsFtpStored(false);
    }
  }, [value]);

  const isWide = aspectRatio === 'banner' || aspectRatio === 'video';

  const aspectClass = {
    square: 'aspect-square w-24 h-24',
    banner: 'aspect-[21/9] w-full',
    video: 'aspect-[16/9] w-full',
    cover: 'aspect-[4/3] w-28 h-20',
  }[aspectRatio];

  const handleFileProcess = async (file: File) => {
    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG, PNG, WEBP, GIF)');
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file maksimal adalah 10MB');
      return;
    }

    try {
      setIsUploading(true);
      const res = await api.admin.uploadImage(file);
      
      if (res && res.status === 'success' && res.data?.url) {
        const uploadedUrl = res.data.url;
        onChange(uploadedUrl);
        setUrlInput(uploadedUrl);
        setIsFtpStored(Boolean(res.data.ftp_stored));
        toast.success('Foto berhasil diunggah ke server FTP!', {
          description: res.data.ftp_stored ? 'Tersimpan di server 192.168.1.103' : 'Tersimpan di server web',
        });
      } else {
        const localPreview = URL.createObjectURL(file);
        onChange(localPreview);
        setUrlInput(localPreview);
        toast.warning('Gambar ditampilkan secara lokal');
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      toast.error('Gagal mengunggah gambar ke server FTP');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileProcess(files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileProcess(files[0]);
    }
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      toast.success('URL gambar diterapkan!');
    }
  };

  const handleRemove = () => {
    onChange('');
    setUrlInput('');
    setIsFtpStored(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2.5 w-full">
      {/* Label and Mode Switch */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          {label} {required && <span className="text-destructive">*</span>}
          {isFtpStored && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              <Server className="w-3 h-3" /> Server FTP
            </span>
          )}
        </label>

        {/* Tab switch */}
        <div className="flex bg-muted/60 p-0.5 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === 'url'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            URL Web
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        className="hidden"
      />

      {/* Upload Mode */}
      {activeTab === 'upload' && (
        <div className="space-y-3 w-full">
          {!value ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary bg-primary/10 scale-[0.99]'
                  : 'border-border/80 hover:border-primary/60 hover:bg-muted/30 bg-muted/10'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-foreground">
                  {isUploading ? 'Sedang mengunggah ke server FTP...' : 'Klik atau seret file gambar ke sini'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {description}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                className="mt-1 text-xs font-bold rounded-xl"
              >
                Pilih dari Komputer / HP
              </Button>
            </div>
          ) : (
            /* Preview Container - Responsive Layout */
            <div className="p-3.5 rounded-2xl border border-border/70 bg-muted/20 w-full space-y-3">
              {/* Wide Aspect Preview (Banner / Video) */}
              {isWide ? (
                <div className="space-y-3 w-full">
                  <div className={`${aspectClass} rounded-xl overflow-hidden bg-muted border border-border/80 relative shadow-xs`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={value}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-border/40">
                    <div className="min-w-0 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-foreground block leading-tight">
                          Gambar Siap Ditampilkan
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono truncate block max-w-[280px]">
                          {value}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="h-8 text-xs px-3 font-bold rounded-lg"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" />
                        Ganti Foto
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemove}
                        disabled={isUploading}
                        className="h-8 text-xs px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Compact Aspect Preview (Square / Cover) */
                <div className="flex items-center gap-3.5 w-full">
                  <div className={`${aspectClass} rounded-xl overflow-hidden bg-muted border border-border/80 flex-shrink-0 flex items-center justify-center shadow-xs`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={value}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">Foto Terpasang</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono truncate">
                      {value}
                    </p>
                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="h-7 text-xs px-2.5 font-bold rounded-lg"
                      >
                        Ganti Foto
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemove}
                        disabled={isUploading}
                        className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* URL Mode */}
      {activeTab === 'url' && (
        <div className="space-y-3 w-full">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/... atau http://..."
              className="text-xs bg-background"
            />
            <Button
              type="button"
              onClick={handleUrlApply}
              className="text-xs font-bold flex-shrink-0"
            >
              Terapkan
            </Button>
          </div>

          {value && (
            <div className="p-3.5 rounded-2xl border border-border/70 bg-muted/20 w-full space-y-3">
              {isWide ? (
                <div className="space-y-3 w-full">
                  <div className={`${aspectClass} rounded-xl overflow-hidden bg-muted border border-border/80 shadow-xs`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={value}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                    <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[280px]">
                      {value}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemove}
                      className="h-7 text-xs px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3.5 w-full">
                  <div className={`${aspectClass} rounded-xl overflow-hidden bg-muted border border-border/80 flex-shrink-0 flex items-center justify-center shadow-xs`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={value}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-foreground block">Pratinjau URL Gambar</span>
                    <p className="text-[11px] text-muted-foreground font-mono truncate">
                      {value}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemove}
                      className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg mt-1"
                    >
                      <X className="w-3.5 h-3.5 mr-1" /> Hapus
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
