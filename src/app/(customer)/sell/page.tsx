import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentProfile } from '@/lib/actions/auth';
import { getDepartments, getSemesters } from '@/lib/services/reference';
import { SellForm } from '@/components/marketplace/sell-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, ArrowRight, ShieldCheck, Clock, BookPlus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sell a Used Book | Polytechnic Used Book Marketplace',
  description: 'List your polytechnic textbook for juniors and earn money.',
};

export default async function SellPage() {
  const { user, profile } = await getCurrentProfile();

  if (!user || !profile) {
    redirect('/login?redirect=/sell');
  }

  // Verification Gate (Section 6 & 11)
  if (profile.verification_status !== 'verified') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-8 text-center space-y-5">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              {profile.verification_status === 'pending' ? (
                <Clock className="h-7 w-7 animate-pulse" />
              ) : (
                <ShieldAlert className="h-7 w-7" />
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                {profile.verification_status === 'pending'
                  ? 'Verification in Progress'
                  : 'Student Verification Required'}
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                {profile.verification_status === 'pending'
                  ? 'Your student ID card has been submitted and is in the campus admin queue. Once approved, you will be able to sell books right away.'
                  : 'To protect students from fraud, only verified Polytechnic students can create book listings. Please upload your student ID card in your profile to unlock selling.'}
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Link href="/profile#verify">
                <Button className="bg-brand text-brand-foreground hover:bg-brand/90 font-medium">
                  {profile.verification_status === 'pending' ? 'View Profile Status' : 'Verify Student ID Now'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline">Browse Marketplace</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [departments, semesters] = await Promise.all([
    getDepartments(),
    getSemesters(),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold uppercase tracking-wider mb-2">
          <BookPlus className="h-3.5 w-3.5" />
          <span>New Listing</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">List a Book for Sale</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Provide accurate condition details and photos so buyers know exactly what they are getting.
        </p>
      </div>

      <SellForm departments={departments} semesters={semesters} />
    </div>
  );
}
