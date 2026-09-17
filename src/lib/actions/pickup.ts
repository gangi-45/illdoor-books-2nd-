'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/actions/auth';
import { verifyPin } from '@/lib/services/pickup';
import { PIN_MAX_ATTEMPTS, PIN_LOCKOUT_MINUTES } from '@/lib/constants';

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Confirm Book Drop-off at Campus Pickup Counter (Section 22)
 * Can be performed by Seller or Campus Staff/Admin.
 * Transitions order: waiting_for_dropoff -> dropped_off -> ready_for_pickup
 */
export async function confirmDropoffAction(orderId: string): Promise<ActionResponse> {
  const { user, profile } = await getCurrentProfile();
  if (!user || !profile) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const adminClient = await createAdminClient();

    const { data: order, error: fetchError } = await adminClient
      .from('orders')
      .select('*, books (title)')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return { success: false, message: 'Order not found' };
    }

    // Authorization: only seller, pickup operator, or admin
    const isSeller = order.seller_id === profile.id;
    const isStaff = profile.role === 'admin' || profile.role === 'pickup_operator';

    if (!isSeller && !isStaff) {
      return { success: false, message: 'Only the seller or campus pickup counter staff can confirm drop-off.' };
    }

    if (order.order_status !== 'paid' && order.order_status !== 'waiting_for_dropoff') {
      return {
        success: false,
        message: `Cannot drop off book for order in "${order.order_status}" status.`,
      };
    }

    const now = new Date().toISOString();
    // PIN expires in 72 hours from when it is ready for pickup
    const pinExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    // 1. Update order to ready_for_pickup
    const { error: updateError } = await adminClient
      .from('orders')
      .update({
        order_status: 'ready_for_pickup',
        pickup_pin_expires_at: pinExpiresAt,
        pickup_pin_attempts: 0,
        pickup_pin_locked_until: null,
        updated_at: now,
      })
      .eq('id', orderId);

    if (updateError) {
      return { success: false, message: 'Failed to update order status' };
    }

    // 2. Record pickup event
    await adminClient.from('pickup_events').insert({
      order_id: orderId,
      event_type: 'dropoff_confirmed',
      performed_by: profile.id,
      metadata: { dropped_by_role: isStaff ? 'staff' : 'seller' },
    });

    // 3. Notify buyer that book is ready for pickup
    await adminClient.from('notifications').insert({
      user_id: order.buyer_id,
      type: 'book_ready_for_pickup',
      title: 'Book Ready for Pickup!',
      message: `"${order.books?.title || 'Your book'}" (Order #${order.order_number}) has arrived at the campus counter. Visit the counter with your student ID to collect it.`,
      related_order_id: orderId,
      related_book_id: order.book_id,
    });

    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/orders');
    return {
      success: true,
      message: 'Book drop-off confirmed. Buyer has been notified that the book is ready for pickup.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to confirm drop-off';
    return { success: false, message };
  }
}

/**
 * Verify Campus Pickup with 6-Digit PIN (Section 24)
 * Patched with brute-force protection:
 * - Counter increments on failed attempts
 * - Locked out for 15 minutes after 5 failed attempts
 * - Only authorized pickup staff or admin can submit PIN checks
 * - Transitions order: ready_for_pickup -> picked_up -> completed
 */
