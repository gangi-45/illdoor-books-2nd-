import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';
import { getInstitutes, getDepartments, getSemesters } from '@/lib/services/reference';

export const metadata: Metadata = {
  title: 'Student Registration | Polytechnic Used Book Marketplace',
  description: 'Join your polytechnic peer-to-peer textbook marketplace.',
};

export default async function RegisterPage() {
  const [institutes, departments, semesters] = await Promise.all([
    getInstitutes(),
    getDepartments(),
    getSemesters(),
  ]);

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm
        institutes={institutes}
        departments={departments}
        semesters={semesters}
      />
    </div>
  );
}
