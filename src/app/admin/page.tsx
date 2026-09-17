import type { Metadata } from 'next';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users,
  ShieldCheck,
  BookOpen,
  ShoppingBag,
  CheckCircle2,
  Package,
  MapPin,
  Flag,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Polytechnic Used Books',
};

export default async function AdminDashboardPage() {
  const adminClient = await createAdminClient();

  // Query real database numbers (Section 31)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalUsersRes,
    verifiedUsersRes,
    activeListingsRes,
    ordersTodayRes,
    completedOrdersRes,
    pendingDropoffsRes,
    pendingPickupsRes,
    openReportsRes,
  ] = await Promise.all([
    adminClient.from('profiles').select('*', { count: 'exact', head: true }),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
    adminClient.from('books').select('*', { count: 'exact', head: true }).eq('listing_status', 'available'),
    adminClient.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
    adminClient.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'completed'),
    adminClient.from('orders').select('*', { count: 'exact', head: true }).in('order_status', ['paid', 'waiting_for_dropoff']),
    adminClient.from('orders').select('*', { count: 'exact', head: true }).in('order_status', ['dropped_off', 'ready_for_pickup']),
    adminClient.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
  ]);

  const metrics = [
    {
      label: 'Total Registered Students',
      value: totalUsersRes.count ?? 0,
      icon: <Users className="h-5 w-5 text-blue-600" />,
      href: '/admin/users',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Verified Students',
      value: verifiedUsersRes.count ?? 0,
      icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
      href: '/admin/users',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Active Book Listings',
      value: activeListingsRes.count ?? 0,
      icon: <BookOpen className="h-5 w-5 text-brand" />,
      href: '/admin/books',
      bg: 'bg-brand/10',
    },
    {
      label: 'Orders Today',
      value: ordersTodayRes.count ?? 0,
      icon: <ShoppingBag className="h-5 w-5 text-purple-600" />,
      href: '/admin/orders',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Completed Transactions',
      value: completedOrdersRes.count ?? 0,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      href: '/admin/orders',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Pending Drop-offs',
      value: pendingDropoffsRes.count ?? 0,
      icon: <Package className="h-5 w-5 text-amber-600" />,
      href: '/admin/orders',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Pending Counter Pickups',
      value: pendingPickupsRes.count ?? 0,
      icon: <MapPin className="h-5 w-5 text-cyan-600" />,
      href: '/admin/orders',
      bg: 'bg-cyan-500/10',
    },
    {
      label: 'Open Incident Reports',
      value: openReportsRes.count ?? 0,
      icon: <Flag className="h-5 w-5 text-red-600" />,
      href: '/admin/reports',
      bg: 'bg-red-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time metrics calculated directly from database records (Section 31).
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((m, idx) => (
          <Link key={idx} href={m.href} className="block group">
            <Card className="hover:shadow-md hover:border-brand/40 transition-all">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium">{m.label}</span>
                  <p className="text-2xl font-extrabold tracking-tight">{m.value}</p>
                </div>
                <div className={`p-3 rounded-2xl ${m.bg} shrink-0 group-hover:scale-105 transition-transform`}>
                  {m.icon}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <Card className="p-6 space-y-3 bg-card border">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand" />
            Verification Queue
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Review uploaded student ID cards to verify or reject registration requests.
          </p>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline pt-2"
          >
            Review Student IDs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>

        <Card className="p-6 space-y-3 bg-card border">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-brand" />
            Payment Check-off
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Confirm bKash/Nagad Transaction IDs submitted by students against platform statements.
          </p>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline pt-2"
          >
            Verify Order Payments <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>

        <Card className="p-6 space-y-3 bg-card border">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Flag className="h-4 w-4 text-brand" />
            Incident Reports
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Review complaints about book condition discrepancies, missing pages, or seller issues.
          </p>
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline pt-2"
          >
            Open Reports Inbox <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
