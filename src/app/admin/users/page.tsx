import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { UserVerifyRow } from '@/components/admin/user-verify-row';
import { Card } from '@/components/ui/card';
import { Users, ShieldCheck } from 'lucide-react';
import type { Profile } from '@/types/database';

export const metadata: Metadata = {
  title: 'Student Verification | Admin Console',
};

export default async function AdminUsersPage() {
  const adminClient = await createAdminClient();

  const { data: profiles } = await adminClient
    .from('profiles')
    .select('*, departments (name)')
    .order('created_at', { ascending: false });

  const list = (profiles || []) as (Profile & { departments?: { name: string } | null })[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Accounts & Verification</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review student IDs, approve marketplace verification, or restrict accounts.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="p-3">Student</th>
                <th className="p-3">Roll No</th>
                <th className="p-3">Technology</th>
                <th className="p-3">Verification</th>
                <th className="p-3">Account</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length > 0 ? (
                list.map((profile) => (
                  <UserVerifyRow key={profile.id} profile={profile} />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground">
                    No registered students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
