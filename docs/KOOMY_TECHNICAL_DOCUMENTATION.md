# Koomy - Technical Documentation

## Product Overview

**Koomy** is a multi-tenant SaaS platform designed for community management (unions, clubs, associations). The platform provides digital tools for member management, communication, and administrative operations.

### Target Users
- **Associations & Clubs** - Sports clubs, hobby groups, cultural associations
- **Unions & Syndicates** - Professional unions, worker organizations
- **Non-Profit Organizations** - Charitable organizations, volunteer groups

---

## Architecture

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS, Wouter (routing) |
| State Management | TanStack React Query |
| Backend | Express.js, Node.js |
| Database | PostgreSQL (Neon) |
| ORM | Drizzle ORM |
| Validation | Zod |
| UI Components | Radix UI, shadcn/ui |
| Internationalization | react-i18next |

### Multi-Tenant Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     KOOMY PLATFORM                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Community A │  │ Community B │  │ Community C │  ...    │
│  │  (Tenant)   │  │  (Tenant)   │  │  (Tenant)   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                   Shared Database                           │
│            (Data isolated by community_id)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Design System (Koomy Identity)

### Brand Colors

| Color | Hex | HSL | Usage |
|-------|-----|-----|-------|
| Primary (Sky Blue) | `#44A8FF` | 207 100% 63% | Main brand color, buttons, links |
| Primary Light | `#5AB8FF` | - | Hover states |
| Primary Dark | `#2B9AFF` | - | Active states |
| Background Soft | `#E8F4FF` | - | Page backgrounds |

### Typography

- **Primary Font**: Nunito (rounded, friendly)
- **Fallback**: Inter, sans-serif

### Design Principles

- Soft, rounded corners (16-20px radius)
- Subtle gradients and glows
- Clean white cards with soft shadows
- Accessible, modern, friendly aesthetic

### CSS Utility Classes

| Class | Purpose |
|-------|---------|
| `.koomy-gradient` | Primary gradient background |
| `.koomy-glow` | Soft blue glow effect |
| `.koomy-card` | White card with soft shadow |
| `.koomy-btn` | Primary button style |

---

## Internationalization (i18n)

### Supported Languages

| Language | Code | Default |
|----------|------|---------|
| French | `fr` | Yes |
| English | `en` | No |

### Implementation

- **Library**: react-i18next
- **Translation Files**: `client/src/i18n/locales/{lang}.json`
- **Language Switcher**: Located in public website header (globe icon)
- **State Management**: Language stored in memory (no URL prefix)

### Translated Sections

| Section | Coverage |
|---------|----------|
| Navigation | Full |
| Home Page | Full |
| Pricing Page | Full (including plan names/descriptions/features) |
| Contact Page | Full |
| FAQ Page | Full |
| Login Modal | Full |
| Footer | Full |

### Translation Key Structure

```json
{
  "nav": { ... },
  "login": { ... },
  "home": { "hero": {...}, "features": {...}, ... },
  "pricing": { "plans": { "PLAN_CODE": { "name", "description", "features" } }, ... },
  "contact": { ... },
  "faq": { ... },
  "footer": { ... }
}
```

---

## User Roles & Permissions

### Platform Level (SaaS Owner)

| Role | Global Role Value | Permissions |
|------|-------------------|-------------|
| **Platform Super Admin** | `platform_super_admin` | Full platform access, manage all tenants, grant VIP access |
| **Platform Support** | `platform_support` | View/manage support tickets, limited tenant access |

### Community Level (Tenant)

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full community access, manage other admins |
| **Admin** | Manage members, content, events |
| **Delegate** | Mobile admin app, QR scanner, messaging |
| **Member** | Mobile app access, view content, messaging |

---

## Authentication Model (Three-Tier System)

### 1. Accounts Table (Mobile App Users)

- Public Koomy users who access the mobile app
- Email/password authentication with bcrypt hashing
- Can be members of multiple communities

### 2. Users Table (Back-Office Admins)

- Community administrators
- Login via `/api/admin/login`
- Can have `globalRole` for platform-level access

### 3. Membership Claiming System

- Admins create member cards with auto-generated 8-character `claimCode`
- Users claim membership by entering the code in the mobile app
- Links account to community membership

### Authentication Routes

| Portal | Endpoint | Returns |
|--------|----------|---------|
| Mobile App | `/api/accounts/register` | Account + memberships |
| Mobile App | `/api/accounts/login` | Account + memberships |
| Mobile App | `/api/memberships/claim` | Claimed membership |
| Web Admin | `/api/admin/login` | User + memberships |
| Platform Admin | `/api/platform/login` | User with globalRole |

### Demo Credentials

