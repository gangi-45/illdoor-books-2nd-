import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import type { Department, Institute, Semester, Subject } from '@/types/database';

// Default fallback data for Mymensingh Polytechnic Institute if database tables are empty
export const FALLBACK_INSTITUTE: Institute = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Mymensingh Polytechnic Institute',
  code: 'MPI',
  address: 'Mymensingh, Bangladesh',
  active: true,
  created_at: new Date().toISOString(),
};

export const FALLBACK_DEPARTMENTS: Department[] = [
  { id: 'd0000000-0000-0000-0000-000000000001', institute_id: 'a0000000-0000-0000-0000-000000000001', name: 'Computer Technology', code: 'CT', active: true, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000002', institute_id: 'a0000000-0000-0000-0000-000000000001', name: 'Electronics Technology', code: 'ET', active: true, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000003', institute_id: 'a0000000-0000-0000-0000-000000000001', name: 'Electrical Technology', code: 'EL', active: true, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000004', institute_id: 'a0000000-0000-0000-0000-000000000001', name: 'Civil Technology', code: 'CV', active: true, created_at: new Date().toISOString() },
  { id: 'd0000000-0000-0000-0000-000000000005', institute_id: 'a0000000-0000-0000-0000-000000000001', name: 'Mechanical Technology', code: 'ME', active: true, created_at: new Date().toISOString() },
];

export const FALLBACK_SEMESTERS: Semester[] = [
  { id: 's0000000-0000-0000-0000-000000000001', number: 1, name: '1st Semester', active: true, created_at: new Date().toISOString() },
  { id: 's0000000-0000-0000-0000-000000000002', number: 2, name: '2nd Semester', active: true, created_at: new Date().toISOString() },
  { id: 's0000000-0000-0000-0000-000000000003', number: 3, name: '3rd Semester', active: true, created_at: new Date().toISOString() },
  { id: 's0000000-0000-0000-0000-000000000004', number: 4, name: '4th Semester', active: true, created_at: new Date().toISOString() },
  { id: 's0000000-0000-0000-0000-000000000005', number: 5, name: '5th Semester', active: true, created_at: new Date().toISOString() },
  { id: 's0000000-0000-0000-0000-000000000006', number: 6, name: '6th Semester', active: true, created_at: new Date().toISOString() },
  { id: 's0000000-0000-0000-0000-000000000007', number: 7, name: '7th Semester', active: true, created_at: new Date().toISOString() },
  { id: 's0000000-0000-0000-0000-000000000008', number: 8, name: '8th Semester', active: true, created_at: new Date().toISOString() },
];

export const FALLBACK_SUBJECTS: Subject[] = [
  { id: 'sub-01', department_id: 'd0000000-0000-0000-0000-000000000001', semester_id: 's0000000-0000-0000-0000-000000000001', name: 'Bangla', code: '25711', created_at: new Date().toISOString() },
  { id: 'sub-02', department_id: 'd0000000-0000-0000-0000-000000000001', semester_id: 's0000000-0000-0000-0000-000000000001', name: 'English', code: '25712', created_at: new Date().toISOString() },
  { id: 'sub-03', department_id: 'd0000000-0000-0000-0000-000000000001', semester_id: 's0000000-0000-0000-0000-000000000001', name: 'Mathematics-1', code: '25911', created_at: new Date().toISOString() },
  { id: 'sub-04', department_id: 'd0000000-0000-0000-0000-000000000001', semester_id: 's0000000-0000-0000-0000-000000000001', name: 'Physics-1', code: '25912', created_at: new Date().toISOString() },
  { id: 'sub-05', department_id: 'd0000000-0000-0000-0000-000000000001', semester_id: 's0000000-0000-0000-0000-000000000001', name: 'Computer Application', code: '26811', created_at: new Date().toISOString() },
  { id: 'sub-06', department_id: 'd0000000-0000-0000-0000-000000000001', semester_id: 's0000000-0000-0000-0000-000000000002', name: 'Mathematics-2', code: '25921', created_at: new Date().toISOString() },
  { id: 'sub-07', department_id: 'd0000000-0000-0000-0000-000000000001', semester_id: 's0000000-0000-0000-0000-000000000002', name: 'Physics-2', code: '25922', created_at: new Date().toISOString() },
  { id: 'sub-08', department_id: 'd0000000-0000-0000-0000-000000000001', semester_id: 's0000000-0000-0000-0000-000000000002', name: 'Programming Essentials', code: '26821', created_at: new Date().toISOString() },
];

export async function getInstitutes(): Promise<Institute[]> {
  if (!isSupabaseConfigured()) {
    return [FALLBACK_INSTITUTE];
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('institutes')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error || !data || data.length === 0) {
      return [FALLBACK_INSTITUTE];
    }
    return data;
  } catch {
    return [FALLBACK_INSTITUTE];
  }
}

export async function getDepartments(instituteId?: string): Promise<Department[]> {
  if (!isSupabaseConfigured()) {
    return instituteId
      ? FALLBACK_DEPARTMENTS.filter((d) => d.institute_id === instituteId)
      : FALLBACK_DEPARTMENTS;
  }
  try {
    const supabase = await createClient();
    let query = supabase.from('departments').select('*').eq('active', true).order('name');
    if (instituteId) {
      query = query.eq('institute_id', instituteId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return instituteId
        ? FALLBACK_DEPARTMENTS.filter((d) => d.institute_id === instituteId)
        : FALLBACK_DEPARTMENTS;
    }
    return data;
  } catch {
    return instituteId
      ? FALLBACK_DEPARTMENTS.filter((d) => d.institute_id === instituteId)
      : FALLBACK_DEPARTMENTS;
  }
}

export async function getSemesters(): Promise<Semester[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_SEMESTERS;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('semesters')
      .select('*')
      .eq('active', true)
      .order('number');

    if (error || !data || data.length === 0) {
      return FALLBACK_SEMESTERS;
    }
    return data;
  } catch {
    return FALLBACK_SEMESTERS;
  }
}

export async function getSubjects(departmentId?: string, semesterId?: string): Promise<Subject[]> {
  if (!isSupabaseConfigured()) {
    let result = FALLBACK_SUBJECTS;
    if (departmentId) result = result.filter((s) => s.department_id === departmentId);
    if (semesterId) result = result.filter((s) => s.semester_id === semesterId);
    return result;
  }
  try {
    const supabase = await createClient();
    let query = supabase.from('subjects').select('*').order('name');
    if (departmentId) query = query.eq('department_id', departmentId);
    if (semesterId) query = query.eq('semester_id', semesterId);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      let result = FALLBACK_SUBJECTS;
      if (departmentId) result = result.filter((s) => s.department_id === departmentId);
      if (semesterId) result = result.filter((s) => s.semester_id === semesterId);
      return result;
    }
    return data;
  } catch {
    let result = FALLBACK_SUBJECTS;
    if (departmentId) result = result.filter((s) => s.department_id === departmentId);
    if (semesterId) result = result.filter((s) => s.semester_id === semesterId);
    return result;
  }
}
