import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/auth';
import { getBookById } from '@/lib/services/books';
import { getPickupPoints } from '@/lib/services/pickup';
import { CheckoutForm } from '@/components/orders/checkout-form';
import { ShieldCheck, ShoppingBag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Checkout & Reserve | Polytechnic Used Book Marketplace',
  description: 'Select campus pickup counter and reserve textbook.',
};

interface CheckoutPageProps {
  searchParams: Promise<{ bookId?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { bookId } = await searchParams;
  if (!bookId) {
    redirect('/browse');
  }

  const [{ user, profile }, book] = await Promise.all([
    getCurrentProfile(),
    getBookById(bookId),
  ]);

  if (!user || !profile) {
    redirect(`/login?redirect=/orders/checkout?bookId=${bookId}`);
  }

  if (profile.verification_status !== 'verified') {
    redirect('/profile#verify');
  }

  if (!book) {
    notFound();
  }

  if (book.seller_id === profile.id) {
    redirect(`/book/${book.id}`);
  }

  if (book.listing_status !== 'available') {
    redirect(`/book/${book.id}`);
  }

  const pickupPoints = await getPickupPoints(profile.institute_id);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold uppercase tracking-wider mb-2">
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Checkout & Reserve</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Reserve Campus Textbook</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review details and confirm your campus pickup point.
        </p>
      </div>

      <CheckoutForm book={book} pickupPoints={pickupPoints} />
    </div>
  );
}