| Portal | Email | Password |
|--------|-------|----------|
| Platform Admin | `platform@koomy.app` | `Admin2025!` |
| Community Admin | `admin@koomy.app` | `Admin2025!` |

---

## Application Portals

### 1. Commercial Public Website (`/website`)

**Purpose:** Marketing and user acquisition (bilingual FR/EN)

| Page | Route | Description |
|------|-------|-------------|
| Home | `/website` | Landing page with hero, features, CTA |
| Pricing | `/website/pricing` | Subscription plans comparison |
| FAQ | `/website/faq` | Frequently asked questions |
| Contact | `/website/contact` | Contact form with request types |
| Signup | `/website/signup` | New organization registration |

**Key Components:**
- Language switcher (FR/EN toggle in header)
- Login popup modal (accessible from header)
- Feature showcase cards
- Pricing tier comparison with translated plan content
- Mobile app download CTAs
- Responsive navigation

### 2. Mobile Member App (`/app`)

**Purpose:** Member-facing mobile application

| Screen | Route | Description |
|--------|-------|-------------|
| Login | `/app/login` | Email/password authentication |
| Community Hub | `/app/hub` | List of user's communities |
| Home | `/app/:communityId/home` | Community dashboard |
| Membership Card | `/app/:communityId/card` | Digital QR code card |
| News Feed | `/app/:communityId/news` | Community articles |
| Messages | `/app/:communityId/messages` | Member-admin messaging |
| Profile | `/app/:communityId/profile` | User profile management |
| Payment | `/app/:communityId/payment` | Contribution payments |
| Support | `/app/:communityId/support` | Help & FAQs |

### 3. Mobile Admin/Delegate App (`/app/:communityId/admin`)

**Purpose:** Field administrators and delegates

| Screen | Route | Description |
|--------|-------|-------------|
| Admin Home | `/app/:communityId/admin` | Admin dashboard |
| QR Scanner | `/app/:communityId/admin/scanner` | Member verification |
| Messages | `/app/:communityId/admin/messages` | Member communications |

### 4. Web Admin Back-Office (`/admin`)

**Purpose:** Full administrative control for organization managers

| Screen | Route | Description |
|--------|-------|-------------|
| Dashboard | `/admin/dashboard` | Overview metrics & KPIs |
| Members | `/admin/members` | Member database management |
| Member Details | `/admin/members/:id` | Individual member profile |
| News | `/admin/news` | Create/manage articles |
| Events | `/admin/events` | Event management |
| Event Details | `/admin/events/:id` | Single event view |
| Messages | `/admin/messages` | Communication center |
| Admins | `/admin/admins` | Admin role management |
| Sections | `/admin/sections` | Regional/local divisions |
| Payments | `/admin/payments` | Payment & contribution management |
| Support | `/admin/support` | Ticket management |

### 5. SaaS Owner Portal (`/platform`)

**Purpose:** Platform-wide management for Koomy operators

| Screen | Route | Description |
|--------|-------|-------------|
| Super Dashboard | `/platform/dashboard` | Platform metrics, MRR, clients |

**Key Features:**
- MRR (Monthly Recurring Revenue) tracking
- Client (tenant) overview with subscription status
- VIP badge for communities with full access
- "Offrir" button to grant/revoke full access
- Platform admin management

---

## Subscription Plans

### Plan Codes & Pricing

| Code | Name | Max Members | Monthly | Yearly | Target |
|------|------|-------------|---------|--------|--------|
| `STARTER_FREE` | Free Starter | 50 | €0 | €0 | Small clubs starting out |
| `COMMUNAUTE_STANDARD` | Communauté Standard | 1,000 | €9.90 | €99 | Growing associations |
| `COMMUNAUTE_PRO` | Communauté Pro | 5,000 | €29 | €290 | Large organizations |
| `ENTREPRISE_CUSTOM` | Grand Compte | Unlimited | Custom | Custom | Federations |
| `WHITE_LABEL` | White Label | Unlimited | - | €4,900 | Branded platform |

### Plan Features

| Feature | Starter | Standard | Pro | Enterprise | White Label |
|---------|---------|----------|-----|------------|-------------|
| Digital membership cards | ✓ | ✓ | ✓ | ✓ | ✓ |
| News feed | ✓ | ✓ | ✓ | ✓ | ✓ |
| Basic events | ✓ | ✓ | ✓ | ✓ | ✓ |
| Email support | ✓ | ✓ | ✓ | ✓ | ✓ |
| QR code cards | - | ✓ | ✓ | ✓ | ✓ |
| Dues management | - | ✓ | ✓ | ✓ | ✓ |
| Member-admin messaging | - | ✓ | ✓ | ✓ | ✓ |
| Priority support | - | ✓ | ✓ | ✓ | ✓ |
| Multi-admin with roles | - | - | ✓ | ✓ | ✓ |
| Unlimited sections | - | - | ✓ | ✓ | ✓ |
| Advanced analytics | - | - | ✓ | ✓ | ✓ |
| API integrations | - | - | ✓ | ✓ | ✓ |
| 24/7 support | - | - | ✓ | ✓ | ✓ |
| Dedicated success manager | - | - | - | ✓ | ✓ |
| Custom integrations | - | - | - | ✓ | ✓ |
| Guaranteed SLA | - | - | - | ✓ | ✓ |
| Custom branding | - | - | - | - | ✓ |
| Custom domain | - | - | - | - | ✓ |

