'use client';

import { useEffect, useRef } from 'react';

/**
 * Orb specification for the multi-layer fluid simulation
 */
interface OrbDef {
  id: string;
  name: string;
  // Base resting percentage in the virtual canvas
  xPercent: number; // 0 - 100
  baseYOffset: number; // in pixels
  // Dimensions
  mobileSize: number; // px
  desktopSize: number; // px
  // Color gradient and styling classes
  gradientClass: string;
  glowClass: string;
  blurClass: string;
  opacity: number;
  floatAnimClass: string;
  // Physics parameters
  scrollSpeed: number; // Relative scroll velocity (e.g. 0.45 = moves at 45% of scroll)
  springRate: number;  // Lerp factor (lower = more millisecond delay, higher = quicker)
  stretchFactor: number;
}

const ORB_DEFS: OrbDef[] = [
  // 1. Top-Right Radiant Cyan-Blue Giant (Flagship liquid orb)
  {
    id: 'orb-cyan-giant',
    name: 'Cyan Giant',
    xPercent: 82,
    baseYOffset: 60,
    mobileSize: 200,
    desktopSize: 340,
    gradientClass: 'bg-gradient-to-br from-[#4ee7fc] via-[#1f7fff] to-[#004fcc]',
    glowClass: 'shadow-[0_20px_60px_rgba(23,108,255,0.38)]',
    blurClass: 'blur-[12px] sm:blur-[18px]',
    opacity: 0.72,
    floatAnimClass: 'animate-live-orb-1',
    scrollSpeed: 0.52,
    springRate: 0.055, // ~280ms lag
    stretchFactor: 0.0018,
  },
  // 2. Mid-Left Luminous Soft Pearl Azure (Gentle counter-flow)
  {
    id: 'orb-pearl-azure',
    name: 'Pearl Azure',
    xPercent: 4,
    baseYOffset: 280,
    mobileSize: 160,
    desktopSize: 260,
    gradientClass: 'bg-gradient-to-br from-white via-[#d9ecff] to-[#99c4f5]',
    glowClass: 'shadow-[0_24px_50px_rgba(25,69,150,0.22)]',
    blurClass: 'blur-[10px] sm:blur-[16px]',
    opacity: 0.82,
    floatAnimClass: 'animate-live-orb-2',
    scrollSpeed: 0.62,
    springRate: 0.075, // ~200ms lag
    stretchFactor: 0.0015,
  },
  // 3. Right Sapphire Pulse (Rich academic blue)
  {
    id: 'orb-sapphire-pulse',
    name: 'Sapphire Pulse',
    xPercent: 88,
    baseYOffset: 620,
    mobileSize: 140,
    desktopSize: 220,
    gradientClass: 'bg-gradient-to-tr from-[#145df0] to-[#7be6fd]',
    glowClass: 'shadow-[0_18px_45px_rgba(20,93,240,0.28)]',
    blurClass: 'blur-[8px] sm:blur-[14px]',
    opacity: 0.65,
    floatAnimClass: 'animate-live-orb-3',
    scrollSpeed: 0.48,
    springRate: 0.065, // ~240ms lag
    stretchFactor: 0.0020,
  },
  // 4. Center-Left Sparkling Drift Bead (Quick responsive droplet)
  {
    id: 'orb-sparkle-bead',
    name: 'Sparkle Bead',
    xPercent: 12,
    baseYOffset: 920,
    mobileSize: 64,
    desktopSize: 96,
    gradientClass: 'bg-gradient-to-br from-[#38bdf8] to-[#2563eb]',
    glowClass: 'shadow-[0_10px_25px_rgba(56,189,248,0.35)]',
    blurClass: 'blur-[4px] sm:blur-[6px]',
    opacity: 0.75,
    floatAnimClass: 'animate-live-orb-quick',
    scrollSpeed: 0.72,
    springRate: 0.095, // ~140ms snappy lag
    stretchFactor: 0.0024,
  },
  // 5. Deep Floating Ambient Aura (Low-frequency pillow in lower-middle)
  {
    id: 'orb-deep-aura',
    name: 'Deep Aura',
    xPercent: 78,
    baseYOffset: 1200,
    mobileSize: 180,
    desktopSize: 300,
    gradientClass: 'bg-gradient-to-tr from-[#9bbdfa] via-[#c6dcff] to-[#e4efff]',
    glowClass: 'shadow-[0_22px_55px_rgba(155,189,250,0.25)]',
    blurClass: 'blur-[14px] sm:blur-[22px]',
    opacity: 0.78,
    floatAnimClass: 'animate-live-orb-glow',
    scrollSpeed: 0.38,
    springRate: 0.045, // ~340ms deep liquid lag
    stretchFactor: 0.0012,
  },
  // 6. Lower Left Mint-Cyan Shimmer
  {
    id: 'orb-mint-cyan',
    name: 'Mint Cyan',
    xPercent: 6,
    baseYOffset: 1540,
    mobileSize: 130,
    desktopSize: 200,
    gradientClass: 'bg-gradient-to-br from-[#67e8f9] via-[#38bdf8] to-[#2563eb]',
    glowClass: 'shadow-[0_18px_40px_rgba(37,99,235,0.24)]',
    blurClass: 'blur-[8px] sm:blur-[14px]',
    opacity: 0.65,
    floatAnimClass: 'animate-live-orb-2',
    scrollSpeed: 0.58,
    springRate: 0.070, // ~210ms lag
    stretchFactor: 0.0018,
  },
];

