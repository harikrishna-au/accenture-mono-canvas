import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PhotoUploaderProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  accept?: string;
  label?: string;
  hint?: string;
}

const PhotoUploader = ({
  value,
  onChange,
  bucket = 'expert-photos',
  accept = 'image/*',
  label = 'Profile Photo',
  hint,
}: PhotoUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPdf = value?.toLowerCase().endsWith('.pdf');
  const isProof = bucket === 'expert-proofs';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdfFile = file.type === 'application/pdf';

    if (!isImage && !isPdfFile) {
      toast.error('Please select an image or PDF file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filename, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filename);
      onChange(publicUrl);
      toast.success('File uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5 font-['Inter']">
        {label}
      </label>

      {value ? (
        <div className="relative w-24 h-24 group">
          {isPdf ? (
            <div className="w-24 h-24 rounded-2xl bg-stone-100 border border-stone-200 flex flex-col items-center justify-center gap-1">
              <FileText className="w-6 h-6 text-stone-500" />
              <span className="text-[10px] text-stone-500 font-['Inter']">PDF</span>
            </div>
          ) : (
            <img
              src={value}
              alt="Preview"
              className="w-24 h-24 rounded-2xl object-cover border border-stone-200"
            />
          )}
          <div
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/20 transition-colors cursor-pointer flex items-center justify-center"
          >
            <Upload className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-500 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm z-10"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={`rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center gap-1.5 hover:border-stone-400 hover:bg-stone-100 transition-all cursor-pointer ${
            isProof ? 'w-full h-20' : 'w-24 h-24'
          }`}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-stone-400 animate-spin" />
          ) : (
            <>
              {isProof ? (
                <FileText className="w-5 h-5 text-stone-400" />
              ) : (
                <Upload className="w-5 h-5 text-stone-400" />
              )}
              <span className="text-xs text-stone-400 font-['Inter']">
                {isProof ? 'Upload proof (image or PDF)' : 'Upload'}
              </span>
            </>
          )}
        </div>
      )}

      {hint && (
        <p className="text-xs text-stone-400 mt-1 font-['Inter']">{hint}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default PhotoUploader;
