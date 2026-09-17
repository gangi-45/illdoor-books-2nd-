import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBookById } from '@/lib/services/books';
import { getCurrentProfile } from '@/lib/actions/auth';
import { checkIsInWishlist } from '@/lib/actions/books';
import { ImageGallery } from '@/components/marketplace/image-gallery';
import { BookActions } from '@/components/marketplace/book-actions';
import { ConditionBadge, StatusBadge } from '@/components/shared/status-badge';
import { PriceDisplay } from '@/components/marketplace/price-display';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  MapPin,
  ShieldCheck,
  Building2,
  Calendar,
  Tag,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  User,
  Share2,
} from 'lucide-react';

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) return { title: 'Book Not Found' };

  return {
    title: `${book.title} (${book.subject_code}) | Polytechnic Used Books`,
    description: `Buy ${book.title} for ৳${book.selling_price} at campus pickup. Used Polytechnic textbook.`,
  };
}

export default async function BookDetailPage({ params }: BookPageProps) {
  const { id } = await params;
  const [book, { profile }] = await Promise.all([
    getBookById(id),
    getCurrentProfile(),
  ]);

  if (!book) {
    notFound();
  }

  const inWishlist = await checkIsInWishlist(book.id);

  const savings =
    book.original_price > book.selling_price
      ? Math.round(((book.original_price - book.selling_price) / book.original_price) * 100)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/browse" className="hover:text-foreground">Browse Books</Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-xs">{book.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="md:col-span-5">
          <div className="sticky top-24">
            <ImageGallery images={book.book_images || []} title={book.title} />
          </div>
        </div>

        {/* Right Column: Book Details & Purchase Actions (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Header & Badges */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-brand/10 text-brand font-mono text-xs font-bold border border-brand/20">
                Subject Code: {book.subject_code}
              </span>
              <ConditionBadge condition={book.condition} className="text-xs" />
              <StatusBadge type="listing" value={book.listing_status} className="text-xs" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {book.title}
            </h1>

            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              {book.author && <span>By {book.author}</span>}
              {book.author && <span>•</span>}
              <span>{book.departments?.name || 'Department'}</span>
              <span>•</span>
              <span>{book.semesters?.name || 'Semester'}</span>
              {book.edition && (
                <>
                  <span>•</span>
                  <span>{book.edition}</span>
                </>
              )}
            </div>
          </div>

          {/* Pricing & Savings Card */}
          <div className="p-5 rounded-2xl bg-card border shadow-xs space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-brand">
                ৳{book.selling_price}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ৳{book.original_price}
              </span>
              {savings !== null && savings > 0 && (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 font-semibold">
                  <Sparkles className="h-3.5 w-3.5" /> Save {savings}%
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Original printed price: ৳{book.original_price} • You save ৳{book.original_price - book.selling_price}
            </p>
          </div>

          {/* Action CTAs: Buy Now, Wishlist, Report */}
          <BookActions
            bookId={book.id}
            sellerId={book.seller_id}
            currentUserId={profile?.id}
            currentUserVerification={profile?.verification_status}
            listingStatus={book.listing_status}
            initialInWishlist={inWishlist}
          />

          {/* Condition Details & Inspection Flags */}
          <div className="p-5 rounded-2xl bg-card border shadow-xs space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Tag className="h-4 w-4 text-brand" />
              Condition Inspection Checklist
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                {book.missing_pages ? (
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                ) : (
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
                <span>{book.missing_pages ? 'Torn / missing pages reported' : 'All pages intact'}</span>
              </div>

              <div className="flex items-center gap-2">
                {book.writing_inside ? (
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                ) : (
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
                <span>{book.writing_inside ? 'Pen or pencil notes inside' : 'No writing inside'}</span>
              </div>

              <div className="flex items-center gap-2">
                {book.highlighting ? (
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                ) : (
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
                <span>{book.highlighting ? 'Highlighting present' : 'No highlighting'}</span>
              </div>

              <div className="flex items-center gap-2">
                {book.cover_damage ? (
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                ) : (
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                )}
                <span>{book.cover_damage ? 'Cover wear or crease' : 'Cover in good shape'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div className="p-5 rounded-2xl bg-card border shadow-xs space-y-2">
              <h3 className="font-semibold text-sm">Seller Notes</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </div>
          )}

          {/* Campus Pickup Safety Notice */}
          <div className="p-4 rounded-xl bg-muted/40 border flex items-start gap-3 text-xs text-muted-foreground">
            <MapPin className="h-5 w-5 text-brand shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Safe Campus Pickup Point</p>
              <p>
                No risky outside meetings or courier fees. Physical handover is conducted at the designated Mymensingh Polytechnic Institute student counter using a 6-digit PIN.
              </p>
            </div>
          </div>

          {/* Seller Information */}
          <div className="p-5 rounded-2xl bg-card border shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-base border">
                {book.seller?.full_name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{book.seller?.full_name || 'Campus Student'}</span>
                  {book.seller?.verification_status === 'verified' && (
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0 px-1.5 gap-0.5">
                      <ShieldCheck className="h-3 w-3" /> Verified Student
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Roll: {book.seller?.student_id || 'Student'} • Same Campus
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
