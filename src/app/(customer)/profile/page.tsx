import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentProfile, signOutAction } from '@/lib/actions/auth';
import { getInstitutes, getDepartments, getSemesters } from '@/lib/services/reference';
import { IdUploadForm } from '@/components/profile/id-upload-form';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Building2,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertTriangle,
  BookOpen,
  ShoppingBag,
  Heart,
  Bell,
  LogOut,
  Hash,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Profile | Polytechnic Used Book Marketplace',
  description: 'Manage your student profile, verification status, and listings.',
};

export default async function ProfilePage() {
  const { user, profile } = await getCurrentProfile();

  if (!user || !profile) {
    redirect('/login?redirect=/profile');
  }

  const [institutes, departments, semesters] = await Promise.all([
    getInstitutes(),
    getDepartments(),
    getSemesters(),
  ]);

  const institute = institutes.find((i) => i.id === profile.institute_id);
  const department = departments.find((d) => d.id === profile.department_id);
  const semester = semesters.find((s) => s.id === profile.semester_id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-2xl border">
            {profile.full_name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              {profile.verification_status === 'verified' && (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Student
                </Badge>
              )}
              {profile.verification_status === 'pending' && (
                <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1">
                  <Clock className="h-3.5 w-3.5" /> Verification Pending
                </Badge>
              )}
              {profile.verification_status === 'unverified' && (
                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> Unverified
                </Badge>
              )}
              {profile.verification_status === 'rejected' && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Verification Rejected
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <span>Roll: {profile.student_id}</span>
              <span>•</span>
              <span>{department?.name || 'Department'}</span>
            </p>
          </div>
        </div>

        <form action={signOutAction}>
          <Button variant="outline" size="sm" type="submit" className="gap-2 text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </form>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/browse"
          className="p-4 rounded-xl border bg-card hover:border-brand/50 hover:shadow-xs transition-all text-center flex flex-col items-center justify-center gap-2"
        >
          <BookOpen className="h-5 w-5 text-brand" />
          <span className="text-xs font-semibold">Browse Books</span>
        </Link>
        <Link
          href="/orders"
          className="p-4 rounded-xl border bg-card hover:border-brand/50 hover:shadow-xs transition-all text-center flex flex-col items-center justify-center gap-2"
        >
          <ShoppingBag className="h-5 w-5 text-brand" />
          <span className="text-xs font-semibold">My Orders</span>
        </Link>
        <Link
          href="/wishlist"
          className="p-4 rounded-xl border bg-card hover:border-brand/50 hover:shadow-xs transition-all text-center flex flex-col items-center justify-center gap-2"
        >
          <Heart className="h-5 w-5 text-brand" />
          <span className="text-xs font-semibold">Wishlist</span>
        </Link>
        <Link
          href="/notifications"
          className="p-4 rounded-xl border bg-card hover:border-brand/50 hover:shadow-xs transition-all text-center flex flex-col items-center justify-center gap-2"
        >
          <Bell className="h-5 w-5 text-brand" />
          <span className="text-xs font-semibold">Notifications</span>
        </Link>
      </div>

      {/* Verification Status Banner / Action Area */}
      <div id="verify" className="bg-card border rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand/10 text-brand">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Campus Verification Status</h2>
            <p className="text-sm text-muted-foreground">
              To keep transactions safe, all buyers and sellers must be verified Polytechnic students.
            </p>
          </div>
        </div>

        {profile.verification_status === 'verified' ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-sm">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Your student account is verified</p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                You have full access to list books for sale, place purchase reservations, and review counterparties.
              </p>
            </div>
          </div>
        ) : profile.verification_status === 'pending' ? (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 flex items-center gap-3 text-sm">
            <Clock className="h-5 w-5 shrink-0 animate-pulse" />
            <div>
              <p className="font-semibold">Student ID under review</p>
              <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-0.5">
                Our campus admin team is reviewing your uploaded student ID card. You can browse books in the meantime.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.verification_status === 'rejected' && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Previous submission rejected</p>
                  <p className="text-xs mt-0.5">
                    Reason: {profile.verification_rejection_reason || 'Image unreadable or name/roll mismatch.'}
                  </p>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Upload a clear photo of your official Polytechnic Student ID card. Make sure your name, student ID/roll, and institute are clearly readable.
            </p>
            <IdUploadForm />
          </div>
        )}
      </div>

      {/* Academic Details (Read-only) */}
      <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-semibold">Academic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-xs text-muted-foreground block">Institute</span>
              <span className="font-medium">{institute?.name || 'Mymensingh Polytechnic Institute'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-xs text-muted-foreground block">Technology / Department</span>
              <span className="font-medium">{department?.name || 'Computer Technology'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-xs text-muted-foreground block">Student ID / Roll</span>
              <span className="font-medium">{profile.student_id}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <span className="text-xs text-muted-foreground block">Semester</span>
              <span className="font-medium">{semester?.name || '1st Semester'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Contact Information */}
      <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-semibold">Edit Contact Info</h2>
        <ProfileEditForm profile={profile} semesters={semesters} />
      </div>
    </div>
  );
}