export async function verifyPickupPinAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const { user, profile } = await getCurrentProfile();
  if (!user || !profile) {
    return { success: false, message: 'Unauthorized' };
  }

  // Section 24 Rule: Only authorized pickup operator or admin can submit PIN check
  if (profile.role !== 'admin' && profile.role !== 'pickup_operator') {
    return {
      success: false,
      message: 'Security error: Only authorized campus pickup counter staff can verify PIN codes.',
    };
  }

  const orderId = formData.get('order_id') as string;
  const pinInput = (formData.get('pin') as string)?.trim();

  if (!pinInput || pinInput.length !== 6 || !/^\d{6}$/.test(pinInput)) {
    return {
      success: false,
      message: 'Please enter a valid 6-digit numerical PIN code',
      errors: { pin: ['PIN must be exactly 6 digits'] },
    };
  }

  try {
    const adminClient = await createAdminClient();

    const { data: order, error: fetchError } = await adminClient
      .from('orders')
      .select('*, books (title)')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return { success: false, message: 'Order not found' };
    }

    if (order.order_status !== 'ready_for_pickup') {
      return {
        success: false,
        message: `Order is not in ready_for_pickup status (Current: ${order.order_status}).`,
      };
    }

    const now = new Date();

    // Check Lockout
    if (order.pickup_pin_locked_until && new Date(order.pickup_pin_locked_until) > now) {
      const remainingMinutes = Math.ceil(
        (new Date(order.pickup_pin_locked_until).getTime() - now.getTime()) / 60000
      );
      return {
        success: false,
        message: `Security Lockout Active: Too many failed PIN attempts. Counter locked for ${remainingMinutes} more minute(s).`,
      };
    }

    // Check PIN Expiry
    if (order.pickup_pin_expires_at && new Date(order.pickup_pin_expires_at) < now) {
      return {
        success: false,
        message: 'This pickup PIN has expired. The seller or admin must regenerate it.',
      };
    }

    // Check PIN match against stored hash
    const isValid = verifyPin(pinInput, order.pickup_pin_hash);

    if (!isValid) {
      const attempts = (order.pickup_pin_attempts || 0) + 1;
      const willLock = attempts >= PIN_MAX_ATTEMPTS;
      const lockedUntil = willLock
        ? new Date(Date.now() + PIN_LOCKOUT_MINUTES * 60 * 1000).toISOString()
        : null;

      await adminClient
        .from('orders')
        .update({
          pickup_pin_attempts: attempts,
          pickup_pin_locked_until: lockedUntil,
          updated_at: now.toISOString(),
        })
        .eq('id', orderId);

      if (willLock) {
        return {
          success: false,
          message: `Incorrect PIN. 5 failed attempts reached. PIN verification is now locked for 15 minutes to protect against brute-force attacks.`,
        };
      }

      const remaining = PIN_MAX_ATTEMPTS - attempts;
      return {
        success: false,
        message: `Incorrect pickup PIN. ${remaining} attempt(s) remaining before security lockout.`,
      };
    }

    // Successful Verification!
    // Transitions: ready_for_pickup -> completed
    const completedAt = now.toISOString();

    const { error: completeError } = await adminClient
      .from('orders')
      .update({
        order_status: 'completed',
        payment_status: 'released',
        completed_at: completedAt,
        updated_at: completedAt,
      })
      .eq('id', orderId);

    if (completeError) {
      return { success: false, message: 'Failed to complete order' };
    }

    // Update book status to 'sold'
    await adminClient
      .from('books')
      .update({
        listing_status: 'sold',
        updated_at: completedAt,
      })
      .eq('id', order.book_id);

    // Record pickup confirmed event
    await adminClient.from('pickup_events').insert({
      order_id: orderId,
      event_type: 'pickup_confirmed',
      performed_by: profile.id,
      metadata: { verified_by_staff: profile.full_name },
    });

    // Notify buyer
    await adminClient.from('notifications').insert({
      user_id: order.buyer_id,
      type: 'order_completed',
      title: 'Order Completed',
      message: `You have successfully picked up "${order.books?.title}". Don't forget to leave a review for the seller!`,
      related_order_id: orderId,
      related_book_id: order.book_id,
    });

    // Notify seller
    await adminClient.from('notifications').insert({
      user_id: order.seller_id,
      type: 'order_completed',
      title: 'Book Handover Completed & Payout Released',
      message: `Buyer has collected "${order.books?.title}". Your seller payout of ৳${order.seller_payout} is released!`,
      related_order_id: orderId,
      related_book_id: order.book_id,
    });

    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/orders');
    return {
      success: true,
      message: 'PIN verified successfully! Book handover is confirmed and transaction is marked Completed.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'PIN verification failed';
    return { success: false, message };
  }
}
