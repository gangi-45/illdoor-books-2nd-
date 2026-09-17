-- =============================================================================
-- Polytechnic Used Book Marketplace — Phase 1 Row Level Security
-- Migration 002: RLS policies for every table
-- =============================================================================
-- IMPORTANT: RLS is enabled on ALL tables. Never disable it.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enable RLS on all tables
-- ---------------------------------------------------------------------------

ALTER TABLE institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Helper function: get the current user's profile ID
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION auth.profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------------------------
-- Helper function: check if current user is admin
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------------------------
-- Helper function: check if current user is pickup operator or admin
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION auth.is_pickup_operator()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid()
    AND role IN ('admin', 'pickup_operator')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------------------------
-- Helper function: check if current user is verified
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION auth.is_verified()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid()
    AND verification_status = 'verified'
    AND account_status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------------------------
-- INSTITUTES — public read, admin write
-- ---------------------------------------------------------------------------

CREATE POLICY "institutes_read" ON institutes
  FOR SELECT USING (true);

CREATE POLICY "institutes_admin_all" ON institutes
  FOR ALL USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- DEPARTMENTS — public read, admin write
-- ---------------------------------------------------------------------------

CREATE POLICY "departments_read" ON departments
  FOR SELECT USING (true);

CREATE POLICY "departments_admin_all" ON departments
  FOR ALL USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- SEMESTERS — public read, admin write
-- ---------------------------------------------------------------------------

CREATE POLICY "semesters_read" ON semesters
  FOR SELECT USING (true);

CREATE POLICY "semesters_admin_all" ON semesters
  FOR ALL USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- SUBJECTS — public read, admin write
-- ---------------------------------------------------------------------------

CREATE POLICY "subjects_read" ON subjects
  FOR SELECT USING (true);

CREATE POLICY "subjects_admin_all" ON subjects
  FOR ALL USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- PROFILES — self read/update, admin all
-- ---------------------------------------------------------------------------

-- Users can read their own profile
CREATE POLICY "profiles_self_read" ON profiles
  FOR SELECT USING (auth_user_id = auth.uid());

-- Public can read basic profile info (for seller display on listings)
-- This is a broader SELECT that exposes only non-sensitive fields via views/queries
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile (non-admin fields only — role, status
-- changes are handled by admin via service role / server actions)
CREATE POLICY "profiles_self_update" ON profiles
  FOR UPDATE USING (auth_user_id = auth.uid())
  WITH CHECK (
    auth_user_id = auth.uid()
    -- Prevent users from changing their own role or status
    AND role = (SELECT role FROM profiles WHERE auth_user_id = auth.uid())
    AND account_status = (SELECT account_status FROM profiles WHERE auth_user_id = auth.uid())
    AND verification_status = (SELECT verification_status FROM profiles WHERE auth_user_id = auth.uid())
  );

-- Users can insert their own profile during registration
CREATE POLICY "profiles_self_insert" ON profiles
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());

-- Admin full access
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- BOOKS — public read for available, owner write, admin all
-- ---------------------------------------------------------------------------

-- Anyone can read available/reserved/sold listings (for marketplace display)
CREATE POLICY "books_public_read" ON books
  FOR SELECT USING (
    listing_status IN ('available', 'reserved', 'sold')
    OR seller_id = auth.profile_id()
    OR auth.is_admin()
  );

-- Only verified users can create listings
CREATE POLICY "books_verified_insert" ON books
  FOR INSERT WITH CHECK (
    seller_id = auth.profile_id()
    AND auth.is_verified()
  );

-- Owner can update their own listings
CREATE POLICY "books_owner_update" ON books
  FOR UPDATE USING (seller_id = auth.profile_id())
  WITH CHECK (seller_id = auth.profile_id());

-- Owner can delete (soft-delete via status change preferred)
CREATE POLICY "books_owner_delete" ON books
  FOR DELETE USING (seller_id = auth.profile_id());

-- Admin full access
CREATE POLICY "books_admin_all" ON books
  FOR ALL USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- BOOK_IMAGES — follows book ownership
-- ---------------------------------------------------------------------------

CREATE POLICY "book_images_public_read" ON book_images
  FOR SELECT USING (true);

CREATE POLICY "book_images_owner_insert" ON book_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM books
      WHERE books.id = book_id AND books.seller_id = auth.profile_id()
    )
  );

CREATE POLICY "book_images_owner_delete" ON book_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM books
      WHERE books.id = book_id AND books.seller_id = auth.profile_id()
    )
  );

CREATE POLICY "book_images_admin_all" ON book_images
  FOR ALL USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- WISHLISTS — owner only
