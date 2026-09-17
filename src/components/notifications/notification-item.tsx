'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { markNotificationAsReadAction } from '@/lib/actions/notifications';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  ShieldAlert,
  Info,
  Check,
} from 'lucide-react';
import type { Notification, NotificationType } from '@/types/database';

interface NotificationItemProps {
  notification: Notification;
}

const NOTIFICATION_ICONS: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  new_order: { icon: <Package className="h-4 w-4" />, color: 'bg-brand/10 text-brand' },
  payment_confirmed: { icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-emerald-500/10 text-emerald-600' },
  dropoff_reminder: { icon: <Clock className="h-4 w-4" />, color: 'bg-amber-500/10 text-amber-600' },
  book_dropped_off: { icon: <Package className="h-4 w-4" />, color: 'bg-blue-500/10 text-blue-600' },
  book_ready_for_pickup: { icon: <MapPin className="h-4 w-4" />, color: 'bg-emerald-500/10 text-emerald-600' },
  order_completed: { icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-emerald-500/10 text-emerald-600' },
  new_review: { icon: <Star className="h-4 w-4" />, color: 'bg-amber-500/10 text-amber-500' },
  reservation_expiring: { icon: <Clock className="h-4 w-4" />, color: 'bg-destructive/10 text-destructive' },
  system_notice: { icon: <Info className="h-4 w-4" />, color: 'bg-muted text-foreground' },
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const [isPending, startTransition] = useTransition();
  const isRead = Boolean(notification.read_at);

  const iconConfig = NOTIFICATION_ICONS[notification.type] || {
    icon: <Bell className="h-4 w-4" />,
    color: 'bg-muted text-foreground',
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await markNotificationAsReadAction(notification.id);
    });
  };

  const linkHref = notification.related_order_id
    ? `/orders/${notification.related_order_id}`
    : notification.related_book_id
    ? `/book/${notification.related_book_id}`
    : null;

  const content = (
    <div
      className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
        isRead
          ? 'bg-card text-muted-foreground opacity-80'
          : 'bg-card border-brand/30 shadow-xs text-foreground font-medium'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className={`p-2.5 rounded-xl shrink-0 ${iconConfig.color}`}>
          {iconConfig.icon}
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold truncate">{notification.title}</h4>
            {!isRead && (
              <span className="w-2 h-2 rounded-full bg-brand shrink-0 animate-pulse" />
            )}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
            {notification.message}
          </p>
          <span className="text-[10px] text-muted-foreground/75 block pt-0.5">
            {new Date(notification.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {!isRead && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAsRead}
          disabled={isPending}
          className="text-xs text-muted-foreground hover:text-foreground h-8 px-2 shrink-0 gap-1"
        >
          <Check className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Mark read</span>
        </Button>
      )}
    </div>
  );

  if (linkHref) {
    return (
      <Link href={linkHref} className="block group">
        {content}
      </Link>
    );
  }

  return content;
}
