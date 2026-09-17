'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/actions/auth';
import type { AccountStatus, VerificationStatus, ListingStatus, OrderStatus } from '@/types/database';

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

async function requireAdmin() {
  const { user, profile } = await getCurrentProfile();
  if (!user || !profile || profile.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  return { user, profile };
}

/**
 * Update student verification status (Verify or Reject with reason)
 * Section 6: Manual verification queue
 */
export async function updateUserVerificationAction(
  profileId: string,
  status: VerificationStatus,
  rejectionReason?: string | null
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const adminClient = await createAdminClient();

    const { data: updatedProfile, error } = await adminClient
      .from('profiles')
      .update({
        verification_status: status,
        verification_rejection_reason: status === 'rejected' ? rejectionReason || 'Information or student ID card does not match.' : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId)
      .select('auth_user_id, full_name')
      .single();

    if (error) return { success: false, message: error.message };

    // Send notification to the user
    await adminClient.from('notifications').insert({
      user_id: profileId,
      type: 'system_notice',
      title: status === 'verified' ? 'Student Verification Approved!' : 'Student Verification Rejected',
      message:
        status === 'verified'
          ? 'Congratulations! Your student ID has been verified. You can now sell books, buy textbooks, and leave reviews.'
          : `Verification rejected: ${rejectionReason || 'Please submit a clearer student ID photo.'}`,
    });

    revalidatePath('/admin/users');
    return { success: true, message: `Student status updated to ${status}` };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : 'Action failed' };
  }
}

/**
 * Update user account status (active, warning, restricted, suspended)
 */
export async function updateUserAccountStatusAction(
  profileId: string,
  accountStatus: AccountStatus
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const adminClient = await createAdminClient();

    const { error } = await adminClient
      .from('profiles')
      .update({
        account_status: accountStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId);

    if (error) return { success: false, message: error.message };

    revalidatePath('/admin/users');
    return { success: true, message: `User account status changed to ${accountStatus}` };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : 'Action failed' };
  }
}

/**
 * Admin payment check-off (Section 23)
 * Confirms buyer's submitted TrxID matches statement.
 * Transitions order: pending_payment -> paid -> waiting_for_dropoff
 * Notifies seller to drop off book at campus point.
 */
export async function confirmOrderPaymentAction(orderId: string): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const adminClient = await createAdminClient();

    const { data: order, error: fetchError } = await adminClient
      .from('orders')
      .select('*, books (title), pickup_points (name)')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) return { success: false, message: 'Order not found' };

    const now = new Date().toISOString();

    // 1. Update order
    const { error: updateError } = await adminClient
      .from('orders')
      .update({
        payment_status: 'paid',
        order_status: 'waiting_for_dropoff',
        updated_at: now,
      })
      .eq('id', orderId);

    if (updateError) return { success: false, message: updateError.message };

    // 2. Notify buyer that payment was verified
    await adminClient.from('notifications').insert({
      user_id: order.buyer_id,
      type: 'payment_confirmed',
      title: 'Payment Confirmed',
      message: `Your payment for order #${order.order_number} has been verified. The seller has been notified to drop off "${order.books?.title}" at ${order.pickup_points?.name || 'the campus counter'}.`,
      related_order_id: orderId,
    });

    // 3. Notify seller to drop off book
    await adminClient.from('notifications').insert({
      user_id: order.seller_id,
      type: 'dropoff_reminder',
      title: 'Drop-off Required',
      message: `Payment confirmed for "${order.books?.title}" (Order #${order.order_number})! Please drop off the book at ${order.pickup_points?.name || 'the campus counter'}.`,
      related_order_id: orderId,
    });

    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/admin/orders');
    return { success: true, message: 'Payment confirmed. Seller has been notified to drop off the book.' };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : 'Action failed' };
  }
}

/**
 * Update Book listing visibility (available, inactive)
 */
export async function updateBookStatusAction(
  bookId: string,
  status: ListingStatus
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const adminClient = await createAdminClient();

    const { error } = await adminClient
      .from('books')
      .update({
        listing_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookId);

    if (error) return { success: false, message: error.message };

    revalidatePath('/admin/books');
    revalidatePath('/browse');
    return { success: true, message: `Book status updated to ${status}` };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : 'Action failed' };
  }
}

/**
 * Update Report Status (investigating, resolved, dismissed)
 */
export async function updateReportStatusAction(
  reportId: string,
  status: 'open' | 'investigating' | 'resolved' | 'dismissed',
  resolutionNotes?: string
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const adminClient = await createAdminClient();

    const { error } = await adminClient
      .from('reports')
      .update({
        status,
        resolution_notes: resolutionNotes || null,
        resolved_at: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (error) return { success: false, message: error.message };

    revalidatePath('/admin/reports');
    return { success: true, message: `Report marked as ${status}` };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : 'Action failed' };
  }
}

/**
 * Update Platform Settings (fee, deadlines, numbers)
 */
export async function updateSettingAction(key: string, value: string): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const adminClient = await createAdminClient();

    const { error } = await adminClient
      .from('settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });

    if (error) return { success: false, message: error.message };

    revalidatePath('/admin/settings');
    return { success: true, message: `Setting "${key}" updated.` };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : 'Action failed' };
  }
}
