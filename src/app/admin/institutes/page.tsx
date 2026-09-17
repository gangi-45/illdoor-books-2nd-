import type { Metadata } from 'next';
import { getInstitutes } from '@/lib/services/reference';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Institutes | Admin Console',
};

export default async function AdminInstitutesPage() {
  const institutes = await getInstitutes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Institutes (Polytechnics)</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          DB-driven polytechnic institutes registered on the platform.
        </p>
      </div>

      <Card className="overflow-hidden border bg-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="p-3">Institute Name</th>
              <th className="p-3">Code</th>
              <th className="p-3">Campus Address</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {institutes.map((inst) => (
              <tr key={inst.id} className="border-b hover:bg-muted/30">
                <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-brand" />
                  {inst.name}
                </td>
                <td className="p-3 font-mono font-bold text-brand">{inst.code}</td>
                <td className="p-3 text-muted-foreground">{inst.address}</td>
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
