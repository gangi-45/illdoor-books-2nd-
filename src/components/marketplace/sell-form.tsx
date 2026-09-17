'use client';

import { useActionState, useState } from 'react';
import { createBookListingAction } from '@/lib/actions/books';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { Department, Semester } from '@/types/database';
import { CONDITION_LABELS } from '@/lib/constants';
import {
  BookOpen,
  UploadCloud,
  X,
  AlertCircle,
  Loader2,
  DollarSign,
  FileText,
  Tag,
  GraduationCap,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';

interface SellFormProps {
  departments: Department[];
  semesters: Semester[];
}

export function SellForm({ departments, semesters }: SellFormProps) {
  const [state, formAction, isPending] = useActionState(createBookListingAction, {
    success: false,
  });

  const [selectedCondition, setSelectedCondition] = useState<string>('good');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Condition detail flags
  const [flags, setFlags] = useState({
    writing_inside: false,
    highlighting: false,
    missing_pages: false,
    cover_damage: false,
    page_damage: false,
  });

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...selectedFiles, ...files].slice(0, 5);
    setSelectedFiles(newFiles);

    // generate preview URLs
    const urls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  };

  const removeImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    const updatedUrls = previews.filter((_, i) => i !== index);
    setPreviews(updatedUrls);
  };

  const savings =
    typeof originalPrice === 'number' && typeof sellingPrice === 'number' && originalPrice > sellingPrice
      ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
      : null;

  const handleSubmit = (formData: FormData) => {
    formData.delete('images');
    for (const file of selectedFiles) {
      formData.append('images', file);
    }
    formAction(formData);
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      {state.message && !state.success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {/* 1. Book Details */}
      <div className="bg-card border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2 font-semibold text-lg border-b pb-4">
          <BookOpen className="h-5 w-5 text-brand" />
          <span>Book Information</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Book Title / Name *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Programming Essentials in C"
              required
            />
            {state.errors?.title && (
              <p className="text-xs text-destructive">{state.errors.title[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject_code">Subject Code * (e.g. 26821)</Label>
              <Input
                id="subject_code"
                name="subject_code"
                placeholder="26821"
                required
              />
              {state.errors?.subject_code && (
                <p className="text-xs text-destructive">{state.errors.subject_code[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="author">Author / Publisher (Optional)</Label>
              <Input
                id="author"
                name="author"
                placeholder="e.g. TechWorld or Haque Publications"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="department_id">Department / Technology *</Label>
              <select
                id="department_id"
                name="department_id"
                required
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select Technology</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
              {state.errors?.department_id && (
                <p className="text-xs text-destructive">{state.errors.department_id[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="semester_id">Semester *</Label>
              <select
                id="semester_id"
                name="semester_id"
                required
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select Semester</option>
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.name}
                  </option>
                ))}
              </select>
              {state.errors?.semester_id && (
                <p className="text-xs text-destructive">{state.errors.semester_id[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edition">Edition (Optional)</Label>
              <Input
                id="edition"
                name="edition"
                placeholder="e.g. 5th Edition (2023)"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description & Notes (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Mention details like whether highlighted, useful for lab exams, included sample sheets, etc."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* 2. Condition & Inspection Details */}
      <div className="bg-card border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2 font-semibold text-lg border-b pb-4">
          <Tag className="h-5 w-5 text-brand" />
          <span>Condition Assessment *</span>
        </div>

        <div className="space-y-4">
          <input type="hidden" name="condition" value={selectedCondition} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(CONDITION_LABELS).map(([val, label]) => {
              const isSelected = selectedCondition === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSelectedCondition(val)}
                  className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand bg-brand/10 text-brand font-semibold ring-2 ring-brand/30 shadow-xs'
                      : 'border-input hover:bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm font-medium">{label}</p>
                </button>
              );
            })}
          </div>

          {/* Condition Detail Flags */}
          <div className="pt-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
              Specific Inspection Flags (Check all that apply)
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                <input
                  type="checkbox"
                  name="writing_inside"
                  value="true"
                  checked={flags.writing_inside}
                  onChange={(e) => setFlags({ ...flags, writing_inside: e.target.checked })}
                  className="rounded border-input text-brand focus:ring-brand h-4 w-4"
                />
                <span className="text-xs font-medium">Pen or pencil writing inside</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                <input
                  type="checkbox"
                  name="highlighting"
                  value="true"
                  checked={flags.highlighting}
                  onChange={(e) => setFlags({ ...flags, highlighting: e.target.checked })}
                  className="rounded border-input text-brand focus:ring-brand h-4 w-4"
                />
                <span className="text-xs font-medium">Highlighting present</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                <input
                  type="checkbox"
                  name="missing_pages"
                  value="true"
                  checked={flags.missing_pages}
                  onChange={(e) => setFlags({ ...flags, missing_pages: e.target.checked })}
                  className="rounded border-input text-brand focus:ring-brand h-4 w-4"
                />
                <span className="text-xs font-medium">Any torn or missing pages</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                <input
                  type="checkbox"
                  name="cover_damage"
                  value="true"
                  checked={flags.cover_damage}
                  onChange={(e) => setFlags({ ...flags, cover_damage: e.target.checked })}
                  className="rounded border-input text-brand focus:ring-brand h-4 w-4"
                />
                <span className="text-xs font-medium">Cover creased, loose or damaged</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                <input
                  type="checkbox"
                  name="page_damage"
                  value="true"
                  checked={flags.page_damage}
                  onChange={(e) => setFlags({ ...flags, page_damage: e.target.checked })}
                  className="rounded border-input text-brand focus:ring-brand h-4 w-4"
                />
                <span className="text-xs font-medium">Water stains or loose binding</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Photos Upload */}
      <div className="bg-card border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <UploadCloud className="h-5 w-5 text-brand" />
            <span>Book Photos * (1 to 5 images)</span>
          </div>
          <span className="text-xs text-muted-foreground">{selectedFiles.length}/5 photos</span>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Clear photos build trust. Include photos of the front cover, back cover, and any marked or damaged pages.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {previews.map((url, i) => (
              <div key={i} className="relative aspect-[3/4] border rounded-xl overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-background/90 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-xs"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                    Cover
                  </span>
                )}
              </div>
            ))}

            {selectedFiles.length < 5 && (
              <label className="flex flex-col items-center justify-center aspect-[3/4] border-2 border-dashed rounded-xl cursor-pointer hover:bg-accent/40 border-muted-foreground/30 transition-colors">
                <UploadCloud className="h-6 w-6 text-brand mb-1" />
                <span className="text-[11px] font-medium text-center px-2">Add Photo</span>
                <span className="text-[9px] text-muted-foreground">JPG, PNG, WebP</span>
                <input
                  type="file"
                  name="images"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFilesChange}
                />
              </label>
            )}
          </div>
          {state.errors?.images && (
            <p className="text-xs text-destructive">{state.errors.images[0]}</p>
          )}
        </div>
      </div>

      {/* 4. Pricing & Savings */}
      <div className="bg-card border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2 font-semibold text-lg border-b pb-4">
          <DollarSign className="h-5 w-5 text-brand" />
          <span>Pricing (৳ Taka)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="original_price">Original Book Price (Printed MRP) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                ৳
              </span>
              <Input
                id="original_price"
                name="original_price"
                type="number"
                placeholder="e.g. 350"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value ? parseFloat(e.target.value) : '')}
                required
                className="pl-8"
                min={1}
              />
            </div>
            {state.errors?.original_price && (
              <p className="text-xs text-destructive">{state.errors.original_price[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="selling_price">Your Selling Price *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                ৳
              </span>
              <Input
                id="selling_price"
                name="selling_price"
                type="number"
                placeholder="e.g. 180"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value ? parseFloat(e.target.value) : '')}
                required
                className="pl-8 font-semibold text-brand"
                min={1}
              />
            </div>
            {state.errors?.selling_price && (
              <p className="text-xs text-destructive">{state.errors.selling_price[0]}</p>
            )}
          </div>
        </div>

        {savings !== null && savings > 0 && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-sm">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>
              Buyer will save <strong>{savings}%</strong> off the original printed price (Save ৳{Number(originalPrice) - Number(sellingPrice)}).
            </span>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending || selectedFiles.length === 0}
        size="lg"
        className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-bold py-3 text-base shadow-md"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Uploading photos and publishing listing...
          </>
        ) : (
          <>
            <BookOpen className="mr-2 h-5 w-5" />
            Publish Book Listing (বই বিক্রি করুন)
          </>
        )}
      </Button>
    </form>
  );
}
