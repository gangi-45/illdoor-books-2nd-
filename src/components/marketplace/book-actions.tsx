'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toggleWishlistAction, reportListingAction } from '@/lib/actions/books';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { REPORT_CATEGORY_LABELS } from '@/lib/constants';
import {
  ShoppingBag,
  Heart,
  Flag,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { ListingStatus, VerificationStatus } from '@/types/database';

interface BookActionsProps {
  bookId: string;
  sellerId: string;
  currentUserId?: string | null;
  currentUserVerification?: VerificationStatus | null;
  listingStatus: ListingStatus;
  initialInWishlist: boolean;
}

export function BookActions({
  bookId,
  sellerId,
  currentUserId,
  currentUserVerification,
  listingStatus,
  initialInWishlist,
}: BookActionsProps) {
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [isWishlistPending, startWishlistTransition] = useTransition();

  // Report modal state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState<string>('condition_mismatch');
  const [reportDescription, setReportDescription] = useState('');
  const [reportStatus, setReportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isReporting, setIsReporting] = useState(false);

  const isOwner = currentUserId && currentUserId === sellerId;
  const isAvailable = listingStatus === 'available';
  const isVerified = currentUserVerification === 'verified';

  const handleWishlistToggle = () => {
    if (!currentUserId) {
      router.push(`/login?redirect=/book/${bookId}`);
      return;
    }

    startWishlistTransition(async () => {
      const res = await toggleWishlistAction(bookId);
      if (res.success && res.data) {
        setInWishlist(res.data.inWishlist);
      }
    });
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      router.push(`/login?redirect=/book/${bookId}`);
      return;
    }

    setIsReporting(true);
    setReportStatus(null);

    const formData = new FormData();
    formData.append('related_book_id', bookId);
    formData.append('category', reportCategory);
    formData.append('description', reportDescription);

    const res = await reportListingAction(null, formData);
    setIsReporting(false);
    setReportStatus(res);

    if (res.success) {
      setTimeout(() => {
        setReportOpen(false);
        setReportDescription('');
      }, 1500);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Primary CTA: Buy Now or Status Notice */}
      {isOwner ? (
        <div className="p-4 rounded-xl bg-muted text-muted-foreground text-center text-sm font-medium border">
          This is your book listing
        </div>
      ) : !isAvailable ? (
        <Button disabled size="lg" className="w-full text-base font-semibold py-6">
          {listingStatus === 'reserved' ? 'Currently Reserved' : 'Sold Out'}
        </Button>
      ) : !currentUserId ? (
        <Link href={`/login?redirect=/book/${bookId}`} className="block">
          <Button size="lg" className="w-full bg-brand text-brand-foreground hover:bg-brand/90 text-base font-bold py-6 gap-2 shadow-md">
            <ShoppingBag className="h-5 w-5" />
            Sign In to Buy Now (বই কিনুন)
          </Button>
        </Link>
      ) : !isVerified ? (
        <div className="space-y-2">
          <Link href="/profile#verify" className="block">
            <Button
              size="lg"
              variant="outline"
              className="w-full border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 text-sm font-semibold py-6 gap-2"
            >
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              Verify Student ID to Buy (যাচাইকরণ প্রয়োজন)
            </Button>
          </Link>
          <p className="text-[11px] text-muted-foreground text-center">
            Verification keeps campus transactions safe. Submit your student ID card in your profile.
          </p>
        </div>
      ) : (
        <Link href={`/orders/checkout?bookId=${bookId}`} className="block">
          <Button
            size="lg"
            className="w-full bg-brand text-brand-foreground hover:bg-brand/90 text-base font-bold py-6 gap-2 shadow-md"
          >
            <ShoppingBag className="h-5 w-5" />
            Buy Now (বই কিনুন)
          </Button>
        </Link>
      )}

      {/* Secondary CTAs: Wishlist and Report */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleWishlistToggle}
          disabled={isWishlistPending}
          className={`flex-1 gap-2 ${
            inWishlist
              ? 'border-red-500/50 text-red-600 dark:text-red-400 bg-red-500/5'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {isWishlistPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={`h-4 w-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
          )}
          <span>{inWishlist ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
        </Button>

        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogTrigger
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-destructive transition-colors rounded-md border cursor-pointer h-9"
          >
            <Flag className="h-3.5 w-3.5" />
            <span>Report</span>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Flag className="h-4 w-4 text-destructive" />
                Report This Listing
              </DialogTitle>
            </DialogHeader>

            {reportStatus && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                  reportStatus.success
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-destructive/10 text-destructive border-destructive/20'
                }`}
              >
                {reportStatus.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{reportStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="report_category">Category</Label>
                <select
                  id="report_category"
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs ring-offset-background focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Object.entries(REPORT_CATEGORY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="report_description">Description / Reason *</Label>
                <Textarea
                  id="report_description"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Explain why this listing violates campus guidelines (e.g., condition grossly mismatched, fake price, incorrect book)..."
                  rows={3}
                  required
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReportOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={isReporting || !reportDescription.trim()}
                >
                  {isReporting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Report'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
