-- =============================================================================
-- Polytechnic Used Book Marketplace — Phase 1 Database Schema
-- Migration 001: Core tables, enums, constraints, indexes
-- =============================================================================
-- Run this in the Supabase SQL Editor or via Supabase CLI migrations.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Custom Enum Types
-- ---------------------------------------------------------------------------

CREATE TYPE account_status AS ENUM ('active', 'warning', 'restricted', 'suspended');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'pickup_operator');
CREATE TYPE book_condition AS ENUM ('like_new', 'good', 'used', 'heavily_used');
CREATE TYPE listing_status AS ENUM ('available', 'reserved', 'sold', 'inactive');
CREATE TYPE order_status AS ENUM (
  'pending_payment', 'paid', 'waiting_for_dropoff', 'dropped_off',
  'ready_for_pickup', 'picked_up', 'completed', 'cancelled', 'expired', 'disputed'
);
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'released');
CREATE TYPE notification_type AS ENUM (
  'new_order', 'payment_confirmed', 'dropoff_reminder', 'book_dropped_off',
  'book_ready_for_pickup', 'order_completed', 'new_review',
  'reservation_expiring', 'system_notice'
);
CREATE TYPE report_category AS ENUM (
  'fake_listing', 'wrong_book', 'condition_mismatch', 'missing_pages',
  'damaged', 'seller_issue', 'buyer_issue', 'other'
);
CREATE TYPE report_status AS ENUM ('open', 'investigating', 'resolved', 'dismissed');
CREATE TYPE pickup_event_type AS ENUM (
  'dropoff_started', 'dropoff_confirmed', 'pickup_started', 'pickup_confirmed'
);

-- ---------------------------------------------------------------------------
-- Reference / Seed Data Tables
-- ---------------------------------------------------------------------------

CREATE TABLE institutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (institute_id, code)
);

CREATE TABLE semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INT NOT NULL UNIQUE CHECK (number >= 1 AND number <= 8),
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (department_id, code)
);

-- ---------------------------------------------------------------------------
-- User Profiles
-- ---------------------------------------------------------------------------

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (char_length(full_name) >= 2),
  student_id TEXT NOT NULL,
  institute_id UUID NOT NULL REFERENCES institutes(id),
  department_id UUID NOT NULL REFERENCES departments(id),
  semester_id UUID NOT NULL REFERENCES semesters(id),
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  id_card_url TEXT,                                     -- private bucket path
  account_status account_status NOT NULL DEFAULT 'active',
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  verification_rejection_reason TEXT,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_auth_user ON profiles(auth_user_id);
CREATE INDEX idx_profiles_institute ON profiles(institute_id);
CREATE INDEX idx_profiles_verification ON profiles(verification_status);

-- ---------------------------------------------------------------------------
-- Books (Listings)
-- ---------------------------------------------------------------------------

CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) >= 2),
  author TEXT,
  subject_code TEXT NOT NULL,
  subject_id UUID REFERENCES subjects(id),
  department_id UUID NOT NULL REFERENCES departments(id),
  semester_id UUID NOT NULL REFERENCES semesters(id),
  description TEXT,
  edition TEXT,
  condition book_condition NOT NULL,
  writing_inside BOOLEAN NOT NULL DEFAULT false,
  highlighting BOOLEAN NOT NULL DEFAULT false,
  missing_pages BOOLEAN NOT NULL DEFAULT false,
  cover_damage BOOLEAN NOT NULL DEFAULT false,
  page_damage BOOLEAN NOT NULL DEFAULT false,
  original_price NUMERIC(10,2) NOT NULL CHECK (original_price > 0),
  selling_price NUMERIC(10,2) NOT NULL CHECK (selling_price > 0),
  listing_status listing_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_books_seller ON books(seller_id);
CREATE INDEX idx_books_status ON books(listing_status);
CREATE INDEX idx_books_department ON books(department_id);
CREATE INDEX idx_books_semester ON books(semester_id);
CREATE INDEX idx_books_subject_code ON books(subject_code);
CREATE INDEX idx_books_title ON books USING gin(to_tsvector('english', title));
CREATE INDEX idx_books_created ON books(created_at DESC);

-- ---------------------------------------------------------------------------
-- Book Images
-- ---------------------------------------------------------------------------

CREATE TABLE book_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_book_images_book ON book_images(book_id);

-- ---------------------------------------------------------------------------
-- Wishlists
-- ---------------------------------------------------------------------------

CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id)
);

CREATE INDEX idx_wishlists_user ON wishlists(user_id);

-- ---------------------------------------------------------------------------
-- Pickup Points
-- ---------------------------------------------------------------------------

CREATE TABLE pickup_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location_description TEXT,
  opening_time TIME,
  closing_time TIME,
  phone TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

-- Sequence for human-readable order numbers (PX1001, PX1002, ...)
CREATE SEQUENCE order_number_seq START WITH 1001;

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT 'PX' || nextval('order_number_seq')::TEXT,
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  book_id UUID NOT NULL REFERENCES books(id),
  pickup_point_id UUID NOT NULL REFERENCES pickup_points(id),
  item_price NUMERIC(10,2) NOT NULL CHECK (item_price > 0),
  platform_fee NUMERIC(10,2) NOT NULL CHECK (platform_fee >= 0),
  seller_payout NUMERIC(10,2) NOT NULL CHECK (seller_payout >= 0),
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  order_status order_status NOT NULL DEFAULT 'pending_payment',
  reservation_expires_at TIMESTAMPTZ NOT NULL,
  pickup_pin_hash TEXT,
  pickup_pin_attempts INT NOT NULL DEFAULT 0,
  pickup_pin_locked_until TIMESTAMPTZ,
  pickup_pin_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  -- A buyer cannot buy their own book
  CHECK (buyer_id != seller_id)
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_book ON orders(book_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_reservation_expiry ON orders(reservation_expires_at)
  WHERE order_status = 'pending_payment';

-- ---------------------------------------------------------------------------
-- Pickup Events
-- ---------------------------------------------------------------------------

CREATE TABLE pickup_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type pickup_event_type NOT NULL,
  performed_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);

CREATE INDEX idx_pickup_events_order ON pickup_events(order_id);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  related_book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC)
  WHERE read_at IS NULL;

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  reviewee_id UUID NOT NULL REFERENCES profiles(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One review per reviewer per order
  UNIQUE (order_id, reviewer_id),
  -- No self-reviews
  CHECK (reviewer_id != reviewee_id)
);

CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);

-- ---------------------------------------------------------------------------
-- Reports
-- ---------------------------------------------------------------------------

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  category report_category NOT NULL,
  description TEXT NOT NULL CHECK (char_length(description) >= 10),
  evidence_url TEXT,
  related_book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status report_status NOT NULL DEFAULT 'open',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status ON reports(status);

-- ---------------------------------------------------------------------------
-- Settings (key-value configuration store)
-- ---------------------------------------------------------------------------

CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Updated-at trigger function
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_pickup_points_updated_at BEFORE UPDATE ON pickup_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
