'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Search,
  ShoppingBag,
  Bell,
  PlusCircle,
  User,
  Menu,
  X,
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavbarProps {
  user?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    isVerified: boolean;
  } | null;
  unreadNotifications?: number;
}

const navLinks = [
  { href: '/browse', label: 'Browse Books', icon: BookOpen },
  { href: '/orders', label: 'My Orders', icon: ShoppingBag },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Navbar({ user, unreadNotifications = 0 }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-2 sm:top-4 z-40 w-full px-2.5 sm:px-6 pointer-events-none">
      <nav className="w-full max-w-6xl mx-auto flex h-12 sm:h-14 items-center justify-between px-3 sm:px-6 rounded-full border border-white/25 bg-[rgba(255,255,255,0.22)] dark:bg-[rgba(15,23,42,0.5)] backdrop-blur-[24px] saturate-[180%] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.14),0_10px_30px_rgba(0,0,0,0.18)] pointer-events-auto">
        {/* Logo - BookLoop Liquid Glass */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold text-lg tracking-tight text-foreground transition-transform hover:scale-[1.02]"
        >
          <span className="grid place-items-center w-8 h-8 rounded-full text-white font-bold text-sm bg-[#0a84ff] shadow-[0_4px_14px_rgba(10,132,255,0.4)]">
            ▤
          </span>
          <span className="tracking-tight text-foreground font-semibold">
            Book<span className="text-[#0a84ff] -ml-0.5 font-semibold">Loop</span>
          </span>
        </Link>

        {/* Desktop Search (Liquid Glass Pill) */}
        <Link
          href="/browse"
          className="hidden md:flex items-center gap-2.5 rounded-full border border-white/20 bg-white/30 backdrop-blur-md px-4 py-1.5 text-sm text-foreground/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] hover:bg-white/50 hover:text-foreground max-w-sm flex-1 mx-6 transition-all"
        >
          <Search className="h-3.5 w-3.5 text-[#0a84ff]" />
          <span className="text-xs truncate">Search title, subject code or department…</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={pathname.startsWith(link.href) ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      'relative gap-2',
                      pathname.startsWith(link.href) && 'bg-accent'
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{link.label}</span>
                    {link.href === '/notifications' && unreadNotifications > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </Link>
              ))}

              {/* Sell Now CTA */}
              <Link href="/sell">
                <Button
                  size="sm"
                  className="ml-2 gap-2 bg-[#0a84ff] text-white hover:bg-[#0077eb] font-semibold shadow-[0_4px_14px_rgba(10,132,255,0.35)]"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Sell Now</span>
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/browse">
                <Button variant="ghost" size="sm" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Browse
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <Link href="/sell">
              <Button
                size="sm"
                className="gap-1.5 bg-[#0a84ff] text-white hover:bg-[#0077eb] font-semibold rounded-full px-3 py-1.5 shadow-sm text-xs min-h-[36px]"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Sell</span>
              </Button>
            </Link>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="inline-flex items-center justify-center rounded-full w-9 h-9 border border-white/25 bg-white/20 backdrop-blur-md text-foreground hover:bg-white/40 transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80 pt-10">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-2">
                {/* Mobile search link */}
                <Link
                  href="/browse"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-full border border-white/30 bg-white/30 backdrop-blur-md px-4 py-2.5 text-sm text-foreground/80 mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                >
                  <Search className="h-4 w-4 text-[#0a84ff]" />
                  Search books…
                </Link>

                {user ? (
                  <>
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                      >
                        <Button
                          variant={pathname.startsWith(link.href) ? 'secondary' : 'ghost'}
                          className="w-full justify-start gap-3 relative rounded-full min-h-[44px]"
                        >
                          <link.icon className="h-5 w-5 text-[#0a84ff]" />
                          {link.label}
                          {link.href === '/notifications' && unreadNotifications > 0 && (
                            <Badge variant="destructive" className="ml-auto rounded-full">
                              {unreadNotifications}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    ))}
                    <Link href="/wishlist" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-3 rounded-full min-h-[44px]">
                        <BookOpen className="h-5 w-5 text-[#0a84ff]" />
                        Wishlist
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full gap-2 rounded-full min-h-[44px] bg-[#0a84ff] hover:bg-[#0077eb] text-white">
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full gap-2 rounded-full min-h-[44px]">
                        Create Account
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
