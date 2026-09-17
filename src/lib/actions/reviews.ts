'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/actions/auth';
import { reviewSchema } from '@/lib/validations';
import type { Review } from '@/types/database';

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Submit a Review for a Completed Order (Section 27)
 * Rules:
 * - Only completed orders can generate a review
 * - Buyer reviews seller, seller reviews buyer
 * - Prevent duplicate reviews per (order_id, reviewer_id)
 * - No self-reviews
 */
export async function createReviewAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const { user, profile } = await getCurrentProfile();
  if (!user || !profile) {
    return { success: false, message: 'Unauthorized' };
  }

  const rawData = {
    order_id: formData.get('order_id') as string,
    reviewee_id: formData.get('reviewee_id') as string,
    rating: parseInt(formData.get('rating') as string, 10),
    comment: (formData.get('comment') as string) || null,
  };

  const parsed = reviewSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Please provide a valid rating (1-5)',
    };
  }

  // Rule: No self-reviews
  if (parsed.data.reviewee_id === profile.id) {
    return { success: false, message: 'You cannot review yourself.' };
  }

  try {
    const adminClient = await createAdminClient();

    // 1. Verify order
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('*')
      .eq('id', parsed.data.order_id)
      .single();

    if (orderError || !order) {
      return { success: false, message: 'Order not found' };
    }

    // Rule: Only completed orders can be reviewed
    if (order.order_status !== 'completed') {
      return {
        success: false,
        message: 'Reviews can only be submitted after the book transaction is completed.',
      };
    }

    // Rule: Reviewer must be either the buyer or seller of the order
    const isParticipant =
      order.buyer_id === profile.id || order.seller_id === profile.id;
    if (!isParticipant) {
      return {
        success: false,
        message: 'Only transaction participants can leave a review.',
      };
    }

    // Rule: Prevent duplicate review per (order_id, reviewer_id)
    const { data: existingReview } = await adminClient
      .from('reviews')
      .select('id')
      .eq('order_id', parsed.data.order_id)
      .eq('reviewer_id', profile.id)
      .maybeSingle();

    if (existingReview) {
      return {
        success: false,
        message: 'You have already submitted a review for this order.',
      };
    }

    // 2. Insert review
    const { error: insertError } = await adminClient.from('reviews').insert({
      order_id: parsed.data.order_id,
      reviewer_id: profile.id,
      reviewee_id: parsed.data.reviewee_id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    if (insertError) {
      return { success: false, message: insertError.message };
    }

    // 3. Notify reviewee
    await adminClient.from('notifications').insert({
      user_id: parsed.data.reviewee_id,
      type: 'new_review',
      title: 'New Review Received',
      message: `${profile.full_name} gave you a ${parsed.data.rating}-star review for Order #${order.order_number}.`,
      related_order_id: order.id,
    });

    revalidatePath(`/orders/${order.id}`);
    return {
      success: true,
      message: 'Review submitted successfully! Thank you for helping build campus trust.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit review';
    return { success: false, message };
  }
}
