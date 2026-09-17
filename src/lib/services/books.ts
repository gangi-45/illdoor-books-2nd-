import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import type { Book, BookCondition, ListingStatus } from '@/types/database';
import { getRuntimeBooks } from '@/lib/services/runtime-store';

export interface BookWithDetails extends Book {
  departments?: { name: string; code: string } | null;
  semesters?: { number: number; name: string } | null;
  book_images?: { storage_path: string; public_url: string; sort_order: number }[];
  seller?: {
    id: string;
    full_name: string;
    student_id: string;
    verification_status: string;
  } | null;
  views_count?: number;
}

export interface GetBooksParams {
  search?: string;
  departmentId?: string;
  semesterId?: string;
  condition?: BookCondition;
  minPrice?: number;
  maxPrice?: number;
  status?: ListingStatus | 'all';
  sortBy?: 'recommended' | 'newest' | 'price_low' | 'price_high';
  limit?: number;
  offset?: number;
}

// Sample fallback books matching seed.sql MPI subjects
export const FALLBACK_BOOKS: BookWithDetails[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    seller_id: 'u0000000-0000-0000-0000-000000000001',
    title: 'Computer Application (26811)',
    author: 'Haque Publications',
    subject_code: '26811',
    subject_id: 'sub-05',
    department_id: 'd0000000-0000-0000-0000-000000000001',
    semester_id: 's0000000-0000-0000-0000-000000000001',
    description: '1st Semester Computer Technology standard textbook. Clean pages with slight cover wear. No missing pages or ink stains.',
    edition: '2024 Edition',
    condition: 'good',
    writing_inside: false,
    highlighting: true,
    missing_pages: false,
    cover_damage: false,
    page_damage: false,
    original_price: 320,
    selling_price: 180,
    listing_status: 'available',
    views_count: 42,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    departments: { name: 'Computer Technology', code: 'CT' },
    semesters: { number: 1, name: '1st Semester' },
    book_images: [
      {
        storage_path: 'demo/computer-app.jpg',
        public_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
        sort_order: 0,
      },
    ],
    seller: {
      id: 'u0000000-0000-0000-0000-000000000001',
      full_name: 'Tanvir Ahmed',
      student_id: '589210',
      verification_status: 'verified',
    },
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    seller_id: 'u0000000-0000-0000-0000-000000000002',
    title: 'Programming Essentials in C (26821)',
    author: 'TechWorld Media',
    subject_code: '26821',
    subject_id: 'sub-08',
    department_id: 'd0000000-0000-0000-0000-000000000001',
    semester_id: 's0000000-0000-0000-0000-000000000002',
    description: '2nd semester C programming book. Highly recommended for lab exams and theory. Excellent like new condition.',
    edition: '5th Edition',
    condition: 'like_new',
    writing_inside: false,
    highlighting: false,
    missing_pages: false,
    cover_damage: false,
    page_damage: false,
    original_price: 380,
    selling_price: 220,
    listing_status: 'available',
    views_count: 58,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
    departments: { name: 'Computer Technology', code: 'CT' },
    semesters: { number: 2, name: '2nd Semester' },
    book_images: [
      {
        storage_path: 'demo/programming-c.jpg',
        public_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
        sort_order: 0,
      },
    ],
    seller: {
      id: 'u0000000-0000-0000-0000-000000000002',
      full_name: 'Mahmudul Hasan',
      student_id: '589215',
      verification_status: 'verified',
    },
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    seller_id: 'u0000000-0000-0000-0000-000000000003',
    title: 'Data Structure & Algorithm (26831)',
    author: 'Poly Technic Series',
    subject_code: '26831',
    subject_id: 'sub-58',
    department_id: 'd0000000-0000-0000-0000-000000000001',
    semester_id: 's0000000-0000-0000-0000-000000000003',
    description: '3rd semester core textbook. Covers trees, graphs, sorting, and linked lists with diagrams.',
    edition: 'Revised 2023',
    condition: 'used',
    writing_inside: true,
    highlighting: true,
    missing_pages: false,
    cover_damage: false,
    page_damage: false,
    original_price: 450,
    selling_price: 240,
    listing_status: 'available',
    views_count: 89,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date().toISOString(),
    departments: { name: 'Computer Technology', code: 'CT' },
    semesters: { number: 3, name: '3rd Semester' },
    book_images: [
      {
        storage_path: 'demo/dsa.jpg',
        public_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
        sort_order: 0,
      },
    ],
    seller: {
      id: 'u0000000-0000-0000-0000-000000000003',
      full_name: 'Sabrina Akter',
      student_id: '589220',
      verification_status: 'verified',
    },
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    seller_id: 'u0000000-0000-0000-0000-000000000004',
    title: 'Electrical Circuit-1 (26421)',
    author: 'Prof. A. Rahman',
    subject_code: '26421',
    subject_id: 'sub-52',
    department_id: 'd0000000-0000-0000-0000-000000000003',
    semester_id: 's0000000-0000-0000-0000-000000000002',
    description: 'Essential circuit theory, nodal/mesh analysis, Ohm & Kirchhoff laws. Good condition.',
    edition: 'Latest Edition',
    condition: 'good',
    writing_inside: false,
    highlighting: false,
    missing_pages: false,
    cover_damage: false,
    page_damage: false,
    original_price: 350,
    selling_price: 200,
    listing_status: 'available',
    views_count: 35,
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    updated_at: new Date().toISOString(),
    departments: { name: 'Electrical Technology', code: 'EL' },
    semesters: { number: 2, name: '2nd Semester' },
    book_images: [
      {
        storage_path: 'demo/circuit.jpg',
        public_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
        sort_order: 0,
      },
    ],
    seller: {
      id: 'u0000000-0000-0000-0000-000000000004',
      full_name: 'Rafiqul Islam',
      student_id: '589304',
      verification_status: 'verified',
    },
  },
  {
    id: 'b0000000-0000-0000-0000-000000000005',
    seller_id: 'u0000000-0000-0000-0000-000000000005',
    title: 'Electronics-1 (26521)',
    author: 'Shams Publications',
    subject_code: '26521',
    subject_id: 'sub-53',
    department_id: 'd0000000-0000-0000-0000-000000000002',
    semester_id: 's0000000-0000-0000-0000-000000000002',
    description: 'Semiconductor physics, diodes, transistors, power supplies. Like new without any markings.',
    edition: '2024 Release',
    condition: 'like_new',
    writing_inside: false,
    highlighting: false,
    missing_pages: false,
    cover_damage: false,
    page_damage: false,
    original_price: 400,
    selling_price: 250,
    listing_status: 'available',
    views_count: 64,
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    updated_at: new Date().toISOString(),
    departments: { name: 'Electronics Technology', code: 'ET' },
    semesters: { number: 2, name: '2nd Semester' },
    book_images: [
      {
        storage_path: 'demo/electronics.jpg',
        public_url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&auto=format&fit=crop&q=80',
        sort_order: 0,
      },
    ],
    seller: {
      id: 'u0000000-0000-0000-0000-000000000005',
      full_name: 'Arif Hossain',
      student_id: '589410',
      verification_status: 'verified',
    },
  },
  {
    id: 'b0000000-0000-0000-0000-000000000006',
    seller_id: 'u0000000-0000-0000-0000-000000000006',
    title: 'Mathematics-1 (25911)',
    author: 'Prof. K. C. Paul',
    subject_code: '25911',
    subject_id: 'sub-03',
    department_id: 'd0000000-0000-0000-0000-000000000001',
    semester_id: 's0000000-0000-0000-0000-000000000001',
    description: 'Foundational mathematics for all Polytechnic technology students. Solved exercises included.',
    edition: '2023 Edition',
    condition: 'used',
    writing_inside: true,
    highlighting: false,
    missing_pages: false,
    cover_damage: true,
    page_damage: false,
    original_price: 360,
    selling_price: 160,
    listing_status: 'available',
    views_count: 73,
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    updated_at: new Date().toISOString(),
    departments: { name: 'Computer Technology', code: 'CT' },
    semesters: { number: 1, name: '1st Semester' },
    book_images: [
      {
        storage_path: 'demo/math.jpg',
        public_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
        sort_order: 0,
      },
    ],
    seller: {
      id: 'u0000000-0000-0000-0000-000000000006',
      full_name: 'Nazmul Islam',
      student_id: '589250',
      verification_status: 'verified',
    },
  },
];