### Member Quota Enforcement

- `storage.createMembership()` checks plan limits before creating new members
- `storage.changeCommunityPlan()` prevents downgrade when member count exceeds new plan limit
- API route `GET /api/communities/:id/quota` returns current usage vs limit

---

## Full Access VIP System (Platform Admin Only)

Allows SaaS owner to grant free unlimited access to specific communities for promotional/VIP purposes.

### Database Fields (Communities Table)

| Column | Type | Description |
|--------|------|-------------|
| `fullAccessGrantedAt` | TIMESTAMP | When access was granted |
| `fullAccessExpiresAt` | TIMESTAMP | When access expires (null = forever) |
| `fullAccessReason` | TEXT | Reason for granting |
| `fullAccessGrantedBy` | VARCHAR FK | Admin who granted access |

### Storage Methods

| Method | Description |
|--------|-------------|
| `hasActiveFullAccess(communityId)` | Check if community has active VIP status |
| `grantFullAccess(communityId, grantedBy, reason, expiresAt?)` | Grant VIP access |
| `revokeFullAccess(communityId, revokedBy)` | Revoke VIP access |
| `getCommunitiesWithFullAccess()` | List all VIP communities |

### API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/platform/communities/:id/full-access` | Grant VIP access |
| DELETE | `/api/platform/communities/:id/full-access` | Revoke VIP access |
| GET | `/api/platform/full-access-communities` | List VIP communities |

**Security:** All routes require `platform_super_admin` role verification.

---

## Database Schema

### Core Tables

#### `plans`
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Auto-increment ID |
| code | VARCHAR(50) UNIQUE | Plan identifier (STARTER_FREE, etc.) |
| name | TEXT | Display name |
| description | TEXT | Plan description |
| max_members | INTEGER | Member limit (null = unlimited) |
| price_monthly | INTEGER | Monthly price in cents |
| price_yearly | INTEGER | Yearly price in cents |
| features | JSONB | Feature list array |
| is_popular | BOOLEAN | Featured plan flag |
| is_public | BOOLEAN | Show on public pricing page |
| is_custom | BOOLEAN | Requires custom quote |
| is_white_label | BOOLEAN | White label plan |
| sort_order | INTEGER | Display order |

#### `communities`
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) PK | UUID |
| name | TEXT | Organization name |
| logo | TEXT | Logo URL |
| primary_color | TEXT | HSL color value |
| secondary_color | TEXT | HSL color value |
| description | TEXT | Organization description |
| member_count | INTEGER | Cached member count |
| plan_id | INTEGER FK | Reference to plans |
| billing_status | ENUM | active, past_due, canceled, trialing |
| trial_ends_at | TIMESTAMP | Trial expiration |
| stripe_customer_id | TEXT | Stripe customer ID |
| stripe_subscription_id | TEXT | Stripe subscription ID |
| full_access_granted_at | TIMESTAMP | VIP access start |
| full_access_expires_at | TIMESTAMP | VIP access end |
| full_access_reason | TEXT | VIP reason |
| full_access_granted_by | VARCHAR FK | Admin who granted VIP |
| created_at | TIMESTAMP | Creation date |

#### `accounts` (Mobile App Users)
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) PK | UUID |
| first_name | TEXT | First name |
| last_name | TEXT | Last name |
| email | TEXT UNIQUE | Email address |
| password | TEXT | Bcrypt hashed password |
| phone | TEXT | Phone number |
| avatar | TEXT | Avatar URL |
| created_at | TIMESTAMP | Registration date |

#### `users` (Back-Office Admins)
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) PK | UUID |
| first_name | TEXT | First name |
| last_name | TEXT | Last name |
| email | TEXT UNIQUE | Email address |
| password | TEXT | Hashed password |
| phone | TEXT | Phone number |
| avatar | TEXT | Avatar URL |
| global_role | ENUM | platform_super_admin, platform_support |
| created_at | TIMESTAMP | Registration date |

