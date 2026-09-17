import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getBooks } from '@/lib/services/books';
import { getDepartments, getSemesters } from '@/lib/services/reference';
import { BookCard } from '@/components/marketplace/book-card';
import { SearchBar } from '@/components/marketplace/search-bar';
import { FilterPanel } from '@/components/marketplace/filter-panel';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { SlidersHorizontal, BookOpen, ArrowUpDown } from 'lucide-react';
import type { BookCondition, ListingStatus } from '@/types/database';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Browse Books | Polytechnic Used Book Marketplace',
  description: 'Find textbooks by subject code, semester, and department.',
};

interface BrowsePageProps {
  searchParams: Promise<{
    q?: string;
    department?: string;
    semester?: string;
    condition?: BookCondition;
    minPrice?: string;
    maxPrice?: string;
    status?: ListingStatus | 'all';
    sortBy?: 'recommended' | 'newest' | 'price_low' | 'price_high';
    page?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const pageSize = 12;
  const offset = (page - 1) * pageSize;

  const [departments, semesters, { books, total }] = await Promise.all([
    getDepartments(),
    getSemesters(),
    getBooks({
      search: params.q,
      departmentId: params.department,
      semesterId: params.semester,
      condition: params.condition,
      minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
      status: params.status || 'available',
      sortBy: params.sortBy || 'newest',
      limit: pageSize,
      offset,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="w-full md:max-w-xl">
          <Suspense fallback={<div className="h-11 bg-muted rounded-full animate-pulse" />}>
            <SearchBar placeholder="Search by book name, author, or subject code (e.g. 26811)" />
          </Suspense>
        </div>

        {/* Mobile Filter Sheet Trigger & Sort Controls */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/30 bg-white/40 dark:bg-slate-900/60 backdrop-blur-md text-sm font-medium hover:bg-white/60 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] cursor-pointer min-h-[44px]">
                <SlidersHorizontal className="h-4 w-4 text-[#0a84ff]" />
                <span>Filters</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-xs overflow-y-auto pt-8">
                <SheetTitle className="text-base font-bold mb-4">Filters</SheetTitle>
                <FilterPanel departments={departments} semesters={semesters} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
            <span>{total} {total === 1 ? 'book' : 'books'} found</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Left Sidebar: Filters */}
        <aside className="hidden md:block md:col-span-1">
          <div className="sticky top-24 p-6 rounded-[28px] border border-border/70 bg-card shadow-xs">
            <FilterPanel departments={departments} semesters={semesters} />
          </div>
        </aside>

        {/* Right Content Area: Book Grid */}
        <div className="md:col-span-3 space-y-8">
          {books.length > 0 ? (
            <>
              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
                {books.map((book) => (
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const currentParams = new URLSearchParams();
                    if (params.q) currentParams.set('q', params.q);
                    if (params.department) currentParams.set('department', params.department);
                    if (params.semester) currentParams.set('semester', params.semester);
                    if (params.condition) currentParams.set('condition', params.condition);
                    if (params.minPrice) currentParams.set('minPrice', params.minPrice);
                    if (params.maxPrice) currentParams.set('maxPrice', params.maxPrice);
                    currentParams.set('page', p.toString());

                    return (
                      <Link
                        key={p}
                        href={`/browse?${currentParams.toString()}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-full border text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-[#0a84ff] text-white border-[#0a84ff] shadow-xs'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={<BookOpen className="h-8 w-8 text-muted-foreground" />}
              title="No books match your criteria"
              description="Try clearing some filters or searching with a different subject code or keyword."
              action={
                <Link href="/browse">
                  <Button variant="outline" size="sm">
                    Clear All Filters
                  </Button>
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
