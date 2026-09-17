import type { Metadata } from 'next';
import { getDepartments } from '@/lib/services/reference';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Departments | Admin Console',
};

export default async function AdminDepartmentsPage() {
  const departments = await getDepartments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Departments / Technologies</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Engineering disciplines seeded under Mymensingh Polytechnic Institute.
        </p>
      </div>

      <Card className="overflow-hidden border bg-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="p-3">Department Name</th>
              <th className="p-3">Technology Code</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id} className="border-b hover:bg-muted/30">
                <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-brand" />
                  {dept.name}
                </td>
                <td className="p-3 font-mono font-bold text-brand">{dept.code}</td>
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
