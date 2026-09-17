import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentProfile } from "@/lib/actions/auth";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { BottomTabBar } from "@/components/shared/bottom-nav";
import { VerificationBanner } from "@/components/auth/verification-banner";
import { LivingBackground } from "@/components/shared/living-background";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Polytechnic Used Book Marketplace",
    template: "%s | Polytechnic Books",
  },
  description:
    "Buy and sell used Polytechnic books on campus. Verified students, trusted transactions, campus pickup.",
  openGraph: {
    title: "Polytechnic Used Book Marketplace",
    description:
      "Buy and sell used Polytechnic books on campus. Verified students, trusted transactions, campus pickup.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getCurrentProfile();

  const navbarUser = profile
    ? {
        id: profile.id,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        isVerified: profile.verification_status === 'verified',
      }
    : null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative overflow-x-hidden">
        {/* Dynamic Living Ambient Background with Scroll Parallax & Acceleration */}
        <LivingBackground />

        {profile && (
          <VerificationBanner
            status={profile.verification_status}
            rejectionReason={profile.verification_rejection_reason}
          />
        )}
        <Navbar user={navbarUser} />
        <main className="flex-1 pb-24 sm:pb-28">{children}</main>
        <BottomTabBar user={navbarUser} />
        <Footer />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

