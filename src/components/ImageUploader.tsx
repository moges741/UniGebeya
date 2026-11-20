import React, { useRef, useState } from 'react';
import { ImagePlus, Link2, Trash2, Upload } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (nextImages: string[]) => void;
  maxImages?: number;
}

async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read selected file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file format.'));
      img.onload = () => {
        const maxWidth = 760;
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas compression unavailable.'));
          return;
        }
        ctx.fillStyle = '#F2F2F2';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.72;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length > 155000 && quality > 0.3) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        if (dataUrl.length > 175000) {
          reject(new Error('Image is still too large after compression. Choose a smaller photo.'));
          return;
        }
        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 3,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setError(`Maximum of ${maxImages} images allowed per listing.`);
      return;
    }

    const selected = Array.from(fileList).slice(0, remainingSlots);
    setIsProcessing(true);
    try {
      const next = [...images];
      for (const file of selected) {
        if (!file.type.startsWith('image/')) {
          throw new Error(`"${file.name}" is not a supported image file.`);
        }
        if (file.size > 8 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds the 8MB upload limit.`);
        }
        const compressed = await compressImageFile(file);
        next.push(compressed);
      }
      onChange(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddUrl = () => {
    setError(null);
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (images.length >= maxImages) {
      setError(`Maximum of ${maxImages} images allowed.`);
      return;
    }
    if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://') && !trimmed.startsWith('/')) {
      setError('Enter a valid https:// image URL (for example, a Cloudinary URL).');
      return;
    }
    onChange([...images, trimmed]);
    setUrlInput('');
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-4">
      {/* Dropzone & File Picker */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFiles(e.dataTransfer.files);
        }}
        className="border border-dashed border-[#036A39]/35 bg-[#DEE0DF]/45 rounded-xl p-6 text-center transition-colors hover:border-[#036A39]"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <Upload className="w-6 h-6 text-[#036A39] mx-auto mb-2" />
        <p className="text-sm font-medium text-[#023B1F]">
          Upload up to {maxImages} listing photos ({images.length}/{maxImages} added)
        </p>
        <p className="text-xs text-[#023B1F]/70 mt-1 mb-4">
          JPG, PNG, or WebP. Photos are automatically optimized for fast campus mobile loading.
        </p>
        <button
          type="button"
          disabled={isProcessing || images.length >= maxImages}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#F2F2F2] bg-[#036A39] rounded-lg hover:bg-[#024D29] disabled:opacity-50 transition-colors"
        >
          <ImagePlus className="w-4 h-4" />
          {isProcessing ? 'Optimizing photo...' : 'Choose Photos'}
        </button>
      </div>

      {/* Optional Direct URL Input (e.g., Cloudinary) */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Link2 className="w-4 h-4 text-[#036A39]/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Or paste an image URL (e.g., Cloudinary HTTPS URL)"
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F2F2F2] border border-[#036A39]/20 rounded-lg text-[#023B1F] placeholder:text-[#023B1F]/45"
          />
        </div>
        <button
          type="button"
          disabled={images.length >= maxImages || !urlInput.trim()}
          onClick={handleAddUrl}
          className="px-4 py-2 text-xs font-semibold text-[#036A39] border border-[#036A39]/30 rounded-lg hover:bg-[#036A39]/8 disabled:opacity-45 transition-colors whitespace-nowrap shrink-0"
        >
          Add URL
        </button>
      </div>

      {error && <p className="text-xs text-red-700 font-medium">{error}</p>}

      {/* Preview Strip */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((src, idx) => (
            <div
              key={`${idx}-${src.slice(0, 24)}`}
              className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#036A39]/15 bg-[#DEE0DF]"
            >
              <img
                src={src}
                alt={`Listing preview ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2.5 py-1.5 flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#F2F2F2]">
                  {idx === 0 ? 'Cover' : `Photo ${idx + 1}`}
                </span>
                <button
                  type="button"
                  aria-label={`Remove image ${idx + 1}`}
                  onClick={() => handleRemove(idx)}
                  className="p-1 text-[#F2F2F2] hover:text-[#C0A14E] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
