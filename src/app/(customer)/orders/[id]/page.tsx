import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentProfile } from '@/lib/actions/auth';
import { getOrderById } from '@/lib/services/orders';
import { OrderTimeline } from '@/components/orders/order-timeline';
import { PaymentReferenceForm } from '@/components/orders/payment-reference-form';
import { ReviewForm } from '@/components/orders/review-form';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  Building2,
  Calendar,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order Details | Polytechnic Used Books`,
  };
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const { id } = await params;
  const { user, profile } = await getCurrentProfile();

  if (!user || !profile) {
    redirect(`/login?redirect=/orders/${id}`);
  }

  const order = await getOrderById(id, profile.id);

  if (!order) {
    notFound();
  }

  const isBuyer = order.buyer_id === profile.id;
  const isSeller = order.seller_id === profile.id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to My Orders
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold tracking-tight">Order #{order.order_number}</h1>
            <StatusBadge type="order" value={order.order_status} />
            <StatusBadge type="payment" value={order.payment_status} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
          </p>
        </div>

        {/* Counterparty Summary */}
        <div className="text-left sm:text-right text-xs text-muted-foreground">
          {isBuyer ? (
            <div>
              <span className="block font-medium text-foreground">Seller: {order.seller?.full_name}</span>
              <span>Roll: {order.seller?.student_id}</span>
            </div>
          ) : (
            <div>
              <span className="block font-medium text-foreground">Buyer: {order.buyer?.full_name}</span>
              <span>Roll: {order.buyer?.student_id}</span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Order Progress
        </h2>
        <OrderTimeline status={order.order_status} />
      </div>

      {/* Contextual Action Areas based on current status */}
      {/* 1. Pending Payment State (Buyer) */}
      {isBuyer && order.order_status === 'pending_payment' && (
        <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-xs">
          <PaymentReferenceForm
            orderId={order.id}
            orderNumber={order.order_number}
            amount={order.item_price}
            existingReference={order.payment_reference}
            reservationExpiresAt={order.reservation_expires_at}
          />
        </div>
      )}

      {/* 2. Waiting for Drop-off Notice (Seller) */}
      {isSeller && (order.order_status === 'paid' || order.order_status === 'waiting_for_dropoff') && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 space-y-3">
          <div className="flex items-center gap-2 font-bold text-base">
            <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span>Drop-off Required (বই জমা দেওয়ার নির্দেশিকা)</span>
          </div>
          <p className="text-xs leading-relaxed">
            Payment has been confirmed! Please bring &quot;{order.books?.title}&quot; to the campus counter at <strong>{order.pickup_points?.name}</strong>. Counter staff will confirm receipt and mark it ready for the buyer.
          </p>
        </div>
      )}

      {/* 3. Ready for Pickup & PIN Display (Buyer) */}
      {isBuyer && (order.order_status === 'ready_for_pickup' || order.order_status === 'dropped_off') && (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-900 dark:text-emerald-200 space-y-3">
          <div className="flex items-center gap-2 font-bold text-base">
            <KeyRound className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Book Ready for Campus Pickup (বই সংগ্রহের জন্য প্রস্তুত)</span>
          </div>
          <p className="text-xs leading-relaxed">
            The book has arrived at the campus pickup point (<strong>{order.pickup_points?.name}</strong>).
            Visit the counter during operating hours. Provide order <strong>#{order.order_number}</strong> and your student ID to verify pickup.
          </p>
        </div>
      )}

      {/* 4. Completed State & Review Form */}
      {order.order_status === 'completed' && (
        <div className="space-y-4">
          <ReviewForm
            orderId={order.id}
            revieweeId={isBuyer ? order.seller_id : order.buyer_id}
            revieweeName={isBuyer ? (order.seller?.full_name || 'Seller') : (order.buyer?.full_name || 'Buyer')}
          />
        </div>
      )}

      {/* Order Item & Location Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Book Details Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-semibold text-sm border-b pb-3">Book Details</h3>
          <div className="flex gap-4">
            <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-muted shrink-0 border">
              {order.books?.book_images?.[0]?.public_url ? (
                <Image
                  src={order.books.book_images[0].public_url}
                  alt={order.books.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
            <div className="space-y-1.5 min-w-0">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand/10 text-brand">
                {order.books?.subject_code}
              </span>
              <h4 className="font-bold text-base leading-tight truncate">{order.books?.title}</h4>
              <p className="text-xs text-muted-foreground capitalize">
                Condition: {order.books?.condition.replace('_', ' ')}
              </p>
              <p className="text-lg font-extrabold text-brand pt-1">
                ৳{order.item_price}
              </p>
            </div>
          </div>
        </div>

        {/* Pickup Point Details Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-semibold text-sm border-b pb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand" />
            Pickup Location
          </h3>
          <div className="space-y-2 text-xs">
            <p className="font-semibold text-sm">{order.pickup_points?.name || 'Central Campus Counter'}</p>
            <p className="text-muted-foreground">{order.pickup_points?.location_description}</p>
            <div className="flex items-center gap-2 text-muted-foreground pt-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Hours: {order.pickup_points?.opening_time?.slice(0, 5) || '09:00'} - {order.pickup_points?.closing_time?.slice(0, 5) || '17:00'}</span>
            </div>
            {order.pickup_points?.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>Contact: {order.pickup_points.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
