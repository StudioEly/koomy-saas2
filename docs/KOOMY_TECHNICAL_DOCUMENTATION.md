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

## User Roles & Permissions

### Platform Level (SaaS Owner)

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full platform access, manage all tenants, view all metrics |
| **Support Admin** | View/manage support tickets, limited tenant access |
| **Content Admin** | Manage platform-wide content, FAQs |

### Community Level (Tenant)

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full community access, manage other admins |
| **Admin** | Manage members, content, events |
| **Delegate** | Mobile admin app, QR scanner, messaging |
| **Member** | Mobile app access, view content, messaging |

---

## Application Portals

### 1. Commercial Public Website (`/website`)

**Purpose:** Marketing and user acquisition

| Page | Route | Description |
|------|-------|-------------|
| Home | `/website` | Landing page with hero, features, CTA |
| Pricing | `/website/pricing` | Subscription plans comparison |
| FAQ | `/website/faq` | Frequently asked questions |
| Signup | `/website/signup` | New organization registration |

**Key Components:**
- Login popup modal (accessible from header "Connexion" button)
- Feature showcase cards
- Pricing tier comparison
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

**Key Features:**
- Digital membership card with QR code
- Real-time news feed
- Direct messaging with administrators
- Multi-community support (users can belong to multiple organizations)
- Contribution status display
- Online payment for membership fees

### 3. Mobile Admin/Delegate App (`/app/:communityId/admin`)

**Purpose:** Field administrators and delegates

| Screen | Route | Description |
|--------|-------|-------------|
| Admin Home | `/app/:communityId/admin` | Admin dashboard |
| QR Scanner | `/app/:communityId/admin/scanner` | Member verification |
| Messages | `/app/:communityId/admin/messages` | Member communications |

**Key Features:**
- QR code scanner for member verification
- Member status check (contribution status, expiry)
- Quick member lookup
- Direct messaging

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

**Key Features:**
- Member CRUD operations
- Bulk import/export
- News article editor with scope targeting
- Event creation with registration
- Multi-admin role management
- Section/regional management
- Payment request management
- Bulk contribution calls
- Support ticket handling

### 5. SaaS Owner Portal (`/platform`)

**Purpose:** Platform-wide management for Koomy operators

| Screen | Route | Description |
|--------|-------|-------------|
| Super Dashboard | `/platform/dashboard` | Platform metrics, MRR, clients |

**Key Features:**
- MRR (Monthly Recurring Revenue) tracking
- Client (tenant) overview
- Subscription status monitoring
- Platform admin management
- Support ticket escalation

---

## Database Schema

### Core Tables

#### `plans`
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) PK | Plan identifier (free, growth, scale, enterprise) |
| name | TEXT | Display name |
| max_members | INTEGER | Member limit |
| price_monthly | INTEGER | Monthly price in cents |
| price_yearly | INTEGER | Yearly price in cents |
| features | JSONB | Feature list array |
| is_popular | BOOLEAN | Featured plan flag |

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
| plan_id | VARCHAR(50) FK | Reference to plans |
| subscription_status | ENUM | active, past_due, canceled |
| created_at | TIMESTAMP | Creation date |

#### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) PK | UUID |
| first_name | TEXT | First name |
| last_name | TEXT | Last name |
| email | TEXT UNIQUE | Email address |
| password | TEXT | Hashed password |
| phone | TEXT | Phone number |
| avatar | TEXT | Avatar URL |
| created_at | TIMESTAMP | Registration date |

#### `user_community_memberships`
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) PK | UUID |
| user_id | VARCHAR(50) FK | Reference to users |
| community_id | VARCHAR(50) FK | Reference to communities |
| member_id | TEXT | Organization-specific ID (e.g., UNSA-2024-8892) |
| role | TEXT | member, admin |
| admin_role | ENUM | super_admin, support_admin, finance_admin, content_admin |
| status | ENUM | active, expired, suspended |
| section | TEXT | Regional section |
| join_date | TIMESTAMP | Membership start |
| contribution_status | ENUM | up_to_date, expired, pending, late |
| next_due_date | TIMESTAMP | Next payment due |

#### `sections`
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) PK | UUID |
| community_id | VARCHAR(50) FK | Parent community |
| name | TEXT | Section name |

#### `news_articles`
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) PK | UUID |
| community_id | VARCHAR(50) FK | Parent community |
| title | TEXT | Article title |
| summary | TEXT | Short description |
| content | TEXT | Full content |
| category | TEXT | Category tag |
| image | TEXT | Featured image URL |
| scope | ENUM | national, local |
| section | TEXT | Target section (if local) |
| author | TEXT | Author name |
| status | ENUM | draft, published |
| published_at | TIMESTAMP | Publication date |

