import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Vercel Cron Job — Reservation Expiry Sweep (Section 20)
 * Runs periodically to sweep orders that were abandoned in 'pending_payment'
 * status past their reservation_expires_at window.
 */
export async function GET(request: NextRequest) {
  // Optional security check for CRON_SECRET if configured
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const adminClient = await createAdminClient();
    const now = new Date().toISOString();

    // 1. Find all expired pending orders
    const { data: expiredOrders, error: findError } = await adminClient
      .from('orders')
      .select('id, book_id, buyer_id, order_number')
      .eq('order_status', 'pending_payment')
      .lt('reservation_expires_at', now);

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (!expiredOrders || expiredOrders.length === 0) {
      return NextResponse.json({ sweptCount: 0, message: 'No expired orders found' });
    }

    let sweptCount = 0;

    for (const order of expiredOrders) {
      // 2. Atomic update: mark order expired only if STILL pending_payment
      const { data: updatedOrder } = await adminClient
        .from('orders')
        .update({
          order_status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
        .eq('order_status', 'pending_payment')
        .select('id')
        .maybeSingle();

      if (updatedOrder) {
        sweptCount++;

        // 3. Revert book to available
        await adminClient
          .from('books')
          .update({
            listing_status: 'available',
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.book_id)
          .eq('listing_status', 'reserved');

        // 4. Notify buyer
        await adminClient.from('notifications').insert({
          user_id: order.buyer_id,
          type: 'reservation_expiring',
          title: 'Reservation Expired',
          message: `Your reservation for order #${order.order_number} expired because payment was not submitted within the 30-minute window.`,
          related_order_id: order.id,
          related_book_id: order.book_id,
        });
      }
    }

    return NextResponse.json({
      success: true,
      sweptCount,
      timestamp: now,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Cron sweep failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
