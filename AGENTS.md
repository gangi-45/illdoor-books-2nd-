# Polytechnic Used Book Marketplace — Agent Instructions

## Architecture

- **Framework**: Next.js 16+ with App Router, TypeScript, Tailwind CSS v4
- **UI Library**: shadcn/ui (Radix primitives), Lucide icons
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Validation**: Zod schemas shared between client and server
- **Hosting**: Vercel
- **Payment**: Abstracted via `PaymentProvider` interface — Phase 1 uses `ManualPaymentProvider`

## Folder Structure

```
src/
  app/                    # Next.js App Router pages and layouts
    (auth)/               # Auth pages (login, register)
    (main)/               # Protected main app pages
    (admin)/              # Admin panel pages
    api/                  # Route handlers and cron endpoints
  components/
    ui/                   # shadcn/ui base components
    marketplace/          # BookCard, PriceDisplay, ConditionBadge, etc.
    admin/                # Admin-specific components
    shared/               # EmptyState, LoadingSkeleton, StatusBadge, etc.
  lib/
    supabase/             # Supabase client (browser, server, middleware)
    actions/              # Server Actions (auth, books, orders, etc.)
    validations/          # Zod schemas
    services/             # Payment provider abstraction
    constants.ts          # Labels, defaults, settings keys
    utils.ts              # cn() and shared utilities
  hooks/                  # Custom React hooks
  types/                  # TypeScript type definitions
    database.ts           # Types mirroring the DB schema
supabase/
  migrations/             # SQL migration files (version-controlled)
  seed.sql                # Development seed data
```

## Coding Standards

1. **TypeScript**: Strict mode. Avoid `any`. Prefer explicit types.
2. **Components**: Keep UI components free of business logic. Use Server Actions for mutations.
3. **Validation**: Zod on client (UX) AND server (integrity). Server is the one that matters.
4. **Database**: All access through reusable server-side modules. Never query DB from client components.
5. **Security**: RLS on every table. Server-side authorization on top of RLS. Never disable RLS.
6. **Naming**: camelCase for functions/variables, PascalCase for components/types, snake_case for DB columns.
7. **Imports**: Use `@/` path alias (maps to `src/`).

## Database Rules

- Foreign keys, unique constraints, check constraints on all tables
- Indexes on frequently queried columns
- `updated_at` auto-managed by triggers
- No duplicate wishlist rows, no duplicate reviews per order/reviewer
- Transactional locking for book reservation (prevent double-booking)
- Settings table for runtime-configurable values (fee %, deadlines, etc.)

## Security Rules

- RLS enabled on ALL tables — helper functions: `auth.profile_id()`, `auth.is_admin()`, `auth.is_verified()`
- Unverified users CANNOT: create listings, place orders, leave reviews (enforced server-side)
- Admin routes protected by role check in middleware + layout
- PIN verification: hashed at rest, 5-attempt lockout, expiry
- No secrets in client code; service role key server-only

## Phase 1 / Phase 2 Boundary

### Phase 1 (Current — Build This)
Auth, verification, marketplace browse/search/filter, listings, images, orders,
manual payment, reservation expiry, pickup PIN with brute-force protection,
notifications, reviews, basic reporting, admin panel (10 routes), settings.

### Phase 2+ (DO NOT BUILD YET)
Book requests, full disputes, real payment gateway, user reputation stats,
audit logs, real-time chat, bundle sales, multiple institutes, full bilingual UI,
"most viewed" sorting.

## Current Status

Phase 1 in progress. Foundation, schema, RLS, types, validations, Supabase
clients, middleware, payment abstraction, and seed data are complete.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