-- ---------------------------------------------------------------------------

CREATE POLICY "wishlists_owner_read" ON wishlists
  FOR SELECT USING (user_id = auth.profile_id());

CREATE POLICY "wishlists_verified_insert" ON wishlists
  FOR INSERT WITH CHECK (
    user_id = auth.profile_id()
    AND auth.is_verified()
  );

CREATE POLICY "wishlists_owner_delete" ON wishlists
  FOR DELETE USING (user_id = auth.profile_id());

CREATE POLICY "wishlists_admin_all" ON wishlists
  FOR ALL USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- PICKUP_POINTS — public read, admin write
-- ---------------------------------------------------------------------------

CREATE POLICY "pickup_points_read" ON pickup_points
  FOR SELECT USING (true);

CREATE POLICY "pickup_points_admin_all" ON pickup_points
  FOR ALL USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- ORDERS — buyer/seller read their own, admin all
-- ---------------------------------------------------------------------------

CREATE POLICY "orders_participant_read" ON orders
  FOR SELECT USING (
    buyer_id = auth.profile_id()
    OR seller_id = auth.profile_id()
    OR auth.is_admin()
    OR auth.is_pickup_operator()
  );

-- Only verified users can create orders (server action does the actual insert
-- via service role for atomicity, but this is a defense-in-depth policy)
CREATE POLICY "orders_verified_insert" ON orders
  FOR INSERT WITH CHECK (
    buyer_id = auth.profile_id()
    AND auth.is_verified()
  );

-- Updates happen via server actions (service role), but participant can
-- update limited fields (e.g., payment_reference)
CREATE POLICY "orders_participant_update" ON orders
  FOR UPDATE USING (
    buyer_id = auth.profile_id()
    OR seller_id = auth.profile_id()
    OR auth.is_admin()
    OR auth.is_pickup_operator()
  );

-- Admin full access
CREATE POLICY "orders_admin_all" ON orders
  FOR ALL USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- PICKUP_EVENTS — order participants + operators
-- ---------------------------------------------------------------------------

CREATE POLICY "pickup_events_read" ON pickup_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id
      AND (orders.buyer_id = auth.profile_id()
           OR orders.seller_id = auth.profile_id())
    )
    OR auth.is_admin()
    OR auth.is_pickup_operator()
  );

CREATE POLICY "pickup_events_operator_insert" ON pickup_events
  FOR INSERT WITH CHECK (
    auth.is_pickup_operator() OR auth.is_admin()
    OR performed_by = auth.profile_id()
  );

CREATE POLICY "pickup_events_admin_all" ON pickup_events
  FOR ALL USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS — owner only
-- ---------------------------------------------------------------------------

CREATE POLICY "notifications_owner_read" ON notifications
  FOR SELECT USING (user_id = auth.profile_id());

CREATE POLICY "notifications_owner_update" ON notifications
  FOR UPDATE USING (user_id = auth.profile_id());

-- Notifications are created by server actions (service role)
-- No direct user insert policy needed

CREATE POLICY "notifications_admin_all" ON notifications
  FOR ALL USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- REVIEWS — public read, eligible participants write
-- ---------------------------------------------------------------------------

CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews_participant_insert" ON reviews
  FOR INSERT WITH CHECK (
    reviewer_id = auth.profile_id()
    AND auth.is_verified()
    AND EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id
      AND orders.order_status = 'completed'
      AND (orders.buyer_id = auth.profile_id() OR orders.seller_id = auth.profile_id())
    )
  );

CREATE POLICY "reviews_admin_all" ON reviews
  FOR ALL USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- REPORTS — reporter + admin
-- ---------------------------------------------------------------------------

CREATE POLICY "reports_reporter_read" ON reports
  FOR SELECT USING (
    reporter_id = auth.profile_id()
    OR auth.is_admin()
  );

CREATE POLICY "reports_verified_insert" ON reports
  FOR INSERT WITH CHECK (
    reporter_id = auth.profile_id()
    AND auth.is_verified()
  );

CREATE POLICY "reports_admin_update" ON reports
  FOR UPDATE USING (auth.is_admin());

CREATE POLICY "reports_admin_all" ON reports
  FOR ALL USING (auth.is_admin());

-- ---------------------------------------------------------------------------
-- SETTINGS — public read (non-sensitive), admin write
-- ---------------------------------------------------------------------------

CREATE POLICY "settings_public_read" ON settings
  FOR SELECT USING (true);

CREATE POLICY "settings_admin_all" ON settings
  FOR ALL USING (auth.is_admin());
