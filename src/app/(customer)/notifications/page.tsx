import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentProfile } from '@/lib/actions/auth';
import { getUserNotifications, markAllNotificationsAsReadAction } from '@/lib/actions/notifications';
import { NotificationItem } from '@/components/notifications/notification-item';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Notifications | Polytechnic Used Book Marketplace',
  description: 'Stay updated on order status, payments, and campus drop-offs.',
};

export default async function NotificationsPage() {
  const { user, profile } = await getCurrentProfile();

  if (!user || !profile) {
    redirect('/login?redirect=/notifications');
  }

  const notifications = await getUserNotifications();
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand/10 text-brand">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                : 'All caught up!'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <form action={markAllNotificationsAsReadAction}>
            <Button variant="outline" size="sm" type="submit" className="text-xs gap-1.5">
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read
            </Button>
          </form>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="h-10 w-10 text-muted-foreground stroke-1" />}
          title="No notifications yet"
          description="You will receive alerts here when someone orders your books, payment is verified, or items are ready for pickup."
          action={
            <Link href="/browse">
              <Button className="bg-brand text-brand-foreground hover:bg-brand/90 font-medium">
                Explore Marketplace
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
