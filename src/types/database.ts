// =============================================================================
// Database Types — Polytechnic Used Book Marketplace
// Mirrors the Supabase PostgreSQL schema for Phase 1.
// =============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type AccountStatus = 'active' | 'warning' | 'restricted' | 'suspended';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type UserRole = 'user' | 'admin' | 'pickup_operator';

export type BookCondition = 'like_new' | 'good' | 'used' | 'heavily_used';

export type ListingStatus = 'available' | 'reserved' | 'sold' | 'inactive';

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'waiting_for_dropoff'
  | 'dropped_off'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'disputed';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'released';

export type NotificationType =
  | 'new_order'
  | 'payment_confirmed'
  | 'dropoff_reminder'
  | 'book_dropped_off'
  | 'book_ready_for_pickup'
  | 'order_completed'
  | 'new_review'
  | 'reservation_expiring'
  | 'system_notice';

export type ReportCategory =
  | 'fake_listing'
  | 'wrong_book'
  | 'condition_mismatch'
  | 'missing_pages'
  | 'damaged'
  | 'seller_issue'
  | 'buyer_issue'
  | 'other';

export type ReportStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export type PickupEventType =
  | 'dropoff_started'
  | 'dropoff_confirmed'
  | 'pickup_started'
  | 'pickup_confirmed';

// ---------------------------------------------------------------------------
// Table Row Types
// ---------------------------------------------------------------------------

export interface Institute {
  id: string;
  name: string;
  code: string;
  address: string | null;
  active: boolean;
  created_at: string;
}

export interface Department {
  id: string;
  institute_id: string;
  name: string;
  code: string;
  active: boolean;
  created_at: string;
}

export interface Semester {
  id: string;
  number: number;
  name: string;
  active: boolean;
  created_at: string;
}

export interface Subject {
  id: string;
  department_id: string;
  semester_id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Profile {
  id: string;
  auth_user_id: string;
  full_name: string;
  student_id: string;
  institute_id: string;
  department_id: string;
  semester_id: string;
  phone: string;
  email: string;
  avatar_url: string | null;
  id_card_url: string | null;
  account_status: AccountStatus;
  verification_status: VerificationStatus;
  verification_rejection_reason: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  seller_id: string;
  title: string;
  author: string | null;
  subject_code: string;
  subject_id: string | null;
  department_id: string;
  semester_id: string;
  description: string | null;
  edition: string | null;
  condition: BookCondition;
  writing_inside: boolean;
  highlighting: boolean;
  missing_pages: boolean;
  cover_damage: boolean;
  page_damage: boolean;
  original_price: number;
  selling_price: number;
  listing_status: ListingStatus;
  created_at: string;
  updated_at: string;
}

export interface BookImage {
  id: string;
  book_id: string;
  storage_path: string;
  public_url: string;
  sort_order: number;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  book_id: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  book_id: string;
  pickup_point_id: string;
  item_price: number;
  platform_fee: number;
  seller_payout: number;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  order_status: OrderStatus;
  reservation_expires_at: string;
  pickup_pin_hash: string | null;
  pickup_pin_attempts: number;
  pickup_pin_locked_until: string | null;
  pickup_pin_expires_at: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface PickupPoint {
  id: string;
  institute_id: string;
  name: string;
  location_description: string | null;
  opening_time: string | null;
  closing_time: string | null;
  phone: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PickupEvent {
  id: string;
  order_id: string;
  event_type: PickupEventType;
  performed_by: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_order_id: string | null;
  related_book_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  category: ReportCategory;
  description: string;
  evidence_url: string | null;
  related_book_id: string | null;
  related_order_id: string | null;
  status: ReportStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Insert / Update Types (omit server-generated fields)
// ---------------------------------------------------------------------------

export type InsertProfile = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProfile = Partial<Omit<Profile, 'id' | 'auth_user_id' | 'created_at'>>;

export type InsertBook = Omit<Book, 'id' | 'created_at' | 'updated_at'>;
export type UpdateBook = Partial<Omit<Book, 'id' | 'seller_id' | 'created_at'>>;

export type InsertBookImage = Omit<BookImage, 'id' | 'created_at'>;

export type InsertWishlist = Omit<Wishlist, 'id' | 'created_at'>;

export type InsertOrder = Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'completed_at'>;
export type UpdateOrder = Partial<Omit<Order, 'id' | 'order_number' | 'buyer_id' | 'seller_id' | 'book_id' | 'created_at'>>;

export type InsertNotification = Omit<Notification, 'id' | 'read_at' | 'created_at'>;

export type InsertReview = Omit<Review, 'id' | 'created_at'>;

export type InsertReport = Omit<Report, 'id' | 'admin_notes' | 'created_at' | 'updated_at'>;
export type UpdateReport = Partial<Pick<Report, 'status' | 'admin_notes'>>;

// ---------------------------------------------------------------------------
// Joined / View Types (for UI convenience)
// ---------------------------------------------------------------------------

export interface BookWithImages extends Book {
  images: BookImage[];
}

export interface BookWithDetails extends BookWithImages {
  seller: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'verification_status'>;
  department: Pick<Department, 'id' | 'name'>;
  semester: Pick<Semester, 'id' | 'name' | 'number'>;
  subject?: Pick<Subject, 'id' | 'name' | 'code'> | null;
}

export interface OrderWithDetails extends Order {
  book: Pick<Book, 'id' | 'title' | 'selling_price' | 'listing_status'> & {
    images: Pick<BookImage, 'public_url' | 'sort_order'>[];
  };
  buyer: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
  seller: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
  pickup_point: Pick<PickupPoint, 'id' | 'name' | 'location_description'>;
}

export interface NotificationWithRelations extends Notification {
  book?: Pick<Book, 'id' | 'title'> | null;
  order?: Pick<Order, 'id' | 'order_number'> | null;
}
