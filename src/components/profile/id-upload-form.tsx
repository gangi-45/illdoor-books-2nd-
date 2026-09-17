'use client';

import { useActionState, useState } from 'react';
import { uploadVerificationIdAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { UploadCloud, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export function IdUploadForm() {
  const [state, formAction, isPending] = useActionState(uploadVerificationIdAction, {
    success: false,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    const input = document.getElementById('profile_id_card') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <div
          className={`flex items-center gap-2 p-3 text-sm rounded-lg border ${
            state.success
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-destructive/10 text-destructive border-destructive/20'
          }`}
        >
          {state.success ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      <div>
        {previewUrl ? (
          <div className="relative inline-block border rounded-lg overflow-hidden max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Student ID Card Preview"
              className="w-full h-48 object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 rounded-full bg-background/90 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-xs"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="profile_id_card"
            className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer hover:bg-accent/50 transition-colors border-muted-foreground/25"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
              <UploadCloud className="w-8 h-8 mb-2 text-brand" />
              <p className="text-xs font-medium">Click to select Student ID Card photo</p>
              <p className="text-[11px] text-muted-foreground/75 mt-0.5">JPG, PNG, or WebP up to 5MB</p>
            </div>
            <input
              id="profile_id_card"
              name="id_card"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
              required
            />
          </label>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending || !previewUrl}
        className="bg-brand text-brand-foreground hover:bg-brand/90"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading & Submitting...
          </>
        ) : (
          <>
            <UploadCloud className="mr-2 h-4 w-4" />
            Submit ID Card for Verification
          </>
        )}
      </Button>
    </form>
  );
}
