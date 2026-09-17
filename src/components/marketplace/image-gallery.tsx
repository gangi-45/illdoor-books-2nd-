'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';

interface ImageGalleryProps {
  images: { storage_path?: string; public_url: string; sort_order?: number }[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] w-full rounded-2xl bg-muted flex flex-col items-center justify-center text-muted-foreground border">
        <BookOpen className="h-16 w-16 mb-2 stroke-1" />
        <span className="text-sm">No photo available</span>
      </div>
    );
  }

  const selectedImage = images[selectedIndex] || images[0];
  const isSelectedFailed = failedIndices[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main Feature Image */}
      <div className="relative aspect-[3/4] w-full rounded-2xl bg-muted overflow-hidden border shadow-sm group">
        {!isSelectedFailed ? (
          <Image
            src={selectedImage.public_url}
            alt={`${title} - Photo ${selectedIndex + 1}`}
            fill
            priority
            referrerPolicy="no-referrer"
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setFailedIndices((prev) => ({ ...prev, [selectedIndex]: true }))}
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground bg-gradient-to-br from-brand/10 to-brand/5 p-6 text-center">
            <BookOpen className="h-16 w-16 mb-3 text-brand/40 stroke-1" />
            <span className="text-sm font-semibold text-foreground">Polytechnic Edition</span>
            <span className="text-xs text-muted-foreground mt-1">{title}</span>
          </div>
        )}
      </div>

      {/* Thumbnail Selector (if more than 1 image) */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {images.map((img, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'border-brand ring-2 ring-brand/30 scale-105 shadow-xs'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                {!failedIndices[index] ? (
                  <Image
                    src={img.public_url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    referrerPolicy="no-referrer"
                    sizes="64px"
                    className="object-cover"
                    onError={() => setFailedIndices((prev) => ({ ...prev, [index]: true }))}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                    <BookOpen className="h-6 w-6 stroke-1" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