#### `user_community_memberships`
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) PK | UUID |
| account_id | VARCHAR(50) FK | Reference to accounts (nullable) |
| user_id | VARCHAR(50) FK | Reference to users (nullable) |
| community_id | VARCHAR(50) FK | Reference to communities |
| member_id | TEXT | Organization-specific ID |
| claim_code | VARCHAR(8) UNIQUE | Code for membership claiming |
| display_name | TEXT | Member display name |
| role | TEXT | member, admin |
| admin_role | ENUM | super_admin, support_admin, finance_admin, content_admin |
| status | ENUM | active, expired, suspended |
| section | TEXT | Regional section |
| join_date | TIMESTAMP | Membership start |
| contribution_status | ENUM | up_to_date, expired, pending, late |
| next_due_date | TIMESTAMP | Next payment due |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/accounts/register` | Mobile user registration |
| POST | `/api/accounts/login` | Mobile user login |
| POST | `/api/admin/login` | Web admin login |
| POST | `/api/platform/login` | Platform admin login |
| POST | `/api/memberships/claim` | Claim membership with code |
| GET | `/api/memberships/verify/:claimCode` | Verify claim code |

### Plans & Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plans` | List all plans (?public=true for public only) |
| GET | `/api/plans/:id` | Get plan by ID |
| GET | `/api/plans/code/:code` | Get plan by code |
| GET | `/api/communities/:id/quota` | Check member quota |
| PATCH | `/api/communities/:id/plan` | Change community plan |

### Full Access (Platform Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/platform/communities/:id/full-access` | Grant VIP access |
| DELETE | `/api/platform/communities/:id/full-access` | Revoke VIP access |
| GET | `/api/platform/full-access-communities` | List VIP communities |

### Communities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/communities` | List all communities |
| GET | `/api/communities/:id` | Get community details |
| POST | `/api/communities` | Create new community |

### Memberships

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accounts/:accountId/memberships` | Get account's memberships |
| GET | `/api/communities/:communityId/members` | List community members |
| POST | `/api/memberships` | Create membership |
| PATCH | `/api/memberships/:id` | Update membership |

### Contact

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact form |

---

## Security Considerations

### Authentication
- Email/password login with bcrypt hashing
- Session-based authentication
- Role-based access control (RBAC)
- Platform admin routes protected by `platform_super_admin` verification

### Data Isolation
- All queries filtered by `community_id`
- Users can only access communities they belong to
- Admin actions scoped to authorized communities

### Full Access Route Security
- All grant/revoke operations verify userId has `platform_super_admin` globalRole
- Audit trail via `fullAccessGrantedBy` field

### Best Practices
- Password hashing with bcrypt
- HTTPS enforcement
- Input validation with Zod schemas
- SQL injection prevention via Drizzle ORM

---

## File Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layouts/
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   └── MobileLayout.tsx
│   │   │   └── ui/
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   └── useApi.ts
│   │   ├── i18n/
│   │   │   ├── config.ts
│   │   │   └── locales/
│   │   │       ├── fr.json
│   │   │       └── en.json
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── queryClient.ts
│   │   └── pages/
│   │       ├── admin/
│   │       ├── mobile/
│   │       ├── platform/
│   │       │   └── SuperDashboard.tsx
│   │       └── website/
│   │           ├── Layout.tsx
│   │           ├── Home.tsx
│   │           ├── Pricing.tsx
│   │           ├── Contact.tsx
│   │           └── FAQ.tsx
│   └── index.html
├── docs/
│   └── KOOMY_TECHNICAL_DOCUMENTATION.md
├── server/
│   ├── db.ts
│   ├── index.ts
│   ├── routes.ts
│   ├── seed.ts
│   └── storage.ts
├── shared/
│   └── schema.ts
├── attached_assets/
│   └── (community collage image for homepage)
└── package.json
```

---

## Deployment

### Environment Variables

| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| PGHOST | Database host |
| PGPORT | Database port |
| PGUSER | Database user |
| PGPASSWORD | Database password |
| PGDATABASE | Database name |

### Build Commands

```bash
# Development
npm run dev

# Database push
npm run db:push

# Production build
npm run build

# Start production
npm run start
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2025-11-30 | Initial prototype - Full frontend with mock data |
| 0.2.0 | 2025-11-30 | PostgreSQL integration, API routes, real authentication |
| 0.3.0 | 2025-12-01 | Three-tier authentication (accounts/users/platform admins), membership claiming |
| 0.4.0 | 2025-12-01 | Subscription plans system with 5 canonical plans, member quota enforcement |
| 0.5.0 | 2025-12-01 | Full Access VIP system for platform admins, security hardening |
| 0.6.0 | 2025-12-02 | Internationalization (i18n) - French/English support for public website |
| 0.6.1 | 2025-12-02 | Complete translations for Pricing, Contact, FAQ pages including plan content |

---

*Document generated for Koomy SaaS Platform*
*Last updated: December 2, 2025*
