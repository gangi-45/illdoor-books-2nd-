import Link from 'next/link';
import { getBooks } from '@/lib/services/books';
import { getDepartments } from '@/lib/services/reference';
import { getCurrentProfile } from '@/lib/actions/auth';
import { BookCard } from '@/components/marketplace/book-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  Search,
  ShieldCheck,
  MapPin,
  Star,
  PlusCircle,
  ArrowRight,
  Laptop,
  Zap,
  CircuitBoard,
  Building2,
  Wrench,
  Clock,
} from 'lucide-react';

// Department icons mapping
const departmentIcons: Record<string, React.ReactNode> = {
  'Computer Technology': <Laptop className="h-6 w-6" />,
  'Electronics Technology': <CircuitBoard className="h-6 w-6" />,
  'Electrical Technology': <Zap className="h-6 w-6" />,
  'Civil Technology': <Building2 className="h-6 w-6" />,
  'Mechanical Technology': <Wrench className="h-6 w-6" />,
};

const howItWorks = [
  {
    icon: <ShieldCheck className="h-7 w-7 text-brand" />,
    title: '1. Register & Verify',
    description: 'Sign up with your student roll and upload your student ID to buy and sell safely.',
  },
  {
    icon: <Search className="h-7 w-7 text-brand" />,
    title: '2. Find or List Textbooks',
    description: 'Search by subject code (e.g. 26811), browse departments, or list books with photos.',
  },
  {
    icon: <MapPin className="h-7 w-7 text-brand" />,
    title: '3. Campus Drop-off & Pickup',
    description: 'No couriers. Safe physical handoff at the official campus student pickup point.',
  },
  {
    icon: <Star className="h-7 w-7 text-brand" />,
    title: '4. PIN Verification & Review',
    description: 'Pickup verified with a secure 6-digit PIN. Honest reviews build student reputation.',
  },
];