/**
 * Fetch books with search, filters, sorting, and pagination.
 */
export async function getBooks(params: GetBooksParams = {}): Promise<{
  books: BookWithDetails[];
  total: number;
}> {
  const {
    search,
    departmentId,
    semesterId,
    condition,
    minPrice,
    maxPrice,
    status = 'available',
    sortBy = 'newest',
    limit = 12,
    offset = 0,
  } = params;

  if (!isSupabaseConfigured()) {
    return filterFallbackBooks(params);
  }

  try {
    const supabase = await createClient();

    let query = supabase
      .from('books')
      .select(
        `
        *,
        departments (name, code),
        semesters (number, name),
        book_images (storage_path, public_url, sort_order),
        seller:profiles!seller_id (id, full_name, student_id, verification_status)
      `,
        { count: 'exact' }
      );

    if (status !== 'all') {
      query = query.eq('listing_status', status);
    }

    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    if (semesterId) {
      query = query.eq('semester_id', semesterId);
    }

    if (condition) {
      query = query.eq('condition', condition);
    }

    if (minPrice !== undefined && !isNaN(minPrice)) {
      query = query.gte('selling_price', minPrice);
    }

    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      query = query.lte('selling_price', maxPrice);
    }

    if (search && search.trim().length > 0) {
      const term = `%${search.trim()}%`;
      query = query.or(`title.ilike.${term},author.ilike.${term},subject_code.ilike.${term}`);
    }

    // Sort order
    switch (sortBy) {
      case 'price_low':
        query = query.order('selling_price', { ascending: true });
        break;
      case 'price_high':
        query = query.order('selling_price', { ascending: false });
        break;
      case 'recommended':
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error || !data || data.length === 0) {
      // Filter in-memory fallback books if database is empty/unreachable
      return filterFallbackBooks(params);
    }

    return {
      books: data as unknown as BookWithDetails[],
      total: count ?? data.length,
    };
  } catch {
    return filterFallbackBooks(params);
  }
}

