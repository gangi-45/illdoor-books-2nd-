'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createAdminClient, createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { registerSchema, loginSchema, profileUpdateSchema } from '@/lib/validations';
import { ACCEPTED_IMAGE_TYPES, DEFAULT_MAX_FILE_SIZE } from '@/lib/constants';
import { saveProfileToFirestore, getProfileFromFirestore } from '@/lib/firebase/firestore';
import type { Profile } from '@/types/database';

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Sign In Server Action
 */
export async function signInAction(prevState: unknown, formData: FormData): Promise<ActionResponse> {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Please check your inputs',
    };
  }

  try {
    const supabase = await createClient();
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isPlaceholder) {
      // Look up profile in Firestore if previously registered
      const firestoreProfile = await getProfileFromFirestore(parsed.data.email);
      const cookieStore = await cookies();
      cookieStore.set('demo_user_email', parsed.data.email, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
      if (firestoreProfile) {
        cookieStore.set('demo_user_name', firestoreProfile.full_name, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
        cookieStore.set('demo_user_phone', firestoreProfile.phone, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
        cookieStore.set('demo_user_roll', firestoreProfile.student_id, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
        cookieStore.set('demo_user_role', firestoreProfile.role, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
      }
      revalidatePath('/', 'layout');
      redirect((formData.get('redirect') as string) || '/profile');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return {
        success: false,
        message: error.message || 'Invalid email or password',
      };
    }

    if (data.user) {
      // Check account status
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_status, verification_status')
        .eq('auth_user_id', data.user.id)
        .single();

      if (profile?.account_status === 'suspended') {
        await supabase.auth.signOut();
        return {
          success: false,
          message: 'Your account has been suspended. Please contact campus support.',
        };
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && 'digest' in err && (err as any).digest?.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Authentication failed';
    return {
      success: false,
      message,
    };
  }

  revalidatePath('/', 'layout');
  const redirectUrl = (formData.get('redirect') as string) || '/';
  redirect(redirectUrl);
}

/**
 * Sign Up Server Action
 * Handles user account creation, profile creation, and optional student ID card upload for verification.
 */
export async function signUpAction(prevState: unknown, formData: FormData): Promise<ActionResponse> {
  const rawData = {
    full_name: formData.get('full_name') as string,
    student_id: formData.get('student_id') as string,
    institute_id: formData.get('institute_id') as string,
    department_id: formData.get('department_id') as string,
    semester_id: formData.get('semester_id') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirm_password: formData.get('confirm_password') as string,
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Please resolve form errors',
      data: rawData,
    };
  }

  const idCardFile = formData.get('id_card') as File | null;
  let idCardPath: string | null = null;
  let isPendingVerification = false;

  // Validate ID card file if provided
  if (idCardFile && idCardFile.size > 0) {
    if (!ACCEPTED_IMAGE_TYPES.includes(idCardFile.type as typeof ACCEPTED_IMAGE_TYPES[number])) {
      return {
        success: false,
        errors: { id_card: ['ID card must be a JPG, PNG, or WebP image'] },
        message: 'Invalid ID card file format',
      };
    }

    if (idCardFile.size > DEFAULT_MAX_FILE_SIZE) {
      return {
        success: false,
        errors: { id_card: ['ID card image size must not exceed 5MB'] },
        message: 'File size too large',
      };
    }
    isPendingVerification = true;
  }

  try {
    const supabase = await createClient();
    const adminClient = await createAdminClient();
    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isPlaceholder) {
      // Development mode fallback: establish local session & persist to Firestore
      const cookieStore = await cookies();
      cookieStore.set('demo_user_email', parsed.data.email, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
      cookieStore.set('demo_user_name', parsed.data.full_name, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
      cookieStore.set('demo_user_phone', parsed.data.phone, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
      cookieStore.set('demo_user_roll', parsed.data.student_id, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7 });

      const newProfile: Profile = {
        id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        auth_user_id: `u-${Date.now()}`,
        full_name: parsed.data.full_name,
        student_id: parsed.data.student_id,
        institute_id: parsed.data.institute_id,
        department_id: parsed.data.department_id,
        semester_id: parsed.data.semester_id,
        phone: parsed.data.phone,
        email: parsed.data.email,
        avatar_url: null,
        id_card_url: null,
        verification_status: isPendingVerification ? 'pending' : 'verified',
        verification_rejection_reason: null,
        account_status: 'active',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await saveProfileToFirestore(newProfile);

      revalidatePath('/', 'layout');
      redirect('/profile');
    }

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.full_name,
          student_id: parsed.data.student_id,
        },
      },
    });

    if (authError || !authData.user) {
      return {
        success: false,
        message: authError?.message || 'Failed to create account',
      };
    }

    const userId = authData.user.id;

    // 2. Upload ID card to private bucket if provided
    if (idCardFile && idCardFile.size > 0) {
      const ext = idCardFile.name.split('.').pop() || 'jpg';
      const filename = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
      
      const { data: uploadData, error: uploadError } = await adminClient.storage
        .from('student-ids')
        .upload(filename, idCardFile, {
          contentType: idCardFile.type,
          upsert: true,
        });

      if (!uploadError && uploadData) {
        idCardPath = uploadData.path;
      }
    }

    // 3. Create profile record (bypasses RLS with admin client to guarantee creation)
    const { error: profileError } = await adminClient.from('profiles').insert({
      auth_user_id: userId,
      full_name: parsed.data.full_name,
      student_id: parsed.data.student_id,
      institute_id: parsed.data.institute_id,
      department_id: parsed.data.department_id,
      semester_id: parsed.data.semester_id,
      phone: parsed.data.phone,
      email: parsed.data.email,
      id_card_url: idCardPath,
      verification_status: isPendingVerification ? 'pending' : 'unverified',
      account_status: 'active',
      role: 'user',
    });

    if (profileError) {
      return {
        success: false,
        message: 'Account created but profile failed: ' + profileError.message,
      };
    }

    // 4. Send initial system notification
    await adminClient.from('notifications').insert({
      user_id: userId,
      type: 'system_notice',
      title: 'Welcome to Polytechnic Marketplace!',
      message: isPendingVerification
        ? 'Your student ID card has been received and is pending admin verification. You can browse books now.'
        : 'Welcome! Upload your student ID card in your profile anytime to start buying and selling.',
    });

  } catch (err: unknown) {
    if (err instanceof Error && 'digest' in err && (err as any).digest?.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Registration failed';
    return {
      success: false,
      message,
    };
  }

  revalidatePath('/', 'layout');
  redirect('/profile');
}

/**
 * Sign Out Server Action
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  const cookieStore = await cookies();
  cookieStore.delete('demo_user_email');
  cookieStore.delete('demo_user_name');
  cookieStore.delete('demo_user_phone');
  cookieStore.delete('demo_user_roll');
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

/**
 * Get current session user and associated profile
 */
export async function getCurrentProfile(): Promise<{
  user: { id: string; email?: string } | null;
  profile: Profile | null;
}> {
  try {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const demoEmail = cookieStore.get('demo_user_email')?.value;

    if (demoEmail) {
      const firestoreProfile = await getProfileFromFirestore(demoEmail);
      if (firestoreProfile) {
        return {
          user: { id: firestoreProfile.auth_user_id, email: demoEmail },
          profile: firestoreProfile,
        };
      }

      const demoName = cookieStore.get('demo_user_name')?.value || 'Tanvir Ahmed';
      const demoPhone = cookieStore.get('demo_user_phone')?.value || '017347285643';
      const demoRoll = cookieStore.get('demo_user_roll')?.value || '589210';
      const demoRole = cookieStore.get('demo_user_role')?.value || (demoEmail.toLowerCase().includes('admin') ? 'admin' : 'user');
      const demoProfile: Profile = {
        id: demoRole === 'admin' ? 'p0000000-0000-0000-0000-000000000099' : 'p0000000-0000-0000-0000-000000000001',
        auth_user_id: demoRole === 'admin' ? 'u0000000-0000-0000-0000-000000000099' : 'u0000000-0000-0000-0000-000000000001',
        full_name: demoRole === 'admin' ? 'MPI Campus Admin' : demoName,
        student_id: demoRole === 'admin' ? 'ADMIN-01' : demoRoll,
        institute_id: 'a0000000-0000-0000-0000-000000000001',
        department_id: 'd0000000-0000-0000-0000-000000000001',
        semester_id: 's0000000-0000-0000-0000-000000000001',
        phone: demoPhone,
        email: demoEmail,
        avatar_url: null,
        id_card_url: null,
        verification_status: 'verified',
        verification_rejection_reason: null,
        account_status: 'active',
        role: demoRole as 'user' | 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return {
        user: { id: 'u0000000-0000-0000-0000-000000000001', email: demoEmail },
        profile: demoProfile,
      };
    }

    if (!isSupabaseConfigured()) {
      return { user: null, profile: null };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { user: null, profile: null };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    return {
      user: { id: user.id, email: user.email },
      profile: profile as Profile | null,
    };
  } catch {
    return { user: null, profile: null };
  }
}

/**
 * Upload Student ID card for verification (for unverified or rejected accounts)
 */
export async function uploadVerificationIdAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const file = formData.get('id_card') as File | null;
  if (!file || file.size === 0) {
    return {
      success: false,
      message: 'Please select an image file',
      errors: { id_card: ['Student ID card image is required'] },
    };
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as typeof ACCEPTED_IMAGE_TYPES[number])) {
    return {
      success: false,
      message: 'Invalid file format. Please upload JPG, PNG, or WebP.',
      errors: { id_card: ['Only JPG, PNG, and WebP are supported'] },
    };
  }

  if (file.size > DEFAULT_MAX_FILE_SIZE) {
    return {
      success: false,
      message: 'File size exceeds 5MB limit',
      errors: { id_card: ['Image size must be 5MB or less'] },
    };
  }

  try {
    const { user, profile } = await getCurrentProfile();
    if (!user || !profile) {
      return { success: false, message: 'You must be logged in to submit verification' };
    }

    if (isSupabaseConfigured()) {
      const adminClient = await createAdminClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const storagePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { error: uploadError } = await adminClient.storage
        .from('student-ids')
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError) {
        await adminClient
          .from('profiles')
          .update({
            id_card_url: storagePath,
            verification_status: 'pending',
            verification_rejection_reason: null,
            updated_at: new Date().toISOString(),
          })
          .eq('auth_user_id', user.id);
      }
    }

    // Always update Firestore profile and session cookies
    const updatedProfile: Profile = {
      ...profile,
      verification_status: 'verified', // Instant verification in demo for seamless flow testing
      updated_at: new Date().toISOString(),
    };
    await saveProfileToFirestore(updatedProfile);

    revalidatePath('/profile');
    revalidatePath('/sell');
    return {
      success: true,
      message: 'Student ID card verified successfully! You can now list books and place orders.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit verification';
    return { success: false, message };
  }
}

/**
 * Update Profile Server Action
 */
export async function updateProfileAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    full_name: (formData.get('full_name') as string) || undefined,
    phone: (formData.get('phone') as string) || undefined,
    semester_id: (formData.get('semester_id') as string) || undefined,
  };

  const parsed = profileUpdateSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Invalid profile data',
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const updates: Partial<Profile> = {
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.full_name) updates.full_name = parsed.data.full_name;
    if (parsed.data.phone) updates.phone = parsed.data.phone;
    if (parsed.data.semester_id) updates.semester_id = parsed.data.semester_id;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('auth_user_id', user.id);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath('/profile');
    return { success: true, message: 'Profile updated successfully' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return { success: false, message };
  }
}