#### `events`
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) PK | UUID |
| community_id | VARCHAR(50) FK | Parent community |
| title | TEXT | Event title |
| description | TEXT | Event details |
| date | TIMESTAMP | Start date/time |
| end_date | TIMESTAMP | End date/time |
| location | TEXT | Venue |
| type | TEXT | Event category |
| scope | ENUM | national, local |
| section | TEXT | Target section (if local) |
| participants | INTEGER | Registration count |

#### `support_tickets`
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) PK | UUID |
| user_id | VARCHAR(50) FK | Requesting user |
| community_id | VARCHAR(50) FK | Related community |
| subject | TEXT | Ticket subject |
| message | TEXT | Initial message |
| status | ENUM | open, in_progress, resolved, closed |
| priority | ENUM | low, medium, high |
| created_at | TIMESTAMP | Submission date |
| last_update | TIMESTAMP | Last activity |

#### `faqs`
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) PK | UUID |
| question | TEXT | FAQ question |
| answer | TEXT | FAQ answer |
| category | TEXT | Category grouping |
| target_role | TEXT | member, admin, all |

#### `messages`
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) PK | UUID |
| community_id | VARCHAR(50) FK | Parent community |
| conversation_id | VARCHAR(50) | Thread identifier |
| sender_id | VARCHAR(50) FK | Message author |
| content | TEXT | Message body |
| read | BOOLEAN | Read status |
| timestamp | TIMESTAMP | Send time |

### Payment Tables

#### `membership_fees`
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) PK | UUID |
| community_id | VARCHAR(50) FK | Parent community |
| name | TEXT | Fee name (e.g., "Annual Contribution") |
| amount | INTEGER | Amount in cents |
| currency | TEXT | Currency code (EUR) |
| period | TEXT | annual, semi-annual, quarterly |
| description | TEXT | Fee description |
| is_active | BOOLEAN | Whether fee is currently active |
| created_at | TIMESTAMP | Creation date |

#### `payment_requests`
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) PK | UUID |
| membership_id | VARCHAR(50) FK | Target membership |
| community_id | VARCHAR(50) FK | Parent community |
| fee_id | VARCHAR(50) FK | Reference to membership_fees |
| amount | INTEGER | Amount in cents |
| currency | TEXT | Currency code |
| status | ENUM | pending, paid, expired, cancelled |
| message | TEXT | Custom message |
| due_date | TIMESTAMP | Payment deadline |
| created_at | TIMESTAMP | Request creation |
| paid_at | TIMESTAMP | Payment completion |

#### `payments`
| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) PK | UUID |
| membership_id | VARCHAR(50) FK | Paying membership |
| community_id | VARCHAR(50) FK | Parent community |
| payment_request_id | VARCHAR(50) FK | Optional linked request |
| amount | INTEGER | Amount in cents |
| currency | TEXT | Currency code |
| status | ENUM | pending, completed, failed, refunded |
| payment_method | TEXT | card, bank_transfer |
| payment_reference | TEXT | External payment ID |
| created_at | TIMESTAMP | Payment initiation |
| completed_at | TIMESTAMP | Payment completion |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |

### Communities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/communities` | List all communities |
| GET | `/api/communities/:id` | Get community details |
| POST | `/api/communities` | Create new community |

### Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plans` | List subscription plans |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id` | Get user profile |
| POST | `/api/users` | Create new user |

### Memberships
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:userId/memberships` | Get user's community memberships |
| GET | `/api/communities/:communityId/members` | List community members |
| POST | `/api/memberships` | Create membership |
| PATCH | `/api/memberships/:id` | Update membership |

### News
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/communities/:communityId/news` | List community news |
| GET | `/api/news/:id` | Get article details |
| POST | `/api/news` | Create article |
| PATCH | `/api/news/:id` | Update article |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/communities/:communityId/events` | List community events |
| GET | `/api/events/:id` | Get event details |
| POST | `/api/events` | Create event |
| PATCH | `/api/events/:id` | Update event |

### Support
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | List all tickets (admin) |
| GET | `/api/users/:userId/tickets` | Get user's tickets |
| GET | `/api/communities/:communityId/tickets` | Get community tickets |
| POST | `/api/tickets` | Create ticket |
| PATCH | `/api/tickets/:id` | Update ticket status |

### FAQs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/faqs` | List all FAQs |
| GET | `/api/faqs?role=member` | Get role-specific FAQs |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/communities/:communityId/messages/:conversationId` | Get conversation |
| POST | `/api/messages` | Send message |
| PATCH | `/api/messages/:id/read` | Mark as read |

### Membership Fees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/communities/:communityId/fees` | List community fees |
| POST | `/api/fees` | Create new fee type |
| PATCH | `/api/fees/:id` | Update fee |

