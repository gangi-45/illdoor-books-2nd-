import { z } from 'zod';

// =============================================================================
// Shared Validation Schemas — Polytechnic Used Book Marketplace
// Used on BOTH client (UX feedback) and server (integrity enforcement).
// Server-side is the one that actually matters for security.
// =============================================================================

// ---------------------------------------------------------------------------
// Auth / Registration
// ---------------------------------------------------------------------------

export const registerSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long'),
  student_id: z
    .string()
    .min(1, 'Student ID is required')
    .max(50, 'Student ID is too long'),
  institute_id: z.string().min(1, 'Please select an institute'),
  department_id: z.string().min(1, 'Please select a department'),
  semester_id: z.string().min(1, 'Please select a semester'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[\d+\-() ]+$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Profile Update
// ---------------------------------------------------------------------------

export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100)
    .optional(),
  phone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^[\d+\-() ]+$/, 'Invalid phone number')
    .optional(),
  semester_id: z.string().uuid().optional(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// ---------------------------------------------------------------------------
// Book Listing
// ---------------------------------------------------------------------------

export const bookListingSchema = z.object({
  title: z
    .string()
    .min(2, 'Book name must be at least 2 characters')
    .max(200, 'Book name is too long'),
  author: z.string().max(100).optional().nullable(),
  subject_code: z
    .string()
    .min(1, 'Subject code is required')
    .max(20, 'Subject code is too long'),
  department_id: z.string().uuid('Please select a department'),
  semester_id: z.string().uuid('Please select a semester'),
  description: z.string().max(2000, 'Description is too long').optional().nullable(),
  edition: z.string().max(50).optional().nullable(),
  condition: z.enum(['like_new', 'good', 'used', 'heavily_used'], {
    message: 'Please select a condition',
  }),
  writing_inside: z.boolean().default(false),
  highlighting: z.boolean().default(false),
  missing_pages: z.boolean().default(false),
  cover_damage: z.boolean().default(false),
  page_damage: z.boolean().default(false),
  original_price: z
    .number({ message: 'Original price is required' })
    .positive('Price must be positive')
    .max(50000, 'Price seems unreasonably high'),
  selling_price: z
    .number({ message: 'Selling price is required' })
    .positive('Price must be positive')
    .max(50000, 'Price seems unreasonably high'),
}).refine(
  (data) => data.selling_price <= data.original_price * 1.5,
  {
    message: 'Selling price should not exceed 150% of original price',
    path: ['selling_price'],
  }
);

export type BookListingFormData = z.infer<typeof bookListingSchema>;

// ---------------------------------------------------------------------------
// Order Creation
// ---------------------------------------------------------------------------

export const createOrderSchema = z.object({
  book_id: z.string().uuid('Invalid book ID'),
  pickup_point_id: z.string().uuid('Please select a pickup point'),
});

export type CreateOrderFormData = z.infer<typeof createOrderSchema>;

// ---------------------------------------------------------------------------
// Payment Reference (Manual Payment Flow)
// ---------------------------------------------------------------------------

export const paymentReferenceSchema = z.object({
  payment_reference: z
    .string()
    .min(4, 'Transaction ID must be at least 4 characters')
    .max(50, 'Transaction ID is too long'),
});

export type PaymentReferenceFormData = z.infer<typeof paymentReferenceSchema>;

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

export const reviewSchema = z.object({
  order_id: z.string().uuid(),
  reviewee_id: z.string().uuid(),
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000, 'Comment is too long').optional().nullable(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

export const reportSchema = z.object({
  category: z.enum([
    'fake_listing',
    'wrong_book',
    'condition_mismatch',
    'missing_pages',
    'damaged',
    'seller_issue',
    'buyer_issue',
    'other',
  ], { message: 'Please select a category' }),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description is too long'),
  related_book_id: z.string().uuid().optional().nullable(),
  related_order_id: z.string().uuid().optional().nullable(),
});

export type ReportFormData = z.infer<typeof reportSchema>;

// ---------------------------------------------------------------------------
// Admin Settings
// ---------------------------------------------------------------------------

export const settingUpdateSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1, 'Value is required'),
});

export type SettingUpdateFormData = z.infer<typeof settingUpdateSchema>;

// ---------------------------------------------------------------------------
// PIN Verification
// ---------------------------------------------------------------------------

export const pinVerifySchema = z.object({
  order_id: z.string().uuid(),
  pin: z
    .string()
    .length(6, 'PIN must be exactly 6 digits')
    .regex(/^\d{6}$/, 'PIN must contain only digits'),
});

export type PinVerifyFormData = z.infer<typeof pinVerifySchema>;
