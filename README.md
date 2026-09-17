# Polytechnic Used Book Marketplace (PolyBooks)

A verified, institute-based peer-to-peer textbook marketplace for Polytechnic students in Bangladesh. Students buy and sell used academic textbooks within their campus. Physical exchange happens safely at designated campus pickup/drop-off counters using 6-digit PIN verification.

---

## Key Features (Phase 1 MVP)

1. **Student Account & Verification Gate (Patched)**:
   - Single unified account for buying and selling.
   - Student ID card upload to private Supabase Storage (`student-ids`).
   - Admin verification queue. Unverified accounts can browse but are server-blocked from listing, ordering, or reviewing.
2. **Campus Marketplace Browse, Search & Filter**:
   - Search by book title, author, or BTEB subject code (e.g. `26811`).
   - Filter by technology/department, semester (1st–8th), book condition, and price range.
   - Sort by newest, lowest price, and highest price.
3. **Condition Assessment & Photo Upload**:
   - Fixed condition levels: *Like New*, *Good*, *Used*, *Heavily Used*.
   - Detail inspection checklist: writing inside, highlighting, torn/missing pages, cover damage, water stains.
   - Up to 5 photos per listing stored in `book-images` bucket.
4. **Order System & Double-Booking Prevention**:
   - Atomic conditional update prevents simultaneous purchase race conditions.
   - Human-readable order numbers (e.g. `PX1048`).
5. **Reservation Expiry (Patched)**:
   - 30-minute reservation timeout window on order creation.
   - Automatic release back to marketplace via lazy checks on read and scheduled cron endpoint (`/api/cron/reservation-expiry`).
6. **Manual Payment Flow (bKash & Nagad)**:
   - No merchant account required. Buyer sends money to platform number and submits Transaction ID (`payment_reference`).
   - Admin verifies statement and confirms payment.
7. **Campus Counter Drop-off & PIN Pickup (Patched)**:
   - Handoff at official campus counter (Mymensingh Polytechnic Institute Gate 1).
   - 6-digit PIN hashed with SHA-256 at rest.
   - Brute-force protection: locks for 15 minutes after 5 failed attempts.
8. **Reviews & Incident Reports**:
   - Post-completion reviews (1–5 stars) between buyer and seller with duplicate prevention.
   - User report inbox for condition mismatches or missed handoffs.
9. **Comprehensive Admin Console (`/admin`)**:
   - Real calculated metrics: users, verified students, active listings, orders today, pending drop-offs, pickups, and open reports.
   - Full management of student verification, book visibility, order payments, pickup points, academic curricula, and platform settings.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Server Actions)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS, Lucide Icons, shadcn/ui components
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage, Row Level Security)
- **Validation**: Zod (Client UX & Server Integrity)

---

## Getting Started

### 1. Prerequisites

- Node.js 20+ installed
- npm or yarn

### 2. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your-cron-secret-here
```

### 3. Database & RLS Setup

Run the SQL migrations in order in your Supabase SQL Editor:

1. `supabase/migrations/001_schema.sql` — Creates tables, enums, constraints, triggers, and indexes.
2. `supabase/migrations/002_rls.sql` — Configures Row Level Security (RLS) policies for all tables.
3. `supabase/seed.sql` — Seeds Mymensingh Polytechnic Institute (MPI), departments, semesters 1–8, standard BTEB subjects, pickup points, and platform settings.

### 4. Storage Buckets Setup

In your Supabase Storage dashboard, create two buckets:
- `student-ids` — **Private** (admin-only read, student ID verification cards)
- `book-images` — **Public** (publicly viewable book photos)

### 5. Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 6. Running Tests & Production Build

Run the business logic unit tests:
```bash
node --test tests/business-logic.test.mjs
```

Verify the production build:
```bash
npm run build
```

---

## Seeded Academic Reference Data (MPI)

- **Institute**: Mymensingh Polytechnic Institute (`MPI`)
- **Departments**:
  - Computer Technology (`CT`)
  - Electronics Technology (`ET`)
  - Electrical Technology (`EL`)
  - Civil Technology (`CV`)
  - Mechanical Technology (`ME`)
- **Semesters**: 1st through 8th Semester
- **Campus Pickup Counter**: Central Campus Student Counter (Gate 1)
