'use client';

import { useState, useTransition } from 'react';
import {
  updateUserVerificationAction,
  updateUserAccountStatusAction,
} from '@/lib/actions/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertTriangle,
  Check,
  X,
  Loader2,
  Ban,
  UserCheck,
} from 'lucide-react';
import type { Profile } from '@/types/database';

interface UserVerifyRowProps {
  profile: Profile & { departments?: { name: string } | null };
}

export function UserVerifyRow({ profile }: UserVerifyRowProps) {
  const [isPending, startTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const handleVerify = () => {
    startTransition(async () => {
      await updateUserVerificationAction(profile.id, 'verified');
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    startTransition(async () => {
      await updateUserVerificationAction(profile.id, 'rejected', rejectReason);
      setShowRejectInput(false);
    });
  };

  const handleToggleSuspend = () => {
    const nextStatus = profile.account_status === 'suspended' ? 'active' : 'suspended';
    startTransition(async () => {
      await updateUserAccountStatusAction(profile.id, nextStatus);
    });
  };

  return (
    <tr className="border-b text-xs hover:bg-muted/30 transition-colors">
      <td className="p-3">
        <div className="font-semibold text-foreground">{profile.full_name}</div>
        <div className="text-[11px] text-muted-foreground">{profile.email}</div>
      </td>

      <td className="p-3 font-mono">{profile.student_id}</td>

      <td className="p-3 text-muted-foreground">
        {profile.departments?.name || 'Computer Technology'}
      </td>

      <td className="p-3">
        {profile.verification_status === 'verified' && (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
            Verified
          </Badge>
        )}
        {profile.verification_status === 'pending' && (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 text-[10px]">
            Pending Review
          </Badge>
        )}
        {profile.verification_status === 'unverified' && (
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            Unverified
          </Badge>
        )}
        {profile.verification_status === 'rejected' && (
          <Badge variant="destructive" className="text-[10px]">
            Rejected
          </Badge>
        )}
      </td>

      <td className="p-3">
        <span
          className={`capitalize font-medium ${
            profile.account_status === 'suspended' ? 'text-destructive' : 'text-foreground'
          }`}
        >
          {profile.account_status}
        </span>
      </td>

      <td className="p-3 text-right">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin ml-auto text-muted-foreground" />
        ) : (
          <div className="flex items-center justify-end gap-1.5 flex-wrap">
            {profile.verification_status !== 'verified' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleVerify}
                className="h-7 px-2 text-[11px] border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1"
              >
                <Check className="h-3 w-3" /> Verify
              </Button>
            )}

            {profile.verification_status !== 'rejected' && (
              <>
                {showRejectInput ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Reason..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="h-7 px-2 text-[11px] rounded border bg-background w-28"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleReject}
                      className="h-7 px-2 text-[11px]"
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRejectInput(false)}
                      className="h-7 px-1 text-[11px]"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRejectInput(true)}
                    className="h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive gap-1"
                  >
                    <X className="h-3 w-3" /> Reject
                  </Button>
                )}
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleSuspend}
              className={`h-7 px-2 text-[11px] ${
                profile.account_status === 'suspended'
                  ? 'text-emerald-600'
                  : 'text-muted-foreground hover:text-destructive'
              }`}
            >
              {profile.account_status === 'suspended' ? 'Restore' : 'Suspend'}
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}
