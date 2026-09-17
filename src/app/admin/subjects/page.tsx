import type { Metadata } from 'next';
import { getSubjects, getDepartments } from '@/lib/services/reference';
import { Card } from '@/components/ui/card';
import { Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Subjects | Admin Console',
};

export default async function AdminSubjectsPage() {
  const [subjects, departments] = await Promise.all([
    getSubjects(),
    getDepartments(),
  ]);

  const deptMap = new Map(departments.map((d) => [d.id, d.name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Subjects & Codes</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Standardized BTEB subject codes used for textbook matching and search indexing.
        </p>
      </div>

      <Card className="overflow-hidden border bg-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="p-3">Subject Name</th>
              <th className="p-3">Subject Code</th>
              <th className="p-3">Department</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub) => (
              <tr key={sub.id} className="border-b hover:bg-muted/30">
                <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-brand" />
                  {sub.name}
                </td>
                <td className="p-3 font-mono font-bold text-brand">{sub.code}</td>
                <td className="p-3 text-muted-foreground">
                  {deptMap.get(sub.department_id) || 'Computer Technology'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
