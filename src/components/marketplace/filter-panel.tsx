'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Department, Semester } from '@/types/database';
import { CONDITION_LABELS } from '@/lib/constants';
import { SlidersHorizontal, RotateCcw, Check } from 'lucide-react';

interface FilterPanelProps {
  departments: Department[];
  semesters: Semester[];
  className?: string;
  onFilterChange?: () => void;
}

export function FilterPanel({
  departments,
  semesters,
  className = '',
  onFilterChange,
}: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentDepartment = searchParams.get('department') || '';
  const currentSemester = searchParams.get('semester') || '';
  const currentCondition = searchParams.get('condition') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentStatus = searchParams.get('status') || 'available';

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
      onFilterChange?.();
    });
  };

  const handleReset = () => {
    const params = new URLSearchParams();
    const q = searchParams.get('q');
    if (q) params.set('q', q);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
      onFilterChange?.();
    });
  };

  const hasActiveFilters =
    Boolean(currentDepartment) ||
    Boolean(currentSemester) ||
    Boolean(currentCondition) ||
    Boolean(currentMinPrice) ||
    Boolean(currentMaxPrice) ||
    currentStatus !== 'available';

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-[#0a84ff]" />
          <span>Filters</span>
          {hasActiveFilters && (
            <Badge className="text-xs px-2 py-0.5 rounded-full bg-[#0a84ff] text-white">
              Active
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isPending}
            className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground gap-1 rounded-full"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        )}
      </div>

      {/* Technology / Department */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Department / Technology
        </Label>
        <select
          value={currentDepartment}
          onChange={(e) => updateParam('department', e.target.value)}
          className="w-full h-9 px-3 rounded-full border border-input bg-background text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#0a84ff]"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      {/* Semester */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Semester
        </Label>
        <div className="grid grid-cols-4 gap-1.5">
          {semesters.map((s) => {
            const isSelected = currentSemester === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => updateParam('semester', isSelected ? null : s.id)}
                className={`text-xs py-1.5 px-2 rounded-full border text-center transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#0a84ff] text-white border-[#0a84ff] font-semibold shadow-xs'
                    : 'bg-card hover:bg-accent border-input text-foreground'
                }`}
              >
                {s.number}th
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Book Condition
        </Label>
        <div className="space-y-1">
          {Object.entries(CONDITION_LABELS).map(([val, label]) => {
            const isSelected = currentCondition === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => updateParam('condition', isSelected ? null : val)}
                className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-full transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#0a84ff]/15 text-[#0a84ff] font-semibold'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <span>{label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-[#0a84ff]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Price Range (৳)
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min ৳"
            defaultValue={currentMinPrice}
            onBlur={(e) => updateParam('minPrice', e.target.value)}
            className="h-8 text-xs"
            min={0}
          />
          <span className="text-muted-foreground text-xs">—</span>
          <Input
            type="number"
            placeholder="Max ৳"
            defaultValue={currentMaxPrice}
            onBlur={(e) => updateParam('maxPrice', e.target.value)}
            className="h-8 text-xs"
            min={0}
          />
        </div>
      </div>

      {/* Availability Status */}
      <div className="space-y-2 pt-2 border-t">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Listing Availability
        </Label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateParam('status', currentStatus === 'available' ? 'all' : 'available')}
            className={`text-xs py-1.5 px-3 rounded-full border transition-colors cursor-pointer ${
              currentStatus === 'available'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-medium'
                : 'bg-card text-muted-foreground border-input'
            }`}
          >
            {currentStatus === 'available' ? '✓ Available Only' : 'Showing All Listings'}
          </button>
        </div>
      </div>
    </div>
  );
}
