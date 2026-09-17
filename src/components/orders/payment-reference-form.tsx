'use client';

import { useActionState, useTransition } from 'react';
import { submitPaymentReferenceAction, cancelOrderAction } from '@/lib/actions/orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CreditCard,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  XCircle,
  Send,
} from 'lucide-react';
import { useState } from 'react';

interface PaymentReferenceFormProps {
  orderId: string;
  orderNumber: string;
  amount: number;
  existingReference?: string | null;
  reservationExpiresAt?: string | null;
}

export function PaymentReferenceForm({
  orderId,
  orderNumber,
  amount,
  existingReference,
  reservationExpiresAt,
}: PaymentReferenceFormProps) {
  const [state, formAction, isPending] = useActionState(submitPaymentReferenceAction, {
    success: false,
  });

  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [isCancelling, startCancelTransition] = useTransition();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(text);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this reservation? The book will be made available for others.')) {
      startCancelTransition(async () => {
        await cancelOrderAction(orderId);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Manual Payment Instructions (Section 23) */}
      <div className="p-5 rounded-2xl bg-brand/5 border border-brand/20 space-y-4">
        <div className="flex items-center gap-2 font-bold text-base text-brand">
          <CreditCard className="h-5 w-5" />
          <span>Manual bKash / Nagad Payment (ম্যানুয়াল পেমেন্ট নির্দেশিকা)</span>
        </div>

        <div className="text-xs space-y-2 text-foreground/90 leading-relaxed">
          <p>
            Please send exactly <strong className="text-base text-brand">৳{amount}</strong> to any of the verified campus platform numbers below via <strong>Send Money</strong>:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-card border">
              <div>
                <span className="text-[10px] uppercase font-bold text-pink-600 block">bKash (Personal)</span>
                <span className="font-mono font-bold text-sm">01711-223344</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard('01711223344')}
                className="h-8 text-xs gap-1"
              >
                {copiedNumber === '01711223344' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedNumber === '01711223344' ? 'Copied' : 'Copy'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-card border">
              <div>
                <span className="text-[10px] uppercase font-bold text-orange-600 block">Nagad (Personal)</span>
                <span className="font-mono font-bold text-sm">01811-223344</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard('01811223344')}
                className="h-8 text-xs gap-1"
              >
                {copiedNumber === '01811223344' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedNumber === '01811223344' ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-background/60 border text-[11px] text-muted-foreground space-y-1">
            <p>1. Open your bKash or Nagad App and select <strong>Send Money</strong>.</p>
            <p>2. Enter reference: <strong>{orderNumber}</strong></p>
            <p>3. Copy the <strong>Transaction ID (TrxID)</strong> and paste it below.</p>
          </div>
        </div>
      </div>

      {/* Submission State Message */}
      {state.message && (
        <div
          className={`flex items-center gap-2 p-3.5 text-xs rounded-xl border ${
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

      {existingReference && !state.success && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-3">
          <Clock className="h-4 w-4 shrink-0 animate-pulse" />
          <div>
            <p className="font-semibold">Transaction ID submitted: {existingReference}</p>
            <p className="text-muted-foreground mt-0.5">
              Staff is verifying this against our statement. You can re-enter below if you made a typo.
            </p>
          </div>
        </div>
      )}

      {/* Reference Submission Form */}
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="order_id" value={orderId} />

        <div className="space-y-1.5">
          <Label htmlFor="payment_reference">Transaction ID (TrxID) *</Label>
          <Input
            id="payment_reference"
            name="payment_reference"
            placeholder="e.g. BLA892X019"
            defaultValue={existingReference || ''}
            required
            className="font-mono uppercase text-sm"
          />
          {state.errors?.payment_reference && (
            <p className="text-xs text-destructive">{state.errors.payment_reference[0]}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isCancelling}
            className="text-xs text-muted-foreground hover:text-destructive gap-1"
          >
            {isCancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
            Cancel Reservation
          </Button>

          <Button
            type="submit"
            disabled={isPending}
            className="bg-brand text-brand-foreground hover:bg-brand/90 font-bold gap-2 text-xs"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Submit TrxID (পেমেন্ট নিশ্চিত করুন)
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
