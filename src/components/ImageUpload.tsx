import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ImageUploadProps = {
  onImagesUploaded: (urls: string[]) => void;
  existingImages?: string[];
};

export function ImageUpload({ onImagesUploaded, existingImages = [] }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>(existingImages);

  useEffect(() => {
    setPreviewUrls(existingImages);
  }, [existingImages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    console.log('Starting upload, files:', files.length);
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = fileName;

        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Upload error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          alert(`Failed to upload ${file.name}: ${error.message}\n\nCheck console for details.`);
          continue;
        } else {
          console.log('Upload successful:', data);
        }

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(data.path);

          uploadedUrls.push(publicUrl);
        }
      }

      const allUrls = [...previewUrls, ...uploadedUrls];
      console.log('Upload complete, all URLs:', allUrls);
      setPreviewUrls(allUrls);
      onImagesUploaded(allUrls);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newUrls);
    onImagesUploaded(newUrls);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="flex-1 cursor-pointer">
          <div className="border-2 border-dashed border-stone-300 hover:border-amber-600 transition-colors p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-stone-400" />
            <p className="text-sm text-stone-600 mb-1">
              {uploading ? 'Uploading...' : 'Click to upload images'}
            </p>
            <p className="text-xs text-stone-500">JPG, PNG, WebP, or HEIC (max 5MB each)</p>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover border border-stone-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-amber-600 text-white text-xs px-2 py-1">
                  Cover
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
