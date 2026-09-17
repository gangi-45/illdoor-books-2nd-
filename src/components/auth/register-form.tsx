'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { signUpAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Department, Institute, Semester } from '@/types/database';
import {
  BookOpen,
  UserPlus,
  Mail,
  Lock,
  User,
  Hash,
  Phone,
  Building2,
  GraduationCap,
  Calendar,
  UploadCloud,
  FileImage,
  X,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

interface RegisterFormProps {
  institutes: Institute[];
  departments: Department[];
  semesters: Semester[];
}

export function RegisterForm({ institutes, departments, semesters }: RegisterFormProps) {
  const [state, formAction, isPending] = useActionState(signUpAction, {
    success: false,
  });

  const [selectedInstitute, setSelectedInstitute] = useState<string>(
    (state as any)?.data?.institute_id || institutes[0]?.id || ''
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    (state as any)?.data?.department_id || ''
  );
  const [selectedSemester, setSelectedSemester] = useState<string>(
    (state as any)?.data?.semester_id || semesters[0]?.id || ''
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const filteredDepartments = departments.filter(
    (dept) => !selectedInstitute || dept.institute_id === selectedInstitute
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    const input = document.getElementById('id_card') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-card border rounded-2xl shadow-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand/10 text-brand mb-4">
          <BookOpen className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Student Registration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create an account to buy and sell used books at your polytechnic institute
        </p>
      </div>

      {state.message && !state.success && (
        <div className="mb-6 flex items-center gap-3 p-3.5 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {/* Section: Personal Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground/80 tracking-wide uppercase">
            Personal & Student Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={(state as any)?.data?.full_name || 'Tanvir Ahmed'}
                  placeholder="e.g. Tanvir Ahmed"
                  required
                  className="pl-9"
                />
              </div>
              {state.errors?.full_name && (
                <p className="text-xs text-destructive">{state.errors.full_name[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="student_id">Student ID / Roll No *</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="student_id"
                  name="student_id"
                  defaultValue={(state as any)?.data?.student_id || '589210'}
                  placeholder="e.g. 589210"
                  required
                  className="pl-9"
                />
              </div>
              {state.errors?.student_id && (
                <p className="text-xs text-destructive">{state.errors.student_id[0]}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section: Academic Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground/80 tracking-wide uppercase">
            Campus & Academic Details
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="institute_id">Institute *</Label>
              <div className="relative">
                <select
                  id="institute_id"
                  name="institute_id"
                  value={selectedInstitute}
                  onChange={(e) => {
                    setSelectedInstitute(e.target.value);
                    setSelectedDepartment('');
                  }}
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  {institutes.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.code})
                    </option>
                  ))}
                </select>
              </div>
              {state.errors?.institute_id && (
                <p className="text-xs text-destructive">{state.errors.institute_id[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="department_id">Department *</Label>
                <div className="relative">
                  <select
                    id="department_id"
                    name="department_id"
                    required
                    value={selectedDepartment || (filteredDepartments[0]?.id ?? '')}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  >
                    <option value="">Select Technology / Dept</option>
                    {filteredDepartments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
                {state.errors?.department_id && (
                  <p className="text-xs text-destructive">{state.errors.department_id[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="semester_id">Current Semester *</Label>
                <div className="relative">
                  <select
                    id="semester_id"
                    name="semester_id"
                    required
                    value={selectedSemester || (semesters[0]?.id ?? '')}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.name}
                      </option>
                    ))}
                  </select>
                </div>
                {state.errors?.semester_id && (
                  <p className="text-xs text-destructive">{state.errors.semester_id[0]}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Contact & Account */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground/80 tracking-wide uppercase">
            Contact & Security
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={(state as any)?.fields?.phone || ''}
                  placeholder="017347285643"
                  required
                  className="pl-9"
                />
              </div>
              {state.errors?.phone && (
                <p className="text-xs text-destructive">{state.errors.phone[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={(state as any)?.fields?.email || ''}
                  placeholder="ytwrei@gmail.com"
                  required
                  className="pl-9"
                />
              </div>
              {state.errors?.email && (
                <p className="text-xs text-destructive">{state.errors.email[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  defaultValue={(state as any)?.fields?.password || ''}
                  placeholder="At least 8 characters"
                  required
                  className="pl-9"
                />
              </div>
              {state.errors?.password && (
                <p className="text-xs text-destructive">{state.errors.password[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm_password">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  defaultValue={(state as any)?.fields?.confirm_password || ''}
                  placeholder="Re-enter password"
                  required
                  className="pl-9"
                />
              </div>
              {state.errors?.confirm_password && (
                <p className="text-xs text-destructive">
                  {state.errors.confirm_password[0]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section: Student ID Verification (Optional at registration) */}
        <div className="space-y-3 p-4 rounded-xl bg-muted/40 border">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brand/10 text-brand shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">
                Student ID Verification (Recommended)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload your student ID card photo now to get fast-track verified. Verified
                students can sell books, order books, and leave reviews. (You can also skip and upload later in your profile).
              </p>
            </div>
          </div>

          <div className="mt-3">
            {previewUrl ? (
              <div className="relative inline-block border rounded-lg overflow-hidden max-w-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Student ID Preview"
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 rounded-full bg-background/90 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-xs"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="id_card"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-accent/50 transition-colors border-muted-foreground/25"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                  <UploadCloud className="w-8 h-8 mb-2 text-brand" />
                  <p className="text-xs font-medium">
                    Click to upload Student ID photo (JPG, PNG, WebP)
                  </p>
                  <p className="text-[11px] text-muted-foreground/75 mt-0.5">Max size: 5MB</p>
                </div>
                <input
                  id="id_card"
                  name="id_card"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
            {state.errors?.id_card && (
              <p className="text-xs text-destructive mt-1.5">{state.errors.id_card[0]}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-brand text-brand-foreground hover:bg-brand/90 font-medium py-2.5"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating your student account...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground border-t pt-6">
        Already registered?{' '}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Sign in here
        </Link>
      </div>
    </div>
  );
}
