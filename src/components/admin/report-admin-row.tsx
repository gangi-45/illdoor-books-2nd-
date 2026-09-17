'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { updateReportStatusAction } from '@/lib/actions/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { REPORT_CATEGORY_LABELS } from '@/lib/constants';
import { ExternalLink, Check, X, Search, Loader2 } from 'lucide-react';
import type { Report, ReportCategory, ReportStatus } from '@/types/database';

interface ReportAdminRowProps {
  report: Report & {
    reporter?: { full_name: string; student_id: string } | null;
    books?: { id: string; title: string } | null;
  };
}

export function ReportAdminRow({ report }: ReportAdminRowProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: 'investigating' | 'resolved' | 'dismissed') => {
    startTransition(async () => {
      await updateReportStatusAction(report.id, status);
    });
  };

  const categoryLabel = REPORT_CATEGORY_LABELS[report.category] || report.category;

  return (
    <tr className="border-b text-xs hover:bg-muted/30 transition-colors">
      <td className="p-3">
        <span className="font-semibold capitalize text-foreground">{categoryLabel}</span>
        <div className="text-[11px] text-muted-foreground mt-0.5 max-w-sm leading-relaxed">
          {report.description}
        </div>
      </td>

      <td className="p-3">
        <div>{report.reporter?.full_name || 'Student'}</div>
        <div className="text-[11px] text-muted-foreground">Roll: {report.reporter?.student_id}</div>
      </td>

      <td className="p-3">
        {report.related_book_id && report.books ? (
          <Link
            href={`/book/${report.related_book_id}`}
            target="_blank"
            className="text-brand hover:underline flex items-center gap-1 max-w-[160px] truncate"
          >
            {report.books.title} <ExternalLink className="h-3 w-3 shrink-0" />
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>

      <td className="p-3">
        <Badge
          className={`text-[10px] capitalize ${
            report.status === 'open'
              ? 'bg-destructive/15 text-destructive border-destructive/30'
              : report.status === 'investigating'
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
          }`}
        >
          {report.status}
        </Badge>
      </td>

      <td className="p-3 text-right">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin ml-auto text-muted-foreground" />
        ) : (
          <div className="flex items-center justify-end gap-1.5 flex-wrap">
            {report.status === 'open' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('investigating')}
                className="h-7 px-2 text-[11px] border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 gap-1"
              >
                <Search className="h-3 w-3" /> Investigate
              </Button>
            )}

            {report.status !== 'resolved' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('resolved')}
                className="h-7 px-2 text-[11px] border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1"
              >
                <Check className="h-3 w-3" /> Resolve
              </Button>
            )}

            {report.status !== 'dismissed' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusChange('dismissed')}
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive gap-1"
              >
                <X className="h-3 w-3" /> Dismiss
              </Button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
