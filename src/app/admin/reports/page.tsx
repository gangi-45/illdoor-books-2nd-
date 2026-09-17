import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { ReportAdminRow } from '@/components/admin/report-admin-row';
import { Card } from '@/components/ui/card';
import type { Report } from '@/types/database';

export const metadata: Metadata = {
  title: 'Reports Inbox | Admin Console',
};

export default async function AdminReportsPage() {
  const adminClient = await createAdminClient();

  const { data: reports } = await adminClient
    .from('reports')
    .select(
      `
      *,
      reporter:profiles!reporter_id (full_name, student_id),
      books (id, title)
    `
    )
    .order('created_at', { ascending: false });

  const list = (reports || []) as unknown as (Report & {
    reporter?: { full_name: string; student_id: string } | null;
    books?: { id: string; title: string } | null;
  })[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Incident Reports Inbox</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Process user reports regarding fake listings, condition mismatches, or missed handovers.
        </p>
      </div>

      <Card className="overflow-hidden border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="p-3">Category & Details</th>
                <th className="p-3">Reporter</th>
                <th className="p-3">Related Book</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length > 0 ? (
                list.map((report) => (
                  <ReportAdminRow key={report.id} report={report} />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-muted-foreground">
                    No active incident reports.
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
