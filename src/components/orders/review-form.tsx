'use client';

import { useActionState, useState } from 'react';
import { createReviewAction } from '@/lib/actions/reviews';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ReviewFormProps {
  orderId: string;
  revieweeId: string;
  revieweeName: string;
}

export function ReviewForm({ orderId, revieweeId, revieweeName }: ReviewFormProps) {
  const [state, formAction, isPending] = useActionState(createReviewAction, {
    success: false,
  });

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  if (state.success) {
    return (
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
        <span>{state.message}</span>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 p-5 rounded-2xl bg-card border shadow-xs">
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="reviewee_id" value={revieweeId} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <h3 className="font-semibold text-sm">Leave a Review for {revieweeName}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Share your experience to help other Polytechnic students.
        </p>
      </div>

      {state.message && !state.success && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {/* Star Rating */}
      <div className="space-y-1.5">
        <Label className="text-xs">Rating</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = (hoverRating ?? rating) >= star;
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => setRating(star)}
                className="p-1 text-muted-foreground hover:scale-110 transition-transform cursor-pointer"
              >
                <Star
                  className={`h-6 w-6 ${
                    isFilled ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'
                  }`}
                />
              </button>
            );
          })}
          <span className="text-xs font-semibold text-muted-foreground ml-2">
            {rating} of 5 Stars
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="comment" className="text-xs">
          Comment (Optional)
        </Label>
        <Textarea
          id="comment"
          name="comment"
          placeholder="e.g. Prompt drop-off, book was exactly in the described condition!"
          rows={3}
          className="text-xs"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        size="sm"
        className="bg-brand text-brand-foreground hover:bg-brand/90 font-medium text-xs"
      >
        {isPending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            Submitting Review...
          </>
        ) : (
          'Submit Review'
        )}
      </Button>
    </form>
  );
}
