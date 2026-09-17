import type { OrderStatus } from '@/types/database';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import {
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  Check,
  AlertCircle,
  XCircle,
} from 'lucide-react';

interface OrderTimelineProps {
  status: OrderStatus;
}

const STEPS: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'pending_payment', label: 'Payment', icon: <Clock className="h-4 w-4" /> },
  { status: 'paid', label: 'Paid', icon: <CheckCircle2 className="h-4 w-4" /> },
  { status: 'waiting_for_dropoff', label: 'Drop-off', icon: <Package className="h-4 w-4" /> },
  { status: 'ready_for_pickup', label: 'Ready at Counter', icon: <MapPin className="h-4 w-4" /> },
  { status: 'completed', label: 'Completed', icon: <Check className="h-4 w-4" /> },
];

export function OrderTimeline({ status }: OrderTimelineProps) {
  if (status === 'cancelled' || status === 'expired') {
    return (
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
        <XCircle className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold capitalize">Order {status}</p>
          <p className="text-xs mt-0.5">
            {status === 'expired'
              ? 'This reservation expired because payment was not confirmed in time. The book was released.'
              : 'This order was cancelled.'}
          </p>
        </div>
      </div>
    );
  }

  // Determine active step index
  const statusOrder: OrderStatus[] = [
    'pending_payment',
    'paid',
    'waiting_for_dropoff',
    'dropped_off',
    'ready_for_pickup',
    'picked_up',
    'completed',
  ];

  const currentIndex = statusOrder.indexOf(status);

  const getStepState = (stepStatus: OrderStatus) => {
    const stepIdx = statusOrder.indexOf(stepStatus);
    if (currentIndex > stepIdx) return 'completed';
    if (currentIndex === stepIdx || (stepStatus === 'waiting_for_dropoff' && status === 'dropped_off') || (stepStatus === 'ready_for_pickup' && status === 'picked_up')) {
      return 'current';
    }
    return 'upcoming';
  };

  return (
    <div className="py-2">
      <div className="relative flex items-center justify-between w-full">
        {/* Progress Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-muted w-full -z-0" />

        {STEPS.map((step, idx) => {
          const state = getStepState(step.status);
          const isCompleted = state === 'completed';
          const isCurrent = state === 'current';

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'bg-brand text-brand-foreground border-brand shadow-xs'
                    : isCurrent
                    ? 'bg-background text-brand border-brand ring-4 ring-brand/20 animate-pulse'
                    : 'bg-muted text-muted-foreground border-muted-foreground/30'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.icon}
              </div>
              <span
                className={`text-[11px] font-medium mt-2 text-center max-w-[70px] leading-tight ${
                  isCurrent ? 'text-brand font-bold' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
