'use client';

import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { Camera, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CameraUploaderProps {
  taskId: number;
  taskType: 'scouting' | 'installation';
  onUploadAction: (formData: FormData) => Promise<any>;
}

export function CameraUploader({ taskId, taskType, onUploadAction }: CameraUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setIsCompressing(true);
    try {
      const options = {
        maxSizeMB: 1, // Aggressive compression for mobile/storage cost
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(selectedFile, options);
      setFile(compressedFile);
      
      // Generate preview
      const previewUrl = URL.createObjectURL(compressedFile);
      setPreview(previewUrl);
    } catch (error) {
      console.error('Error compressing image:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      if (taskType === 'scouting') {
        formData.append('reportId', String(taskId));
      } else {
        formData.append('orderId', String(taskId));
      }

      await onUploadAction(formData);
      
      // Reset
      setFile(null);
      setPreview(null);
      setDescription('');
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {!preview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-brand-cyan/40 bg-brand-cyan/5 text-brand-cyan transition-colors active:bg-brand-cyan/10"
        >
          {isCompressing ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Camera className="h-8 w-8" />
          )}
          <span className="text-sm font-medium">
            {isCompressing ? 'Optimizando imagen...' : 'Tomar Foto'}
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black/5">
            <img src={preview} alt="Preview" className="h-full w-full object-contain" />
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white backdrop-blur-md"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
          </div>
          
          <Input 
            placeholder="Descripción (ej. Tablero principal)" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-12 bg-background text-base"
          />

          <Button 
            onClick={handleUpload} 
            disabled={isUploading}
            className="h-12 w-full bg-brand-cyan font-bold text-primary-foreground hover:bg-brand-cyan/90"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <UploadCloud className="mr-2 h-5 w-5" />
                Subir Foto
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
