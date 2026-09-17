'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient, createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/actions/auth';
import { bookListingSchema, reportSchema } from '@/lib/validations';
import { addRuntimeBook } from '@/lib/services/runtime-store';
import { addBookToFirestore } from '@/lib/firebase/firestore';
import { FALLBACK_DEPARTMENTS, FALLBACK_SEMESTERS } from '@/lib/services/reference';
import {
  ACCEPTED_IMAGE_TYPES,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_MAX_IMAGES,
} from '@/lib/constants';

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Create a new book listing.
 * Server-side enforced: user must be authenticated AND verified.
 */
export async function createBookListingAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const { user, profile } = await getCurrentProfile();

  if (!user || !profile) {
    return { success: false, message: 'You must be logged in to list a book.' };
  }

  // Verification Gate (Section 6 & 11)
  if (profile.verification_status !== 'verified') {
    return {
      success: false,
      message:
        'Your student account must be verified by an admin before you can sell books. Please visit your profile to submit your Student ID.',
    };
  }

  if (profile.account_status === 'restricted' || profile.account_status === 'suspended') {
    return {
      success: false,
      message: 'Your account is restricted from creating listings.',
    };
  }

  const rawData = {
    title: formData.get('title') as string,
    author: (formData.get('author') as string) || null,
    subject_code: formData.get('subject_code') as string,
    department_id: formData.get('department_id') as string,
    semester_id: formData.get('semester_id') as string,
    description: (formData.get('description') as string) || null,
    edition: (formData.get('edition') as string) || null,
    condition: formData.get('condition') as string,
    writing_inside: formData.get('writing_inside') === 'true' || formData.get('writing_inside') === 'on',
    highlighting: formData.get('highlighting') === 'true' || formData.get('highlighting') === 'on',
    missing_pages: formData.get('missing_pages') === 'true' || formData.get('missing_pages') === 'on',
    cover_damage: formData.get('cover_damage') === 'true' || formData.get('cover_damage') === 'on',
    page_damage: formData.get('page_damage') === 'true' || formData.get('page_damage') === 'on',
    original_price: parseFloat(formData.get('original_price') as string),
    selling_price: parseFloat(formData.get('selling_price') as string),
  };

  const parsed = bookListingSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Please resolve listing errors',
    };
  }

  // Handle uploaded images
  const imageFiles = formData.getAll('images') as File[];
  const validFiles = imageFiles.filter((f) => f && f.size > 0);

  if (validFiles.length === 0) {
    return {
      success: false,
      errors: { images: ['At least one book photo is required'] },
      message: 'Please upload at least one photo of the book',
    };
  }

  if (validFiles.length > DEFAULT_MAX_IMAGES) {
    return {
      success: false,
      errors: { images: [`Maximum ${DEFAULT_MAX_IMAGES} photos allowed per book`] },
      message: 'Too many images',
    };
  }

  for (const file of validFiles) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as typeof ACCEPTED_IMAGE_TYPES[number])) {
      return {
        success: false,
        errors: { images: ['All images must be JPG, PNG, or WebP'] },
        message: 'Invalid image format',
      };
    }
    if (file.size > DEFAULT_MAX_FILE_SIZE) {
      return {
        success: false,
        errors: { images: ['Each image must be 5MB or less'] },
        message: 'Image size too large',
      };
    }
  }

  let createdBookId: string | null = null;
  const imageUrls: string[] = [];

  // Generate mock preview image URLs if images provided, or use standard book image
  if (validFiles.length > 0) {
    imageUrls.push('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80');
  } else {
    imageUrls.push('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80');
  }

  const generatedId = `b-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const adminClient = await createAdminClient();

      // 1. Insert book record
      const { data: book, error: bookError } = await supabase
        .from('books')
        .insert({
          seller_id: profile.id,
          title: parsed.data.title,
          author: parsed.data.author || null,
          subject_code: parsed.data.subject_code,
          department_id: parsed.data.department_id,
          semester_id: parsed.data.semester_id,
          description: parsed.data.description || null,
          edition: parsed.data.edition || null,
          condition: parsed.data.condition,
          writing_inside: parsed.data.writing_inside,
          highlighting: parsed.data.highlighting,
          missing_pages: parsed.data.missing_pages,
          cover_damage: parsed.data.cover_damage,
          page_damage: parsed.data.page_damage,
          original_price: parsed.data.original_price,
          selling_price: parsed.data.selling_price,
          listing_status: 'available',
        })
        .select('id')
        .single();

      if (!bookError && book) {
        createdBookId = book.id;

        // Upload images if any
        let sortOrder = 0;
        for (const file of validFiles) {
          const ext = file.name.split('.').pop() || 'jpg';
          const storagePath = `${user.id}/${createdBookId}/${sortOrder}-${Date.now()}.${ext}`;

          const { data: uploadData, error: uploadError } = await adminClient.storage
            .from('book-images')
            .upload(storagePath, file, {
              contentType: file.type,
              upsert: true,
            });

          let publicUrl = '';
          if (!uploadError && uploadData) {
            const { data: urlData } = adminClient.storage
              .from('book-images')
              .getPublicUrl(uploadData.path);
            publicUrl = urlData.publicUrl;
          } else {
            publicUrl = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
          }

          await adminClient.from('book_images').insert({
            book_id: createdBookId,
            storage_path: storagePath,
            public_url: publicUrl,
            sort_order: sortOrder,
          });

          sortOrder++;
        }
      }
    }

    // Always ensure book is registered in runtime store and Firestore for instant availability
    createdBookId = createdBookId || generatedId;

    const dept = FALLBACK_DEPARTMENTS.find((d) => d.id === parsed.data.department_id);
    const sem = FALLBACK_SEMESTERS.find((s) => s.id === parsed.data.semester_id);

    const runtimeBook = {
      id: createdBookId,
      seller_id: profile.id,
      title: parsed.data.title,
      author: parsed.data.author || null,
      subject_code: parsed.data.subject_code,
      subject_id: null,
      department_id: parsed.data.department_id,
      semester_id: parsed.data.semester_id,
      description: parsed.data.description || null,
      edition: parsed.data.edition || null,
      condition: parsed.data.condition,
      writing_inside: parsed.data.writing_inside,
      highlighting: parsed.data.highlighting,
      missing_pages: parsed.data.missing_pages,
      cover_damage: parsed.data.cover_damage,
      page_damage: parsed.data.page_damage,
      original_price: parsed.data.original_price,
      selling_price: parsed.data.selling_price,
      listing_status: 'available' as const,
      views_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      departments: dept ? { name: dept.name, code: dept.code } : { name: 'Computer Technology', code: 'CT' },
      semesters: sem ? { number: sem.number, name: sem.name } : { number: 1, name: '1st Semester' },
      book_images: [
        {
          storage_path: `mock/${createdBookId}.jpg`,
          public_url: imageUrls[0],
          sort_order: 0,
        },
      ],
      seller: {
        id: profile.id,
        full_name: profile.full_name,
        student_id: profile.student_id,
        verification_status: profile.verification_status,
      },
    };

    addRuntimeBook(runtimeBook);

    // Also persist to Firestore
    await addBookToFirestore({
      ...runtimeBook,
      image_urls: imageUrls,
    });
  } catch (err: unknown) {
    console.error('Book listing creation notice:', err);
    // If redirect was thrown, re-throw it so Next.js handles the navigation
    if (err && typeof err === 'object' && 'digest' in err) {
      throw err;
    }
  }

  revalidatePath('/browse');
  revalidatePath('/');
  redirect(`/book/${createdBookId || generatedId}`);
}

/**
 * Toggle Book in User's Wishlist
 */
export async function toggleWishlistAction(bookId: string): Promise<ActionResponse<{ inWishlist: boolean }>> {
  const { user, profile } = await getCurrentProfile();
  if (!user || !profile) {
    return { success: false, message: 'Please sign in to save books to your wishlist' };
  }

  try {
    const supabase = await createClient();

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', profile.id)
      .eq('book_id', bookId)
      .maybeSingle();

    if (existing) {
      await supabase.from('wishlists').delete().eq('id', existing.id);
      revalidatePath(`/book/${bookId}`);
      revalidatePath('/wishlist');
      return { success: true, data: { inWishlist: false }, message: 'Removed from wishlist' };
    } else {
      await supabase.from('wishlists').insert({
        user_id: profile.id,
        book_id: bookId,
      });
      revalidatePath(`/book/${bookId}`);
      revalidatePath('/wishlist');
      return { success: true, data: { inWishlist: true }, message: 'Added to wishlist' };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update wishlist';
    return { success: false, message };
  }
}

/**
 * Check if a book is in current user's wishlist
 */
export async function checkIsInWishlist(bookId: string): Promise<boolean> {
  const { user, profile } = await getCurrentProfile();
  if (!user || !profile) return false;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', profile.id)
      .eq('book_id', bookId)
      .maybeSingle();

    return Boolean(data);
  } catch {
    return false;
  }
}

/**
 * Submit a report on a book listing
 */
export async function reportListingAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const { user, profile } = await getCurrentProfile();
  if (!user || !profile) {
    return { success: false, message: 'Please sign in to report this listing' };
  }

  const rawData = {
    category: formData.get('category') as string,
    description: formData.get('description') as string,
    related_book_id: formData.get('related_book_id') as string,
  };

  const parsed = reportSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Please fill in all required report details',
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('reports').insert({
      reporter_id: profile.id,
      category: parsed.data.category,
      description: parsed.data.description,
      related_book_id: parsed.data.related_book_id || null,
      status: 'open',
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: 'Thank you for reporting. Campus admin moderators have received your report.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit report';
    return { success: false, message };
  }
}
