'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/actions/auth';
import type { Notification } from '@/types/database';

export async function getUserNotifications(): Promise<Notification[]> {
  const { user, profile } = await getCurrentProfile();
  if (!user || !profile) return [];

  try {
    const adminClient = await createAdminClient();
    const { data, error } = await adminClient
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];
    return data as Notification[];
  } catch {
    return [];
  }
}

export async function markNotificationAsReadAction(notificationId: string): Promise<void> {
  const { user, profile } = await getCurrentProfile();
  if (!user || !profile) return;

  try {
    const adminClient = await createAdminClient();
    await adminClient
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', profile.id);

    revalidatePath('/notifications');
  } catch {}
}

export async function markAllNotificationsAsReadAction(): Promise<void> {
  const { user, profile } = await getCurrentProfile();
  if (!user || !profile) return;

  try {
    const adminClient = await createAdminClient();
    await adminClient
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', profile.id)
      .is('read_at', null);

    revalidatePath('/notifications');
  } catch {}
}
