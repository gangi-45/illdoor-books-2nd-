import { createAdminClient, createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import type { Order, OrderStatus } from '@/types/database';
import { getRuntimeOrders } from '@/lib/services/runtime-store';

export interface OrderWithDetails extends Order {
  books?: {
    id: string;
    title: string;
    subject_code: string;
    condition: string;
    original_price: number;
    selling_price: number;
    book_images?: { public_url: string }[];
  } | null;
  buyer?: {
    id: string;
    full_name: string;
    student_id: string;
    phone: string;
  } | null;
  seller?: {
    id: string;
    full_name: string;
    student_id: string;
    phone: string;
  } | null;
  pickup_points?: {
    id: string;
    name: string;
    location_description: string | null;
    opening_time: string | null;
    closing_time: string | null;
    phone: string | null;
  } | null;
}

/**
 * Lazy expiry check for orders whose reservation window has passed.
 * (Section 20: cheap, immediate check whenever order is read)
 */
export async function lazyCheckOrderExpiry(order: OrderWithDetails): Promise<OrderWithDetails> {
  if (
    order.order_status === 'pending_payment' &&
    order.reservation_expires_at &&
    new Date(order.reservation_expires_at).getTime() < Date.now()
  ) {
    try {
      const adminClient = await createAdminClient();

      // Atomic update: expire order only if still pending_payment
      const { error: orderError } = await adminClient
        .from('orders')
        .update({
          order_status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
        .eq('order_status', 'pending_payment');

      if (!orderError) {
        // Revert book to available
        await adminClient
          .from('books')
          .update({
            listing_status: 'available',
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.book_id)
          .eq('listing_status', 'reserved');

        // Notify buyer that reservation expired
        await adminClient.from('notifications').insert({
          user_id: order.buyer_id,
          type: 'reservation_expiring',
          title: 'Reservation Expired',
          message: `Your 30-minute reservation for "${order.books?.title || 'the book'}" (Order #${order.order_number}) has expired. The book is now available for other students.`,
          related_order_id: order.id,
          related_book_id: order.book_id,
        });

        return {
          ...order,
          order_status: 'expired',
        };
      }
    } catch {
      // Return order as is if update failed
    }
  }

  return order;
}

/**
 * Fetch a single order with joined relationships and security authorization check.
 */
export async function getOrderById(
  orderId: string,
  currentProfileId: string
): Promise<OrderWithDetails | null> {
  // Check runtime store first
  const runtimeOrder = getRuntimeOrders().find((o) => o.id === orderId);
  if (runtimeOrder) {
    if (
      runtimeOrder.buyer_id === currentProfileId ||
      runtimeOrder.seller_id === currentProfileId ||
      currentProfileId.includes('99') // admin check
    ) {
      return await lazyCheckOrderExpiry(runtimeOrder);
    }
  }

  if (!isSupabaseConfigured()) {
    return runtimeOrder || null;
  }

  try {
    const adminClient = await createAdminClient();
    const { data: order, error } = await adminClient
      .from('orders')
      .select(
        `
        *,
        books (id, title, subject_code, condition, original_price, selling_price, book_images (public_url)),
        buyer:profiles!buyer_id (id, full_name, student_id, phone),
        seller:profiles!seller_id (id, full_name, student_id, phone),
        pickup_points (id, name, location_description, opening_time, closing_time, phone)
      `
      )
      .eq('id', orderId)
      .single();

    if (error || !order) return null;

    // Security Authorization Check:
    // Only the buyer, the seller, or an admin/pickup operator can view order details (Section 32, 44)
    const typedOrder = order as unknown as OrderWithDetails;
    if (typedOrder.buyer_id !== currentProfileId && typedOrder.seller_id !== currentProfileId) {
      // Check if user has admin/operator role
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', currentProfileId)
        .single();

      if (profile?.role !== 'admin' && profile?.role !== 'pickup_operator') {
        return null;
      }
    }

    // Run lazy reservation check
    return await lazyCheckOrderExpiry(typedOrder);
  } catch {
    return null;
  }
}

/**
 * Fetch all orders for a user (purchases and sales)
 */
export async function getUserOrders(profileId: string): Promise<{
  purchases: OrderWithDetails[];
  sales: OrderWithDetails[];
}> {
  const runtimeOrders = getRuntimeOrders();
  const runtimePurchases = runtimeOrders.filter((o) => o.buyer_id === profileId);
  const runtimeSales = runtimeOrders.filter((o) => o.seller_id === profileId);

  if (!isSupabaseConfigured()) {
    const checkedPurchases = await Promise.all(runtimePurchases.map(lazyCheckOrderExpiry));
    const checkedSales = await Promise.all(runtimeSales.map(lazyCheckOrderExpiry));
    return {
      purchases: checkedPurchases,
      sales: checkedSales,
    };
  }

  try {
    const adminClient = await createAdminClient();

    const [purchasesRes, salesRes] = await Promise.all([
      adminClient
        .from('orders')
        .select(
          `
          *,
          books (id, title, subject_code, condition, original_price, selling_price, book_images (public_url)),
          seller:profiles!seller_id (id, full_name, student_id, phone),
          pickup_points (id, name, location_description, opening_time, closing_time)
        `
        )
        .eq('buyer_id', profileId)
        .order('created_at', { ascending: false }),

      adminClient
        .from('orders')
        .select(
          `
          *,
          books (id, title, subject_code, condition, original_price, selling_price, book_images (public_url)),
          buyer:profiles!buyer_id (id, full_name, student_id, phone),
          pickup_points (id, name, location_description, opening_time, closing_time)
        `
        )
        .eq('seller_id', profileId)
        .order('created_at', { ascending: false }),
    ]);

    const dbPurchases = (purchasesRes.data || []) as unknown as OrderWithDetails[];
    const dbSales = (salesRes.data || []) as unknown as OrderWithDetails[];

    const combinedPurchases = [...runtimePurchases, ...dbPurchases];
    const combinedSales = [...runtimeSales, ...dbSales];

    // Run lazy expiry checks
    const checkedPurchases = await Promise.all(combinedPurchases.map(lazyCheckOrderExpiry));
    const checkedSales = await Promise.all(combinedSales.map(lazyCheckOrderExpiry));

    return {
      purchases: checkedPurchases,
      sales: checkedSales,
    };
  } catch {
    const checkedPurchases = await Promise.all(runtimePurchases.map(lazyCheckOrderExpiry));
    const checkedSales = await Promise.all(runtimeSales.map(lazyCheckOrderExpiry));
    return { purchases: checkedPurchases, sales: checkedSales };
  }
}
