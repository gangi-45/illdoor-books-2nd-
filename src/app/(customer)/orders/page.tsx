import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentProfile } from '@/lib/actions/auth';
import { getUserOrders } from '@/lib/services/orders';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  ShoppingBag,
  Package,
  BookOpen,
  ArrowRight,
  Clock,
  MapPin,
} from 'lucide-react';
import Image from 'next/image';
import type { OrderWithDetails } from '@/lib/services/orders';

export const metadata: Metadata = {
  title: 'My Orders | Polytechnic Used Book Marketplace',
  description: 'Manage your textbook purchases and campus drop-offs.',
};

export default async function OrdersPage() {
  const { user, profile } = await getCurrentProfile();

  if (!user || !profile) {
    redirect('/login?redirect=/orders');
  }

  const { purchases, sales } = await getUserOrders(profile.id);

  const renderOrderList = (orderList: OrderWithDetails[], isSeller = false) => {
    if (orderList.length === 0) {
      return (
        <EmptyState
          icon={<ShoppingBag className="h-10 w-10 text-muted-foreground stroke-1" />}
          title={isSeller ? 'No book sales yet' : 'No purchase orders yet'}
          description={
            isSeller
              ? 'When another student orders one of your listed books, it will appear here.'
              : 'Browse our campus catalog and purchase textbooks needed for your semester.'
          }
          action={
            <Link href={isSeller ? '/sell' : '/browse'}>
              <Button className="bg-brand text-brand-foreground hover:bg-brand/90 font-medium">
                {isSeller ? 'Sell a Book' : 'Browse Marketplace'}
              </Button>
            </Link>
          }
        />
      );
    }

    return (
      <div className="space-y-4">
        {orderList.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`} className="block group">
            <Card className="hover:shadow-md hover:border-brand/40 transition-all">
              <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-muted shrink-0 border">
                    {order.books?.book_images?.[0]?.public_url ? (
                      <Image
                        src={order.books.book_images[0].public_url}
                        alt={order.books.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[10px] text-muted-foreground">
                        Book
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-brand">
                        #{order.order_number}
                      </span>
                      <StatusBadge type="order" value={order.order_status} className="text-[11px]" />
                      <StatusBadge type="payment" value={order.payment_status} className="text-[11px]" />
                    </div>

                    <h3 className="font-bold text-base leading-tight group-hover:text-brand transition-colors truncate">
                      {order.books?.title}
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      {isSeller ? (
                        <>Buyer: {order.buyer?.full_name} (Roll: {order.buyer?.student_id})</>
                      ) : (
                        <>Seller: {order.seller?.full_name} (Roll: {order.seller?.student_id})</>
                      )}
                    </p>

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                      <MapPin className="h-3 w-3 text-brand" />
                      <span>{order.pickup_points?.name}</span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 flex sm:flex-col justify-between items-center sm:items-end gap-2">
                  <span className="text-lg font-extrabold text-foreground">
                    ৳{order.item_price}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand group-hover:translate-x-0.5 transition-transform">
                    View Details <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track active book purchases, payments, and campus drop-offs
        </p>
      </div>

      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="purchases" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Purchases ({purchases.length})
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2">
            <Package className="h-4 w-4" />
            Sales ({sales.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="space-y-4">
          {renderOrderList(purchases, false)}
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          {renderOrderList(sales, true)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
