'use client';

import Link from 'next/link';
import { ShieldAlert, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import type { VerificationStatus } from '@/types/database';

interface VerificationBannerProps {
  status: VerificationStatus;
  rejectionReason?: string | null;
}

export function VerificationBanner({ status, rejectionReason }: VerificationBannerProps) {
  if (status === 'verified') return null;

  if (status === 'unverified') {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-amber-700 dark:text-amber-400 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Student verification required:</strong> Submit your student ID card to start buying, selling, and reviewing books.
            </span>
          </div>
          <Link
            href="/profile#verify"
            className="inline-flex items-center gap-1 font-semibold text-xs text-amber-800 dark:text-amber-300 hover:underline shrink-0"
          >
            Submit ID Now <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-2.5 text-blue-700 dark:text-blue-400 text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 animate-pulse" />
            <span>
              <strong>Verification in progress:</strong> Your student ID card has been submitted and is in the admin review queue. You can browse books in the meantime.
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2.5 text-destructive text-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <strong>Verification rejected:</strong> {rejectionReason || 'Student ID could not be verified.'} Please re-upload a clear ID photo.
            </span>
          </div>
          <Link
            href="/profile#verify"
            className="inline-flex items-center gap-1 font-semibold text-xs hover:underline shrink-0"
          >
            Re-submit ID <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
