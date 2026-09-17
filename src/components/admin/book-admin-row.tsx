'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { updateBookStatusAction } from '@/lib/actions/admin';
import { StatusBadge, ConditionBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, ExternalLink, Loader2 } from 'lucide-react';
import type { BookWithDetails } from '@/lib/services/books';

interface BookAdminRowProps {
  book: BookWithDetails;
}

export function BookAdminRow({ book }: BookAdminRowProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggleHide = () => {
    const nextStatus = book.listing_status === 'inactive' ? 'available' : 'inactive';
    startTransition(async () => {
      await updateBookStatusAction(book.id, nextStatus);
    });
  };

  return (
    <tr className="border-b text-xs hover:bg-muted/30 transition-colors">
      <td className="p-3">
        <Link
          href={`/book/${book.id}`}
          target="_blank"
          className="font-semibold text-foreground hover:text-brand flex items-center gap-1 max-w-[220px] truncate"
        >
          {book.title} <ExternalLink className="h-3 w-3 shrink-0" />
        </Link>
        <div className="text-[11px] text-muted-foreground">{book.edition || 'Standard Edition'}</div>
      </td>

      <td className="p-3 font-mono font-bold text-brand">{book.subject_code}</td>

      <td className="p-3">
        <div>{book.seller?.full_name || 'Seller'}</div>
        <div className="text-[11px] text-muted-foreground">Roll: {book.seller?.student_id}</div>
      </td>

      <td className="p-3">
        <ConditionBadge condition={book.condition} className="text-[10px]" />
      </td>

      <td className="p-3 font-semibold">
        ৳{book.selling_price} <span className="text-[10px] text-muted-foreground line-through">৳{book.original_price}</span>
      </td>

      <td className="p-3">
        <StatusBadge type="listing" value={book.listing_status} className="text-[10px]" />
      </td>

      <td className="p-3 text-right">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin ml-auto text-muted-foreground" />
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleHide}
            className={`h-7 px-2 text-[11px] gap-1 ${
              book.listing_status === 'inactive'
                ? 'text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/10'
                : 'text-muted-foreground hover:text-destructive'
            }`}
          >
            {book.listing_status === 'inactive' ? (
              <>
                <Eye className="h-3 w-3" /> Restore Listing
              </>
            ) : (
              <>
                <EyeOff className="h-3 w-3" /> Hide Listing
              </>
            )}
          </Button>
        )}
      </td>
    </tr>
  );
}
