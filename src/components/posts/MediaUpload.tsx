import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X, Loader2, Crop, Plus, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

interface MediaUploadProps {
  onMediaUploaded: (urls: string[]) => void;
  existingMedia?: string[];
  maxFiles?: number;
}

interface CropState {
  file: File;
  preview: string;
  scale: number;
  x: number;
  y: number;
}

export function MediaUpload({ onMediaUploaded, existingMedia = [], maxFiles = 10 }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>(existingMedia);
  const [cropDialog, setCropDialog] = useState<CropState | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxFiles - mediaUrls.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    if (filesToProcess.length === 0) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Store files for processing
    setPendingFiles(filesToProcess);
    
    // Open crop dialog for first file
    const firstFile = filesToProcess[0];
    const preview = URL.createObjectURL(firstFile);
    setCropDialog({
      file: firstFile,
      preview,
      scale: 1,
      x: 0,
      y: 0
    });
  };

  const compressImage = async (file: File, maxSizeKB: number = 500): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Scale down if too large
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress with quality adjustment
        let quality = 0.9;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              if (blob.size > maxSizeKB * 1024 && quality > 0.1) {
                quality -= 0.1;
                tryCompress();
              } else {
                resolve(blob);
              }
            },
            'image/jpeg',
            quality
          );
        };
        
        tryCompress();
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const processAndUpload = async (file: File, scale: number = 1) => {
    try {
      // Compress image
      const compressedBlob = await compressImage(file);
      
      const fileExt = 'jpg';
      const fileName = `${Math.random().toString(36).substr(2, 9)}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(fileName, compressedBlob, {
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  };

  const handleCropConfirm = async () => {
    if (!cropDialog) return;

    setUploading(true);
    
    try {
      // Process current file
      const url = await processAndUpload(cropDialog.file, cropDialog.scale);
      const newUrls = [...mediaUrls, url];
      
      // Process remaining files
      const remainingFiles = pendingFiles.slice(1);
      for (const file of remainingFiles) {
        const fileUrl = await processAndUpload(file);
        newUrls.push(fileUrl);
      }
      
      setMediaUrls(newUrls);
      onMediaUploaded(newUrls);
      toast.success(`${pendingFiles.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload some images');
    } finally {
      setUploading(false);
      setCropDialog(null);
      setPendingFiles([]);
      if (cropDialog.preview) {
        URL.revokeObjectURL(cropDialog.preview);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropCancel = () => {
    if (cropDialog?.preview) {
      URL.revokeObjectURL(cropDialog.preview);
    }
    setCropDialog(null);
    setPendingFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index: number) => {
    const newMediaUrls = mediaUrls.filter((_, i) => i !== index);
    setMediaUrls(newMediaUrls);
    onMediaUploaded(newMediaUrls);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading || mediaUrls.length >= maxFiles}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || mediaUrls.length >= maxFiles}
          className="gap-2"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
          Add Photos ({mediaUrls.length}/{maxFiles})
        </Button>
      </div>

      {/* Media Grid */}
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {mediaUrls.map((url, index) => (
            <div key={index} className="relative aspect-square group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeMedia(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {mediaUrls.length < maxFiles && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
              disabled={uploading}
            >
              <Plus className="h-8 w-8 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {/* Crop Dialog */}
      <Dialog open={!!cropDialog} onOpenChange={(open) => !open && handleCropCancel()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Image</DialogTitle>
          </DialogHeader>
          {cropDialog && (
            <div className="space-y-4">
              <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                <img
                  ref={imageRef}
                  src={cropDialog.preview}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                  style={{
                    transform: `scale(${cropDialog.scale})`
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Zoom</label>
                <Slider
                  value={[cropDialog.scale]}
                  onValueChange={([value]) => setCropDialog(prev => prev ? { ...prev, scale: value } : null)}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>
              {pendingFiles.length > 1 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{pendingFiles.length - 1} more image(s) will be uploaded
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCropCancel}>
              Cancel
            </Button>
            <Button onClick={handleCropConfirm} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}