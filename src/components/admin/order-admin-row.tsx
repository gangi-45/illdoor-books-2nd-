'use client';

import { useState, useTransition } from 'react';
import { confirmOrderPaymentAction } from '@/lib/actions/admin';
import { confirmDropoffAction, verifyPickupPinAction } from '@/lib/actions/pickup';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, KeyRound, Loader2, X } from 'lucide-react';
import type { OrderWithDetails } from '@/lib/services/orders';

interface OrderAdminRowProps {
  order: OrderWithDetails;
}

export function OrderAdminRow({ order }: OrderAdminRowProps) {
  const [isPending, startTransition] = useTransition();
  const [pinInput, setPinInput] = useState('');
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  const handleConfirmPayment = () => {
    if (confirm(`Confirm payment receipt for Order #${order.order_number}?`)) {
      startTransition(async () => {
        await confirmOrderPaymentAction(order.id);
      });
    }
  };

  const handleConfirmDropoff = () => {
    if (confirm(`Confirm book was dropped off at the campus counter for Order #${order.order_number}?`)) {
      startTransition(async () => {
        await confirmDropoffAction(order.id);
      });
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);

    const formData = new FormData();
    formData.append('order_id', order.id);
    formData.append('pin', pinInput);

    startTransition(async () => {
      const res = await verifyPickupPinAction(null, formData);
      if (res.success) {
        setShowPinDialog(false);
        setPinInput('');
      } else {
        setPinMessage(res.message || 'Verification failed');
      }
    });
  };

  return (
    <tr className="border-b text-xs hover:bg-muted/30 transition-colors">
      <td className="p-3">
        <span className="font-mono font-bold text-brand">#{order.order_number}</span>
        <div className="text-[11px] text-muted-foreground">
          {new Date(order.created_at).toLocaleDateString()}
        </div>
      </td>

      <td className="p-3">
        <div className="font-semibold truncate max-w-[180px]">{order.books?.title}</div>
        <div className="text-[11px] text-muted-foreground">৳{order.item_price}</div>
      </td>

      <td className="p-3">
        <div>{order.buyer?.full_name}</div>
        <div className="text-[11px] text-muted-foreground">Roll: {order.buyer?.student_id}</div>
      </td>

      <td className="p-3">
        <div>{order.seller?.full_name}</div>
        <div className="text-[11px] text-muted-foreground">Roll: {order.seller?.student_id}</div>
      </td>

      <td className="p-3">
        <StatusBadge type="order" value={order.order_status} className="text-[10px]" />
      </td>

      <td className="p-3">
        <div className="space-y-0.5">
          <StatusBadge type="payment" value={order.payment_status} className="text-[10px]" />
          {order.payment_reference && (
            <div className="font-mono text-[10px] font-bold text-brand truncate max-w-[120px]">
              TrxID: {order.payment_reference}
            </div>
          )}
        </div>
      </td>

      <td className="p-3 text-right">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin ml-auto text-muted-foreground" />
        ) : (
          <div className="flex items-center justify-end gap-1.5 flex-wrap">
            {/* Step 1: Payment Check-off */}
            {order.payment_status === 'pending' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleConfirmPayment}
                className="h-7 px-2 text-[11px] border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1"
              >
                <CheckCircle2 className="h-3 w-3" /> Mark Paid
              </Button>
            )}

            {/* Step 2: Staff Drop-off Confirmation */}
            {(order.order_status === 'paid' || order.order_status === 'waiting_for_dropoff') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleConfirmDropoff}
                className="h-7 px-2 text-[11px] border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 gap-1"
              >
                <Package className="h-3 w-3" /> Confirm Drop-off
              </Button>
            )}

            {/* Step 3: Counter PIN Verification */}
            {order.order_status === 'ready_for_pickup' && (
              <>
                {showPinDialog ? (
                  <form onSubmit={handleVerifyPin} className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="6-digit PIN"
                      maxLength={6}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="h-7 px-2 text-[11px] rounded border font-mono w-24 bg-background"
                      required
                    />
                    <Button type="submit" size="sm" className="h-7 px-2 text-[11px]">
                      Verify
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowPinDialog(false);
                        setPinMessage(null);
                      }}
                      className="h-7 px-1 text-[11px]"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </form>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPinDialog(true)}
                    className="h-7 px-2 text-[11px] border-brand text-brand hover:bg-brand hover:text-brand-foreground gap-1"
                  >
                    <KeyRound className="h-3 w-3" /> Verify PIN
                  </Button>
                )}
              </>
            )}
          </div>
        )}
        {pinMessage && (
          <p className="text-[10px] text-destructive mt-1 text-right">{pinMessage}</p>
        )}
      </td>
    </tr>
  );
}
