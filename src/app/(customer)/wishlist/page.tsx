import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentProfile } from '@/lib/actions/auth';
import { createClient } from '@/lib/supabase/server';
import { FALLBACK_BOOKS } from '@/lib/services/books';
import { BookCard } from '@/components/marketplace/book-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Heart, BookOpen } from 'lucide-react';
import type { BookWithDetails } from '@/lib/services/books';

export const metadata: Metadata = {
  title: 'My Wishlist | Polytechnic Used Book Marketplace',
  description: 'View books you have saved for later.',
};

export default async function WishlistPage() {
  const { user, profile } = await getCurrentProfile();

  if (!user || !profile) {
    redirect('/login?redirect=/wishlist');
  }

  let savedBooks: BookWithDetails[] = [];

  try {
    const supabase = await createClient();
    const { data: wishlistRows } = await supabase
      .from('wishlists')
      .select('book_id')
      .eq('user_id', profile.id);

    if (wishlistRows && wishlistRows.length > 0) {
      const bookIds = wishlistRows.map((r) => r.book_id);
      const { data: booksData } = await supabase
        .from('books')
        .select(
          `
          *,
          departments (name, code),
          semesters (number, name),
          book_images (storage_path, public_url, sort_order),
          seller:profiles!seller_id (id, full_name, student_id, verification_status)
        `
        )
        .in('id', bookIds);

      if (booksData && booksData.length > 0) {
        savedBooks = booksData as unknown as BookWithDetails[];
      }
    }
  } catch {
    savedBooks = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
          <Heart className="h-6 w-6 fill-red-500" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Saved Wishlist</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Keep track of used books you plan to purchase
          </p>
        </div>
      </div>

      {savedBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {savedBooks.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              subjectCode={book.subject_code}
              semesterName={book.semesters?.name || 'Semester'}
              condition={book.condition}
              originalPrice={book.original_price}
              sellingPrice={book.selling_price}
              listingStatus={book.listing_status}
              imageUrl={book.book_images?.[0]?.public_url}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Heart className="h-10 w-10 text-muted-foreground stroke-1" />}
          title="Your wishlist is empty"
          description="Browse available textbooks on campus and click 'Save to Wishlist' to bookmark them here."
          action={
            <Link href="/browse">
              <Button className="bg-brand text-brand-foreground hover:bg-brand/90 font-medium">
                Browse Marketplace
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
