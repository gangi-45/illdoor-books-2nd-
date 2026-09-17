'use client';

import { useActionState } from 'react';
import { updateProfileAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Profile, Semester } from '@/types/database';
import { Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface ProfileEditFormProps {
  profile: Profile;
  semesters: Semester[];
}

export function ProfileEditForm({ profile, semesters }: ProfileEditFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, {
    success: false,
  });

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <div
          className={`flex items-center gap-2 p-3 text-sm rounded-lg border ${
            state.success
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-destructive/10 text-destructive border-destructive/20'
          }`}
        >
          {state.success ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={profile.full_name}
            required
          />
          {state.errors?.full_name && (
            <p className="text-xs text-destructive">{state.errors.full_name[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={profile.phone}
            required
          />
          {state.errors?.phone && (
            <p className="text-xs text-destructive">{state.errors.phone[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="semester_id">Current Semester</Label>
        <select
          id="semester_id"
          name="semester_id"
          defaultValue={profile.semester_id}
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          {semesters.map((sem) => (
            <option key={sem.id} value={sem.id}>
              {sem.name}
            </option>
          ))}
        </select>
        {state.errors?.semester_id && (
          <p className="text-xs text-destructive">{state.errors.semester_id[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="gap-2">
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
    </form>
  );
}
