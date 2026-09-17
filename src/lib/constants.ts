// =============================================================================
// Application Constants — Polytechnic Used Book Marketplace
// Business values that are NOT configurable at runtime live here.
// Configurable values (fee %, reservation minutes, etc.) live in the
// `settings` DB table and are fetched server-side.
// =============================================================================

/** Human-readable condition labels */
export const CONDITION_LABELS: Record<string, string> = {
  like_new: 'Like New',
  good: 'Good',
  used: 'Used',
  heavily_used: 'Heavily Used',
} as const;

/** Human-readable order status labels */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pending Payment',
  paid: 'Paid',
  waiting_for_dropoff: 'Waiting for Drop-off',
  dropped_off: 'Dropped Off',
  ready_for_pickup: 'Ready for Pickup',
  picked_up: 'Picked Up',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
  disputed: 'Disputed',
} as const;

/** Human-readable payment status labels */
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
  released: 'Released',
} as const;

/** Human-readable verification status labels */
export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  unverified: 'Unverified',
  pending: 'Pending Verification',
  verified: 'Verified',
  rejected: 'Rejected',
} as const;

/** Human-readable account status labels */
export const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  warning: 'Warning',
  restricted: 'Restricted',
  suspended: 'Suspended',
} as const;

/** Report category labels */
export const REPORT_CATEGORY_LABELS: Record<string, string> = {
  fake_listing: 'Fake Listing',
  wrong_book: 'Wrong Book',
  condition_mismatch: 'Condition Mismatch',
  missing_pages: 'Missing Pages',
  damaged: 'Damaged Book',
  seller_issue: 'Seller Issue',
  buyer_issue: 'Buyer Issue',
  other: 'Other',
} as const;

/** Order number prefix for human-readable IDs */
export const ORDER_NUMBER_PREFIX = 'PX';

/** Currency symbol (Bangladeshi Taka) */
export const CURRENCY_SYMBOL = '৳';

/** Maximum number of images per book listing (also in settings table) */
export const DEFAULT_MAX_IMAGES = 5;

/** Maximum file size in bytes (5 MB — also in settings table) */
export const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Accepted image MIME types */
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

/** Default reservation expiry in minutes (also in settings table) */
export const DEFAULT_RESERVATION_MINUTES = 30;

/** Default platform fee percentage (also in settings table) */
export const DEFAULT_PLATFORM_FEE_PERCENT = 5;

/** PIN brute-force protection constants */
export const PIN_MAX_ATTEMPTS = 5;
export const PIN_LOCKOUT_MINUTES = 15;
export const PIN_LENGTH = 6;

/** Pagination defaults */
export const DEFAULT_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 20;

/** Sorting options for marketplace browse */
export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Lowest Price' },
  { value: 'price_high', label: 'Highest Price' },
] as const;

/** Settings keys — canonical names for the settings table */
export const SETTINGS_KEYS = {
  PLATFORM_FEE_PERCENT: 'platform_fee_percent',
  RESERVATION_EXPIRY_MINUTES: 'reservation_expiry_minutes',
  DROPOFF_DEADLINE_HOURS: 'dropoff_deadline_hours',
  MAX_IMAGE_COUNT: 'max_image_count',
  MAX_IMAGE_SIZE_MB: 'max_image_size_mb',
  CONTACT_EMAIL: 'contact_email',
  CONTACT_PHONE: 'contact_phone',
  BKASH_NUMBER: 'bkash_number',
  NAGAD_NUMBER: 'nagad_number',
} as const;
