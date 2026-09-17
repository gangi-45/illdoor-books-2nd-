'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { PriceDisplay } from '@/components/marketplace/price-display';
import { ConditionBadge } from '@/components/shared/status-badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BookCondition, ListingStatus } from '@/types/database';

interface BookCardProps {
  id: string;
  title: string;
  subjectCode: string;
  semesterName: string;
  condition: BookCondition;
  originalPrice: number;
  sellingPrice: number;
  listingStatus: ListingStatus;
  imageUrl?: string | null;
  className?: string;
}

/**
 * BookCard — compact card for marketplace browsing.
 * Displays thumbnail, title, subject code, semester, condition, price.
 */
export function BookCard({
  id,
  title,
  subjectCode,
  semesterName,
  condition,
  originalPrice,
  sellingPrice,
  listingStatus,
  imageUrl,
  className,
}: BookCardProps) {
  const [imageError, setImageError] = useState(false);

  // Deterministic cover gradients matching the Liquid Glass prototype
  const gradients = [
    'from-[#7be1ff] via-[#2877ef] to-[#2147aa]',
    'from-[#ebb2ff] via-[#9c5be7] to-[#6334b7]',
    'from-[#8af2d9] via-[#27bfa5] to-[#087783]',
    'from-[#ffd285] via-[#ea8e39] to-[#b35319]',
  ];
  const gradient = gradients[id.charCodeAt(0) % gradients.length];

  return (
    <Link href={`/book/${id}`} className="group block">
      <div
        className={cn(
          'rounded-[28px] p-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-white/30 dark:border-white/10 bg-[rgba(255,255,255,0.45)] dark:bg-[rgba(15,23,42,0.65)] backdrop-blur-[20px] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(0,0,0,0.08),0_10px_25px_rgba(0,0,0,0.12)] relative overflow-hidden',
          listingStatus !== 'available' && 'opacity-75',
          className
        )}
      >
        {/* Cover with liquid gradient or actual image - 28px outer - 12px padding = 16px inner radius */}
        <div
          className={cn(
            'relative h-56 w-full rounded-[16px] overflow-hidden p-4 flex flex-col justify-between text-white shadow-inner bg-gradient-to-br',
            gradient
          )}
        >
          {imageUrl && !imageError ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              referrerPolicy="no-referrer"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <>
              {/* Subtle glass reflection decorative ring */}
              <div className="absolute w-32 h-32 -right-8 -top-8 rounded-full bg-white/20 blur-[3px] pointer-events-none" />
              <div className="absolute left-4 right-4 top-5 h-[1px] bg-white/50 pointer-events-none" />
              <div className="relative z-10 flex justify-between items-start">
                <span className="text-[10px] font-black tracking-widest uppercase bg-black/25 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                  BTEB
                </span>
                <button
                  type="button"
                  aria-label="Save book"
                  className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <div className="relative z-10">
                <p className="text-[11px] font-black tracking-widest opacity-90 uppercase">
                  POLYTECHNIC<br />EDITION
                </p>
              </div>
            </>
          )}

          {/* Status overlay for non-available */}
          {listingStatus !== 'available' && (
            <div className="absolute inset-0 bg-[#0b1530]/60 backdrop-blur-xs flex items-center justify-center z-20">
              <StatusBadge type="listing" value={listingStatus} className="text-sm font-bold" />
            </div>
          )}
        </div>

        {/* Book Details */}
        <div className="pt-3 px-1 pb-1 space-y-2">
          {/* Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              {condition === 'like_new' ? 'Like New' : condition}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-white/40 bg-white/40 dark:bg-white/10 text-foreground/80">
              {semesterName}
            </span>
          </div>

          {/* Title & Code */}
          <div>
            <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-[#0a84ff] transition-colors">
              {title}
            </h3>
            <p className="text-xs font-semibold text-[#0a84ff] mt-0.5">
              Code: {subjectCode}
            </p>
          </div>

          {/* Price & CTA Row */}
          <div className="flex items-end justify-between pt-2 border-t border-black/5 dark:border-white/10">
            <div>
              <small className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Asking price</small>
              <strong className="text-lg font-semibold text-foreground">৳{sellingPrice}</strong>
            </div>
            <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full bg-[#0a84ff] hover:bg-[#0077eb] text-white text-xs font-medium shadow-[0_4px_12px_rgba(10,132,255,0.3)] transition-all">
              View
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// BookCard Skeleton — loading placeholder
// ---------------------------------------------------------------------------

export function BookCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[3/4] w-full bg-muted animate-pulse" />
      <CardContent className="p-3 space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
        <div className="h-5 bg-muted animate-pulse rounded w-1/3" />
      </CardContent>
    </Card>
  );
}
