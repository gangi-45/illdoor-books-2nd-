import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/auth';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingBag,
  Flag,
  MapPin,
  Building2,
  GraduationCap,
  Calendar,
  Layers,
  Settings,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Student Verification', icon: Users },
  { href: '/admin/orders', label: 'Orders & Payments', icon: ShoppingBag },
  { href: '/admin/books', label: 'Book Listings', icon: BookOpen },
  { href: '/admin/reports', label: 'Reports Inbox', icon: Flag },
  { href: '/admin/pickup-points', label: 'Pickup Points', icon: MapPin },
  { href: '/admin/institutes', label: 'Institutes', icon: Building2 },
  { href: '/admin/departments', label: 'Departments', icon: GraduationCap },
  { href: '/admin/semesters', label: 'Semesters', icon: Calendar },
  { href: '/admin/subjects', label: 'Subjects', icon: Layers },
  { href: '/admin/settings', label: 'Platform Settings', icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentProfile();

  if (!user || !profile) {
    redirect('/login?redirect=/admin');
  }

  // Check role: if not admin, show unauthorized access screen
  if (profile.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl border bg-card text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold">Admin Privileges Required</h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your account ({profile.email}) is currently registered as &quot;{profile.role}&quot;.
          To access the administrator console, your account must have the &quot;admin&quot; role.
        </p>
        <Link href="/" className="inline-block text-xs font-semibold text-brand hover:underline">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r p-4 sm:p-6 space-y-6 shrink-0">
        <div className="space-y-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Store
          </Link>
          <h2 className="text-lg font-bold tracking-tight">Campus Admin Console</h2>
          <p className="text-xs text-muted-foreground">Polytechnic Marketplace</p>
        </div>

        <nav className="space-y-1">
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
              >
                <Icon className="h-4 w-4 text-brand shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
