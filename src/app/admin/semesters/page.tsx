import type { Metadata } from 'next';
import { getSemesters } from '@/lib/services/reference';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Semesters | Admin Console',
};

export default async function AdminSemestersPage() {
  const semesters = await getSemesters();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Semesters (1–8)</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Curriculum semesters for Polytechnic diploma engineering programs.
        </p>
      </div>

      <Card className="overflow-hidden border bg-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="p-3">Semester Number</th>
              <th className="p-3">Display Name</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {semesters.map((sem) => (
              <tr key={sem.id} className="border-b hover:bg-muted/30">
                <td className="p-3 font-mono font-bold text-brand">{sem.number}</td>
                <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-brand" />
                  {sem.name}
                </td>
                <td className="p-3">
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                    Active
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
