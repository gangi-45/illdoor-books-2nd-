import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { SettingsForm } from '@/components/admin/settings-form';
import { SETTINGS_KEYS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Platform Settings | Admin Console',
};

export default async function AdminSettingsPage() {
  const adminClient = await createAdminClient();

  const { data: settingsRows } = await adminClient.from('settings').select('*');

  const settingsMap: Record<string, string> = {
    [SETTINGS_KEYS.PLATFORM_FEE_PERCENT]: '5',
    [SETTINGS_KEYS.RESERVATION_EXPIRY_MINUTES]: '30',
    [SETTINGS_KEYS.DROPOFF_DEADLINE_HOURS]: '48',
    [SETTINGS_KEYS.BKASH_NUMBER]: '01711223344',
    [SETTINGS_KEYS.NAGAD_NUMBER]: '01811223344',
    [SETTINGS_KEYS.CONTACT_EMAIL]: 'admin@polytechnicbooks.com',
  };

  if (settingsRows) {
    for (const row of settingsRows) {
      settingsMap[row.key] = row.value;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Configuration</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure platform service fees, reservation timeout windows, and campus payment numbers.
        </p>
      </div>

      <SettingsForm initialSettings={settingsMap} />
    </div>
  );
}