export function LivingBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<HTMLDivElement>(null);
  const orbItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Current target scroll Y
    let targetScrollY = window.scrollY || window.pageYOffset || 0;
    let isScrollingTimeout: NodeJS.Timeout | null = null;
    let rafId: number;

    // Per-orb smoothed scroll states for the millisecond delay physics
    const orbStates = ORB_DEFS.map(() => ({
      smoothScrollY: targetScrollY,
      prevSmooth: targetScrollY,
    }));

    // Background gradient mesh smoothed scroll state
    let meshSmoothScrollY = targetScrollY;

    // Viewport height tracker (safe on mobile address bar show/hide)
    let viewH = typeof window !== 'undefined' ? window.innerHeight : 800;
    const updateViewH = () => {
      viewH = window.innerHeight || 800;
    };
    window.addEventListener('resize', updateViewH, { passive: true });

    let isRunning = false;

    // Start or wake up the physics loop
    const wakeLoop = () => {
      if (!isRunning) {
        isRunning = true;
        rafId = requestAnimationFrame(tick);
      }
    };

    // Continuous scroll listener (passive for 60-120fps touch scroll)
    const handleScroll = () => {
      targetScrollY = window.scrollY || window.pageYOffset || 0;
      wakeLoop();

      if (containerRef.current && !containerRef.current.hasAttribute('data-scrolling')) {
        containerRef.current.setAttribute('data-scrolling', 'true');
      }

      if (isScrollingTimeout) {
        clearTimeout(isScrollingTimeout);
      }

      isScrollingTimeout = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.removeAttribute('data-scrolling');
        }
      }, 160);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Physics Animation Loop running only when active
    const tick = () => {
      const cycleSpan = Math.max(viewH * 2.2, 1700);

      // 1. Update deep background mesh
      meshSmoothScrollY += (targetScrollY - meshSmoothScrollY) * 0.08;
      if (meshRef.current) {
        const meshY = -(meshSmoothScrollY * 0.14);
        meshRef.current.style.transform = `translate3d(0, ${meshY.toFixed(1)}px, 0)`;
      }

      let stillMoving = Math.abs(targetScrollY - meshSmoothScrollY) > 0.3;

      // 2. Update each individual orb
      for (let i = 0; i < ORB_DEFS.length; i++) {
        const orb = ORB_DEFS[i];
        const state = orbStates[i];
        const ref = orbItemRefs.current[i];
        if (!ref) continue;

        state.smoothScrollY += (targetScrollY - state.smoothScrollY) * orb.springRate;

        const lagVelocity = targetScrollY - state.smoothScrollY;
        if (Math.abs(lagVelocity) > 0.2) {
          stillMoving = true;
        }

        const clampedLag = Math.max(-100, Math.min(100, lagVelocity));
        const stretchY = 1 + Math.min(Math.abs(clampedLag) * orb.stretchFactor, 0.18);
        const stretchX = 1 - Math.min(Math.abs(clampedLag) * (orb.stretchFactor * 0.5), 0.09);

        const rawOffset = orb.baseYOffset - (state.smoothScrollY * orb.scrollSpeed);
        const wrappedY = ((rawOffset % cycleSpan) + cycleSpan) % cycleSpan - 200;

        ref.style.transform = `translate3d(0, ${wrappedY.toFixed(1)}px, 0) scale(${stretchX.toFixed(3)}, ${stretchY.toFixed(3)})`;
      }

      if (stillMoving) {
        rafId = requestAnimationFrame(tick);
      } else {
        isRunning = false;
      }
    };

    // Initial positioning render
    wakeLoop();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateViewH);
      if (isScrollingTimeout) clearTimeout(isScrollingTimeout);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="living-bg-container fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Dynamic Parallax Background Gradient Mesh (moves with scroll at deep depth) */}
      <div
        ref={meshRef}
        className="absolute -top-[25%] -left-[10%] w-[120%] h-[150%] pointer-events-none opacity-80 will-change-transform"
        style={{
          background: `
            radial-gradient(circle at 10% 8%, rgba(190, 242, 255, 0.7) 0, transparent 38%),
            radial-gradient(circle at 90% 16%, rgba(210, 230, 255, 0.75) 0, transparent 36%),
            radial-gradient(circle at 18% 50%, rgba(200, 245, 255, 0.5) 0, transparent 40%),
            radial-gradient(circle at 82% 75%, rgba(215, 230, 255, 0.6) 0, transparent 38%),
            radial-gradient(circle at 35% 92%, rgba(190, 242, 255, 0.45) 0, transparent 42%)
          `,
        }}
      />

      {/* Living Fluid Orbs with Millisecond Delay & Scroll Simulation */}
      {ORB_DEFS.map((orb, index) => (
        <div
          key={orb.id}
          ref={(el) => {
            orbItemRefs.current[index] = el;
          }}
          className="absolute will-change-transform"
          style={{
            left: `${orb.xPercent}%`,
            top: 0,
          }}
        >
          <span
            className={`
              block rounded-full transform -translate-x-1/2
              ${orb.gradientClass}
              ${orb.glowClass}
              ${orb.blurClass}
              ${orb.floatAnimClass}
            `}
            style={{
              width: `clamp(${orb.mobileSize}px, ${orb.mobileSize * 1.2}vw, ${orb.desktopSize}px)`,
              height: `clamp(${orb.mobileSize}px, ${orb.mobileSize * 1.2}vw, ${orb.desktopSize}px)`,
              opacity: orb.opacity,
            }}
          />
        </div>
      ))}
    </div>
  );
}
