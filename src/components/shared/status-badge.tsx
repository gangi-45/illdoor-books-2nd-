import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type {
  ListingStatus,
  OrderStatus,
  PaymentStatus,
  VerificationStatus,
  AccountStatus,
} from '@/types/database';
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  VERIFICATION_STATUS_LABELS,
  ACCOUNT_STATUS_LABELS,
  CONDITION_LABELS,
} from '@/lib/constants';
import type { BookCondition } from '@/types/database';

// ---------------------------------------------------------------------------
// Status Badge — universal status indicator
// ---------------------------------------------------------------------------

type StatusType =
  | 'listing'
  | 'order'
  | 'payment'
  | 'verification'
  | 'account'
  | 'condition';

interface StatusBadgeProps {
  type: StatusType;
  value: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  // Listing
  available: 'bg-success/15 text-success border-success/30',
  reserved: 'bg-warning/15 text-warning-foreground border-warning/30',
  sold: 'bg-muted text-muted-foreground border-muted',
  inactive: 'bg-muted text-muted-foreground border-muted',

  // Order
  pending_payment: 'bg-warning/15 text-warning-foreground border-warning/30',
  paid: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
  waiting_for_dropoff: 'bg-orange-500/15 text-orange-700 border-orange-500/30',
  dropped_off: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
  ready_for_pickup: 'bg-success/15 text-green-700 border-success/30',
  picked_up: 'bg-success/15 text-green-700 border-success/30',
  completed: 'bg-success/15 text-green-700 border-success/30',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/30',
  expired: 'bg-muted text-muted-foreground border-muted',
  disputed: 'bg-destructive/15 text-destructive border-destructive/30',

  // Payment
  pending: 'bg-warning/15 text-warning-foreground border-warning/30',
  // paid: reuse from order
  failed: 'bg-destructive/15 text-destructive border-destructive/30',
  refunded: 'bg-muted text-muted-foreground border-muted',
  released: 'bg-success/15 text-green-700 border-success/30',

  // Verification
  unverified: 'bg-muted text-muted-foreground border-muted',
  // pending: reuse
  verified: 'bg-success/15 text-green-700 border-success/30',
  rejected: 'bg-destructive/15 text-destructive border-destructive/30',

  // Account
  active: 'bg-success/15 text-green-700 border-success/30',
  warning: 'bg-warning/15 text-warning-foreground border-warning/30',
  restricted: 'bg-orange-500/15 text-orange-700 border-orange-500/30',
  suspended: 'bg-destructive/15 text-destructive border-destructive/30',

  // Condition
  like_new: 'bg-success/15 text-green-700 border-success/30',
  good: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
  used: 'bg-warning/15 text-warning-foreground border-warning/30',
  heavily_used: 'bg-orange-500/15 text-orange-700 border-orange-500/30',
};

const labelMaps: Record<StatusType, Record<string, string>> = {
  listing: { available: 'Available', reserved: 'Reserved', sold: 'Sold', inactive: 'Inactive' },
  order: ORDER_STATUS_LABELS,
  payment: PAYMENT_STATUS_LABELS,
  verification: VERIFICATION_STATUS_LABELS,
  account: ACCOUNT_STATUS_LABELS,
  condition: CONDITION_LABELS,
};

export function StatusBadge({ type, value, className }: StatusBadgeProps) {
  const colorClass = statusColors[value] || 'bg-muted text-muted-foreground border-muted';
  const label = labelMaps[type]?.[value] || value;

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', colorClass, className)}
    >
      {label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// ConditionBadge — shortcut for book condition display
// ---------------------------------------------------------------------------

interface ConditionBadgeProps {
  condition: BookCondition;
  className?: string;
}

export function ConditionBadge({ condition, className }: ConditionBadgeProps) {
  return <StatusBadge type="condition" value={condition} className={className} />;
}