### Payment Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/memberships/:membershipId/payment-requests` | Get member's payment requests |
| GET | `/api/communities/:communityId/payment-requests` | List community payment requests |
| POST | `/api/payment-requests` | Create payment request |
| PATCH | `/api/payment-requests/:id` | Update payment request |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/memberships/:membershipId/payments` | Get member's payment history |
| GET | `/api/communities/:communityId/payments` | List community payments |
| POST | `/api/payments` | Create payment |
| POST | `/api/payments/:id/process` | Process payment (mock Stripe) |

---

## Subscription Plans

| Plan | Members | Monthly | Yearly | Target |
|------|---------|---------|--------|--------|
| **Free Starter** | Up to 100 | €0 | €0 | Small clubs |
| **Growth** | Up to 500 | €49 | €490 | Growing associations |
| **Scale** | Up to 2,000 | €149 | €1,490 | Large organizations |
| **Enterprise** | Unlimited | Custom | Custom | Federations |

### Plan Features Comparison

| Feature | Free | Growth | Scale | Enterprise |
|---------|------|--------|-------|------------|
| Digital membership cards | ✓ | ✓ | ✓ | ✓ |
| News feed | ✓ | ✓ | ✓ | ✓ |
| Basic member database | ✓ | ✓ | ✓ | ✓ |
| QR code verification | - | ✓ | ✓ | ✓ |
| Member messaging | - | ✓ | ✓ | ✓ |
| Event management | - | ✓ | ✓ | ✓ |
| Basic analytics | - | ✓ | ✓ | ✓ |
| Multi-role admins | - | - | ✓ | ✓ |
| Custom branding | - | - | ✓ | ✓ |
| Section management | - | - | ✓ | ✓ |
| Advanced analytics | - | - | ✓ | ✓ |
| API access | - | - | ✓ | ✓ |
| White-label | - | - | - | ✓ |
| Dedicated support | - | - | - | ✓ |
| Custom integrations | - | - | - | ✓ |

---

## UI Components Library

### Core Components (shadcn/ui based)

| Component | Usage |
|-----------|-------|
| Button | Primary actions, CTAs, form submissions |
| Input | Text fields, email, password |
| Dialog | Modals, popups, confirmations |
| Card | Content containers, list items |
| Avatar | User profile images |
| Badge | Status indicators, tags |
| Tabs | Section navigation |
| Select | Dropdown selections |
| Toast | Notifications, feedback |
| Accordion | Collapsible FAQ sections |
| ScrollArea | Scrollable content regions |

### Custom Components

| Component | Location | Purpose |
|-----------|----------|---------|
| MobileLayout | `/components/layouts/` | Mobile app shell with bottom nav |
| AdminLayout | `/components/layouts/` | Admin sidebar navigation |
| WebsiteLayout | `/pages/website/` | Public website header/footer |
| QR Code Card | `/pages/mobile/Card.tsx` | Digital membership display |

---

## Security Considerations

### Authentication
- Email/password login
- Session-based authentication
- Role-based access control (RBAC)

### Data Isolation
- All queries filtered by `community_id`
- Users can only access communities they belong to
- Admin actions scoped to authorized communities

### Best Practices
- Password hashing (bcrypt recommended for production)
- HTTPS enforcement
- Input validation with Zod schemas
- SQL injection prevention via Drizzle ORM

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

## File Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layouts/
│   │   │   └── ui/
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   └── useApi.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── queryClient.ts
│   │   └── pages/
│   │       ├── admin/
│   │       ├── mobile/
│   │       ├── platform/
│   │       └── website/
│   └── index.html
├── server/
│   ├── db.ts
│   ├── index.ts
│   ├── routes.ts
│   ├── seed.ts
│   └── storage.ts
├── shared/
│   └── schema.ts
└── package.json
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2025-11-30 | Initial prototype - Full frontend with mock data |
| 0.2.0 | 2025-11-30 | PostgreSQL integration, API routes, real authentication |

---

*Document generated for Koomy SaaS Platform Prototype*
*Last updated: November 30, 2025*
