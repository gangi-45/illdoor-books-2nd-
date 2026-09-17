'use client';

import { useActionState, useState } from 'react';
import { updateSettingAction } from '@/lib/actions/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SETTINGS_KEYS } from '@/lib/constants';
import { Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface SettingsFormProps {
  initialSettings: Record<string, string>;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [feePercent, setFeePercent] = useState(
    initialSettings[SETTINGS_KEYS.PLATFORM_FEE_PERCENT] || '5'
  );
  const [expiryMinutes, setExpiryMinutes] = useState(
    initialSettings[SETTINGS_KEYS.RESERVATION_EXPIRY_MINUTES] || '30'
  );
  const [dropoffHours, setDropoffHours] = useState(
    initialSettings[SETTINGS_KEYS.DROPOFF_DEADLINE_HOURS] || '48'
  );
  const [bkashNumber, setBkashNumber] = useState(
    initialSettings[SETTINGS_KEYS.BKASH_NUMBER] || '01711223344'
  );
  const [nagadNumber, setNagadNumber] = useState(
    initialSettings[SETTINGS_KEYS.NAGAD_NUMBER] || '01811223344'
  );
  const [contactEmail, setContactEmail] = useState(
    initialSettings[SETTINGS_KEYS.CONTACT_EMAIL] || 'admin@polytechnicbooks.com'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus(null);

    try {
      await Promise.all([
        updateSettingAction(SETTINGS_KEYS.PLATFORM_FEE_PERCENT, feePercent),
        updateSettingAction(SETTINGS_KEYS.RESERVATION_EXPIRY_MINUTES, expiryMinutes),
        updateSettingAction(SETTINGS_KEYS.DROPOFF_DEADLINE_HOURS, dropoffHours),
        updateSettingAction(SETTINGS_KEYS.BKASH_NUMBER, bkashNumber),
        updateSettingAction(SETTINGS_KEYS.NAGAD_NUMBER, nagadNumber),
        updateSettingAction(SETTINGS_KEYS.CONTACT_EMAIL, contactEmail),
      ]);

      setStatus({ success: true, message: 'Platform settings saved successfully!' });
    } catch {
      setStatus({ success: false, message: 'Failed to update settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status && (
        <div
          className={`flex items-center gap-2 p-3 text-xs rounded-lg border ${
            status.success
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-destructive/10 text-destructive border-destructive/20'
          }`}
        >
          {status.success ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* Financial & Fee Rules */}
      <div className="p-6 rounded-2xl bg-card border space-y-4 shadow-xs">
        <h3 className="font-semibold text-sm border-b pb-3">Financial & Platform Rules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fee" className="text-xs">Platform Service Fee (%)</Label>
            <Input
              id="fee"
              type="number"
              value={feePercent}
              onChange={(e) => setFeePercent(e.target.value)}
              className="text-xs"
              min={0}
              max={50}
              required
            />
            <p className="text-[10px] text-muted-foreground">Default: 5% of selling price</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expiry" className="text-xs">Reservation Expiry (Minutes)</Label>
            <Input
              id="expiry"
              type="number"
              value={expiryMinutes}
              onChange={(e) => setExpiryMinutes(e.target.value)}
              className="text-xs"
              min={5}
              max={1440}
              required
            />
            <p className="text-[10px] text-muted-foreground">Default: 30 minutes</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dropoff" className="text-xs">Drop-off Deadline (Hours)</Label>
            <Input
              id="dropoff"
              type="number"
              value={dropoffHours}
              onChange={(e) => setDropoffHours(e.target.value)}
              className="text-xs"
              min={1}
              max={168}
              required
            />
            <p className="text-[10px] text-muted-foreground">Default: 48 hours</p>
          </div>
        </div>
      </div>

      {/* Manual Payment Numbers */}
      <div className="p-6 rounded-2xl bg-card border space-y-4 shadow-xs">
        <h3 className="font-semibold text-sm border-b pb-3">Manual Payment Account Numbers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="bkash" className="text-xs">bKash (Send Money Number)</Label>
            <Input
              id="bkash"
              value={bkashNumber}
              onChange={(e) => setBkashNumber(e.target.value)}
              className="text-xs font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nagad" className="text-xs">Nagad (Send Money Number)</Label>
            <Input
              id="nagad"
              value={nagadNumber}
              onChange={(e) => setNagadNumber(e.target.value)}
              className="text-xs font-mono"
              required
            />
          </div>
        </div>
      </div>

      {/* Support Info */}
      <div className="p-6 rounded-2xl bg-card border space-y-4 shadow-xs">
        <h3 className="font-semibold text-sm border-b pb-3">Contact & Support</h3>
        <div className="space-y-1.5 max-w-sm">
          <Label htmlFor="email" className="text-xs">Admin Contact Email</Label>
          <Input
            id="email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="text-xs"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSaving}
        className="bg-brand text-brand-foreground hover:bg-brand/90 font-medium text-xs gap-2"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Saving Changes...
          </>
        ) : (
          <>
            <Save className="h-3.5 w-3.5" />
            Save Platform Settings
          </>
        )}
      </Button>
    </form>
  );
}
