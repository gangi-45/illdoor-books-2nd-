'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ShoppingBag, PlusCircle, Bell, User, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  user?: {
    id: string;
    fullName: string;
    isVerified: boolean;
  } | null;
  unreadNotifications?: number;
}

export function BottomTabBar({ user, unreadNotifications = 0 }: BottomNavProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const lastScrollY = useRef(0);
  const scrollAcc = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || window.pageYOffset || 0;
      const delta = currentY - lastScrollY.current;

      // Small threshold to prevent jitter
      if (Math.abs(delta) > 4) {
        if (delta > 0 && currentY > 60) {
          // Scrolling down - collapse into single pill
          scrollAcc.current += delta;
          if (scrollAcc.current > 15) {
            setCollapsed(true);
          }
        } else if (delta < 0) {
          // Scrolling up - expand back to full tabs
          scrollAcc.current = 0;
          setCollapsed(false);
        }
      }

      if (currentY <= 30) {
        setCollapsed(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/browse', label: 'Browse', icon: BookOpen },
    { href: '/sell', label: 'Sell', icon: PlusCircle, isCta: true },
    { href: '/orders', label: 'Orders', icon: ShoppingBag, authOnly: true },
    { href: '/notifications', label: 'Inbox', icon: Bell, authOnly: true, badge: unreadNotifications },
    { href: user ? '/profile' : '/login', label: user ? 'Profile' : 'Sign In', icon: User },
  ];

  const visibleItems = navItems.filter((item) => !item.authOnly || !!user);

  // Active item for the collapsed pill label
  const activeItem = visibleItems.find((item) => 
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
  ) || visibleItems[0];

  return (
    <div
      className="fixed bottom-4 sm:bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none px-2 sm:px-4"
      aria-label="Bottom navigation"
    >
      <nav
        data-collapsed={collapsed}
        className={cn(
          'pointer-events-auto liquid-glass-tab-bar relative flex items-center p-1 sm:p-1.5 transition-all max-w-[calc(100vw-16px)] sm:max-w-fit overflow-hidden',
          'liquid-glass-capsule shadow-lg select-none',
          collapsed ? 'gap-2 px-3 py-1.5' : 'gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 sm:py-1.5'
        )}
      >
        {collapsed ? (
          // Collapsed Pill Mode (Spring morph)
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-[#0b1530] hover:text-[#0a84ff] transition-colors cursor-pointer min-h-[40px]"
            aria-label="Expand navigation bar"
          >
            <Compass className="h-4 w-4 text-[#0a84ff] animate-spin-slow" />
            <span className="text-[13px] font-semibold tracking-tight text-foreground truncate max-w-[130px]">
              {activeItem?.label || 'Menu'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0a84ff]" />
          </button>
        ) : (
          // Expanded Full Capsule Tabs
          visibleItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center justify-center gap-1.5 rounded-full px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 outline-none select-none min-h-[42px]',
                  isActive
                    ? 'bg-[#0a84ff] text-white font-semibold shadow-[0_4px_16px_rgba(10,132,255,0.4)]'
                    : 'text-foreground/75 hover:text-foreground hover:bg-white/40'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="text-[12px] sm:text-[13px] tracking-tight hidden min-[380px]:inline">
                  {item.label}
                </span>
                {item.badge && item.badge > 0 && (
                  <span
                    className={cn(
                      'ml-0.5 inline-flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 py-0.2',
                      isActive ? 'bg-white text-[#0a84ff]' : 'bg-[#ef4444] text-white'
                    )}
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })
        )}
      </nav>
    </div>
  );
}