export default async function HomePage() {
  const [{ books: recentBooks }, departments, { profile }] = await Promise.all([
    getBooks({ limit: 6, sortBy: 'newest' }),
    getDepartments(),
    getCurrentProfile(),
  ]);

  return (
    <div className="flex flex-col space-y-12 pb-16">
      {/* ---------------------------------------------------------------- */}
      {/* BookLoop Liquid Glass Hero Section */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative max-w-5xl mx-auto px-2.5 sm:px-6 w-full pt-5 sm:pt-8">
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] p-5 sm:p-12 text-center space-y-5 sm:space-y-6 isolate border border-white/25 bg-[rgba(255,255,255,0.18)] dark:bg-[rgba(15,23,42,0.4)] backdrop-blur-[24px] saturate-[180%] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.14),0_10px_30px_rgba(0,0,0,0.25)] mt-1 sm:mt-0">
          {/* Eyebrow Badge (Capsule) */}
          <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/30 bg-white/30 backdrop-blur-md text-[#0a84ff] text-xs sm:text-[13px] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
            <span>Polytechnic Used Book Marketplace</span>
          </div>

          {/* Main Headline (Geist title: 600 weight, 28-34px, -0.02em tracking) */}
          <h1 className="relative z-10 text-[24px] sm:text-[34px] font-semibold tracking-[-0.02em] text-foreground max-w-2xl mx-auto leading-tight">
            Your next textbook is <span className="text-[#0a84ff]">already on campus.</span>
          </h1>

          <p className="relative z-10 text-muted-foreground text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
            Buy and sell verified used books with students from your institute.
            Less cost, less waste, more learning. (ক্যাম্পাসেই সাশ্রয়ী মূল্যে সেমিস্টার বই কিনুন ও বিক্রি করুন)।
          </p>

          {/* Liquid Glass Search Bar Capsule */}
          <div className="relative z-20 max-w-xl mx-auto pt-1 sm:pt-2 w-full">
            <Link href="/browse" className="block w-full">
              <div className="flex items-center gap-2.5 sm:gap-3 rounded-full border border-white/25 bg-[rgba(255,255,255,0.25)] backdrop-blur-[24px] saturate-[180%] px-4 sm:px-5 py-2.5 sm:py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.14),0_10px_30px_rgba(0,0,0,0.18)] hover:bg-white/35 transition-all cursor-pointer">
                <Search className="h-4 w-4 text-[#0a84ff] shrink-0" />
                <span className="text-foreground/60 text-xs sm:text-sm text-left flex-1 truncate font-medium">
                  Search title, subject code or department…
                </span>
                <span className="grid place-items-center w-7 h-7 rounded-full bg-[#0a84ff] text-white text-xs font-semibold shadow-sm shrink-0">
                  ⌕
                </span>
              </div>
            </Link>
          </div>

          {/* Trust indicator */}
          <div className="relative z-10 text-[11px] sm:text-xs text-muted-foreground font-medium pt-1">
            ✓ Safe campus meet-ups · No delivery fees · Verified student rolls
          </div>

          {/* Action CTAs (Capsules) */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center pt-1 sm:pt-2 w-full">
            <Link href="/browse" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="gap-2 w-full sm:w-auto font-medium rounded-full bg-[#0a84ff] text-white hover:bg-[#0077eb] shadow-[0_6px_20px_rgba(10,132,255,0.35)] min-h-[44px]"
              >
                <BookOpen className="h-4 w-4" />
                Browse books
              </Button>
            </Link>
            <Link href="/sell" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="glass"
                className="gap-2 w-full sm:w-auto rounded-full font-medium min-h-[44px]"
              >
                <PlusCircle className="h-4 w-4 text-[#0a84ff]" />
                Sell a book (বই বিক্রি করুন)
              </Button>
            </Link>
          </div>
        </div>

        {/* Category Pills (Floating Capsule Bar) */}
        <div className="max-w-4xl mx-auto mt-6 relative z-30 grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-[24px] sm:rounded-full border border-white/25 bg-[rgba(255,255,255,0.18)] dark:bg-[rgba(15,23,42,0.4)] backdrop-blur-[24px] saturate-[180%] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.14),0_10px_30px_rgba(0,0,0,0.2)]">
          <Link
            href="/browse"
            className="flex items-center justify-center gap-2 p-2 sm:p-2.5 rounded-full hover:bg-white/40 text-foreground transition-all text-center group min-h-[40px]"
          >
            <span className="w-6 h-6 rounded-full bg-accent text-[#0a84ff] flex items-center justify-center text-xs font-semibold shrink-0">
              ▣
            </span>
            <span className="text-xs font-medium truncate">All books</span>
          </Link>
          <Link
            href="/browse?department=computer"
            className="flex items-center justify-center gap-2 p-2 sm:p-2.5 rounded-full hover:bg-white/40 text-foreground transition-all text-center group min-h-[40px]"
          >
            <span className="w-6 h-6 rounded-full bg-accent text-[#0a84ff] flex items-center justify-center text-xs font-semibold shrink-0">
              ⌘
            </span>
            <span className="text-xs font-medium truncate">Computer</span>
          </Link>
          <Link
            href="/browse?department=electrical"
            className="flex items-center justify-center gap-2 p-2 sm:p-2.5 rounded-full hover:bg-white/40 text-foreground transition-all text-center group min-h-[40px]"
          >
            <span className="w-6 h-6 rounded-full bg-accent text-[#0a84ff] flex items-center justify-center text-xs font-semibold shrink-0">
              ⚙
            </span>
            <span className="text-xs font-medium truncate">Electrical</span>
          </Link>
          <Link
            href="/browse?department=mathematics"
            className="flex items-center justify-center gap-2 p-2 sm:p-2.5 rounded-full hover:bg-white/40 text-foreground transition-all text-center group min-h-[40px]"
          >
            <span className="w-6 h-6 rounded-full bg-accent text-[#0a84ff] flex items-center justify-center text-xs font-semibold shrink-0">
              ▦
            </span>
            <span className="text-xs font-medium truncate">Math</span>
          </Link>
          <Link
            href="/browse?department=electronics"
            className="flex items-center justify-center gap-2 p-2 sm:p-2.5 rounded-full hover:bg-white/40 text-foreground transition-all text-center group col-span-2 sm:col-span-1 min-h-[40px]"
          >
            <span className="w-6 h-6 rounded-full bg-accent text-[#0a84ff] flex items-center justify-center text-xs font-semibold shrink-0">
              ◇
            </span>
            <span className="text-xs font-medium truncate">Electronics</span>
          </Link>
        </div>

        {/* Stats Capsule Floating Bar */}
        <div className="max-w-xl mx-auto mt-6 grid grid-cols-3 divide-x divide-white/30 p-3 rounded-full border border-white/25 bg-[rgba(255,255,255,0.18)] dark:bg-[rgba(15,23,42,0.4)] backdrop-blur-[24px] saturate-[180%] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.14),0_10px_30px_rgba(0,0,0,0.2)]">
          <div className="px-2">
            <strong className="block text-lg sm:text-xl font-semibold text-foreground">1.2k+</strong>
            <span className="text-[11px] text-muted-foreground font-medium">Books listed</span>
          </div>
          <div className="px-2">
            <strong className="block text-lg sm:text-xl font-semibold text-foreground">{departments.length || 8}</strong>
            <span className="text-[11px] text-muted-foreground font-medium">Departments</span>
          </div>
          <div className="px-2">
            <strong className="block text-lg sm:text-xl font-semibold text-foreground">680+</strong>
            <span className="text-[11px] text-muted-foreground font-medium">Students</span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Recently Listed Books */}
      {/* ---------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="relative overflow-hidden rounded-[28px] p-4 sm:p-8 isolate border border-white/25 bg-[rgba(255,255,255,0.18)] dark:bg-[rgba(15,23,42,0.4)] backdrop-blur-[24px] saturate-[180%] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.14),0_10px_30px_rgba(0,0,0,0.25)] space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/20">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-full border border-white/30 bg-white/30 backdrop-blur-md text-[#0a84ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h2 className="text-[20px] sm:text-[28px] font-semibold tracking-[-0.02em] text-foreground">Recently Listed</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Fresh textbooks uploaded by fellow campus students
                </p>
              </div>
            </div>
            <Link
              href="/browse?sortBy=newest"
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/30 bg-white/30 backdrop-blur-md text-xs sm:text-sm font-medium text-[#0a84ff] hover:bg-white/50 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] min-h-[36px]"
            >
              See all books <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {recentBooks.map((book) => (
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
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How It Works */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-white/80 dark:bg-slate-900/80 py-16 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.02em] text-foreground">
              How Campus Marketplace Works
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Designed specifically for Polytechnic institutes with campus pickup point exchanges.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => (
              <Card key={index} className="border border-border/60 shadow-xs">
                <CardContent className="p-6 space-y-3">
                  <div className="p-3 rounded-full bg-accent text-[#0a84ff] w-fit">
                    {step.icon}
                  </div>
                  <h3 className="font-semibold text-base tracking-tight">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Sell Now CTA Banner */}
      {/* ---------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0a84ff] to-[#006ee6] text-white p-8 sm:p-12 shadow-[0_12px_36px_rgba(10,132,255,0.35)]">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-[28px] sm:text-[32px] font-semibold tracking-[-0.02em]">
                Got old semester books lying around?
              </h2>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                List them in 2 minutes. Help incoming juniors get required textbooks at fair prices while putting cash back in your pocket.
              </p>
            </div>
            <Link href="/sell">
              <Button
                size="lg"
                className="bg-white text-[#0a84ff] hover:bg-white/95 font-semibold shadow-md gap-2 whitespace-nowrap text-sm rounded-full"
              >
                <PlusCircle className="h-4 w-4 text-[#0a84ff]" />
                Sell Now (বই বিক্রি করুন)
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