/**
 * Filter fallback books for development / offline / unseeded states
 */
function filterFallbackBooks(params: GetBooksParams): {
  books: BookWithDetails[];
  total: number;
} {
  let filtered = [...getRuntimeBooks()];

  if (params.status && params.status !== 'all') {
    filtered = filtered.filter((b) => b.listing_status === params.status);
  }

  if (params.departmentId) {
    filtered = filtered.filter((b) => b.department_id === params.departmentId);
  }

  if (params.semesterId) {
    filtered = filtered.filter((b) => b.semester_id === params.semesterId);
  }

  if (params.condition) {
    filtered = filtered.filter((b) => b.condition === params.condition);
  }

  if (params.minPrice !== undefined) {
    filtered = filtered.filter((b) => b.selling_price >= params.minPrice!);
  }

  if (params.maxPrice !== undefined) {
    filtered = filtered.filter((b) => b.selling_price <= params.maxPrice!);
  }

  if (params.search && params.search.trim().length > 0) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        b.subject_code.toLowerCase().includes(q)
    );
  }

  // Sorting
  switch (params.sortBy) {
    case 'price_low':
      filtered.sort((a, b) => a.selling_price - b.selling_price);
      break;
    case 'price_high':
      filtered.sort((a, b) => b.selling_price - a.selling_price);
      break;
    case 'recommended':
    case 'newest':
    default:
      filtered.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      break;
  }

  const total = filtered.length;
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 12;
  const paged = filtered.slice(offset, offset + limit);

  return { books: paged, total };
}

/**
 * Fetch a single book by ID with full details
 */
export async function getBookById(id: string): Promise<BookWithDetails | null> {
  const runtimeMatch = getRuntimeBooks().find((b) => b.id === id);
  if (runtimeMatch) {
    return runtimeMatch;
  }

  // Fallback check in Firestore (e.g. after server reload)
  try {
    const { getBookFromFirestore } = await import('@/lib/firebase/firestore');
    const firestoreBook = await getBookFromFirestore(id);
    if (firestoreBook) {
      const fbWithDetails = firestoreBook as unknown as BookWithDetails;
      // Re-populate runtime cache for subsequent requests
      const { addRuntimeBook } = await import('@/lib/services/runtime-store');
      addRuntimeBook(fbWithDetails);
      return fbWithDetails;
    }
  } catch {
    // Continue to Supabase if available
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('books')
      .select(
        `
        *,
        departments (name, code),
        semesters (number, name),
        book_images (storage_path, public_url, sort_order),
        seller:profiles!seller_id (id, full_name, student_id, verification_status)
      `
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as unknown as BookWithDetails;
  } catch {
    return null;
  }
}
