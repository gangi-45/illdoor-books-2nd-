'use client';

import { useActionState, useState } from 'react';
import { createOrderAction } from '@/lib/actions/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { BookWithDetails } from '@/lib/services/books';
import type { PickupPoint } from '@/types/database';
import { DEFAULT_PLATFORM_FEE_PERCENT, DEFAULT_RESERVATION_MINUTES } from '@/lib/constants';
import {
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import Image from 'next/image';

interface CheckoutFormProps {
  book: BookWithDetails;
  pickupPoints: PickupPoint[];
}

export function CheckoutForm({ book, pickupPoints }: CheckoutFormProps) {
  const [state, formAction, isPending] = useActionState(createOrderAction, {
    success: false,
  });

  const [selectedPickup, setSelectedPickup] = useState<string>(
    pickupPoints[0]?.id || ''
  );

  const selectedPoint = pickupPoints.find((p) => p.id === selectedPickup) || pickupPoints[0];

  const fee = Math.round((book.selling_price * DEFAULT_PLATFORM_FEE_PERCENT) / 100);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="book_id" value={book.id} />
      <input type="hidden" name="pickup_point_id" value={selectedPickup} />

      {state.message && !state.success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {/* Book Item Preview */}
      <div className="bg-card border rounded-2xl p-5 sm:p-6 shadow-xs flex items-center gap-4">
        <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-muted shrink-0 border">
          {book.book_images?.[0]?.public_url ? (
            <Image
              src={book.book_images[0].public_url}
              alt={book.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
              No Image
            </div>
          )}
        </div>

        <div className="space-y-1 min-w-0">
          <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand/10 text-brand">
            {book.subject_code}
          </div>
          <h2 className="font-bold text-base sm:text-lg truncate">{book.title}</h2>
          <p className="text-xs text-muted-foreground">
            Seller: {book.seller?.full_name || 'Campus Student'} (Roll: {book.seller?.student_id})
          </p>
          <p className="text-base font-extrabold text-brand">৳{book.selling_price}</p>
        </div>
      </div>

      {/* Campus Pickup Point Selection */}
      <div className="bg-card border rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 font-semibold text-base border-b pb-3">
          <MapPin className="h-5 w-5 text-brand" />
          <span>Campus Pickup Point</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Both you and the seller will exchange this book safely at the designated campus counter.
        </p>

        <div className="space-y-3">
          {pickupPoints.map((point) => {
            const isSelected = selectedPickup === point.id;
            return (
              <div
                key={point.id}
                onClick={() => setSelectedPickup(point.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-brand bg-brand/5 ring-2 ring-brand/30 shadow-xs'
                    : 'border-input hover:bg-muted/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">{point.name}</p>
                    <p className="text-xs text-muted-foreground">{point.location_description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-brand" />
                        Hours: {point.opening_time?.slice(0, 5) || '09:00'} - {point.closing_time?.slice(0, 5) || '17:00'}
                      </span>
                      {point.phone && <span>Contact: {point.phone}</span>}
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="h-5 w-5 text-brand shrink-0" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment & Price Summary */}
      <div className="bg-card border rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
        <h3 className="font-semibold text-base border-b pb-3">Payment Summary</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Book Selling Price</span>
            <span className="font-medium">৳{book.selling_price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform Campus Service Fee ({DEFAULT_PLATFORM_FEE_PERCENT}%)</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Included in seller payout
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between text-base font-bold">
            <span>Total Payable Amount</span>
            <span className="text-brand text-lg">৳{book.selling_price}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
          <Clock className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            <strong>{DEFAULT_RESERVATION_MINUTES}-Minute Temporary Hold:</strong> Submitting will reserve this book for you. You will have {DEFAULT_RESERVATION_MINUTES} minutes to submit your bKash or Nagad Transaction ID before the reservation auto-expires.
          </span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        size="lg"
        className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-bold py-6 text-base shadow-md gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Reserving book for you...
          </>
        ) : (
          <>
            <ShoppingBag className="h-5 w-5" />
            Confirm Reservation & Buy (অর্ডার নিশ্চিত করুন)
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
