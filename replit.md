# Koomy - Multi-Tenant Community Management Platform

## Overview

Koomy is a SaaS platform designed for community management, targeting unions, clubs, associations, and non-profit organizations. The platform provides a complete digital ecosystem with mobile applications for members, administrative web interfaces for community managers, and a commercial website for customer acquisition.

The application follows a multi-tenant architecture where each community (tenant) operates independently within a shared infrastructure, with data isolation enforced at the database level through `community_id` foreign keys.

## User Preferences

Preferred communication style: Simple, everyday language.

## Design System (Koomy Identity)

**Brand Colors:**
- Primary: Sky Blue `#44A8FF` (HSL 207 100% 63%)
- Primary Light: `#5AB8FF`
- Primary Dark: `#2B9AFF`
- Backgrounds: Soft gradients from `#E8F4FF` to white

**Typography:**
- Primary Font: Nunito (rounded, friendly)
- Fallback: Inter, sans-serif
- Heading Font: Nunito for consistency

**Design Principles:**
- Soft, rounded corners (16-20px radius)
- Subtle gradients and glows
- Clean white cards with soft shadows
- Accessible, modern, friendly aesthetic

**CSS Variables (in index.css):**
- `--koomy-primary`, `--koomy-primary-light`, `--koomy-primary-dark`
- `--koomy-bg-soft`, `--koomy-border-soft`, `--koomy-glow`

**Utility Classes:**
- `.koomy-gradient` - Primary gradient background
- `.koomy-glow` - Soft blue glow effect
- `.koomy-card` - White card with soft shadow
- `.koomy-btn` - Primary button style

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 19 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack React Query for server state management and data fetching
- Tailwind CSS for styling with shadcn/ui component library built on Radix UI primitives

**Component Organization:**
- UI components follow the shadcn/ui pattern in `client/src/components/ui/`
- Layout components for mobile and admin interfaces in `client/src/components/layouts/`
- Page components organized by user type (mobile member, mobile admin, web admin, platform super-admin, public website)

**State Management Strategy:**
- Server state managed through React Query with custom hooks in `client/src/hooks/useApi.ts`
- Authentication state managed via React Context (`AuthContext`) for user session and current community selection
- Local UI state managed with React hooks

**Routing Strategy:**
- Mobile member app: `/app/{communityId}/*` routes
- Mobile admin app: `/app/{communityId}/admin/*` routes
- Web admin interface: `/admin/*` routes
- Platform super-admin: `/platform/*` routes
- Public website: `/website/*` routes
- Landing page for persona selection at root `/`

### Backend Architecture

**Technology Stack:**
- Express.js server with TypeScript
- Node.js runtime with ES modules
- Neon PostgreSQL database (serverless)
- Drizzle ORM for database access with WebSocket support

**API Design:**
- RESTful API endpoints under `/api/*` prefix
- Route handlers centralized in `server/routes.ts`
- Storage abstraction layer in `server/storage.ts` providing interface for all database operations
- JSON-based request/response format
- Validation using Zod schemas generated from Drizzle schema

**Database Strategy:**
- Multi-tenant architecture with shared database
- Data isolation through `community_id` foreign keys on all tenant-scoped tables
- Schema definitions in `shared/schema.ts` using Drizzle ORM
- Type-safe database access with generated TypeScript types
- Migration management through Drizzle Kit

**Key Architectural Patterns:**
- Repository pattern via storage interface abstraction
- Schema-driven validation with Drizzle-Zod integration
- Shared type definitions between client and server in `shared/` directory
- Development vs production builds with different optimizations

### Data Storage

**Database Schema:**
- **Platform-level tables:** `plans` for subscription tiers, `accounts` for public Koomy users
- **Tenant tables:** `communities` representing each organization
- **User management:** `users` table (back-office admins), `accounts` table (mobile app users), `userCommunityMemberships` junction table with `accountId`, `claimCode`, `displayName` for membership claiming
- **Community features:** `sections`, `newsArticles`, `events`, `messages`, `supportTickets`, `faqs`
- **Financial:** `membershipFees`, `paymentRequests`, `payments`

**Subscription Plans System:**
- 5 canonical plans with `code` identifiers: STARTER_FREE (50 members), COMMUNAUTE_STANDARD (1000 members, €9.90/month), COMMUNAUTE_PRO (5000 members, €29/month), ENTREPRISE_CUSTOM (unlimited, custom pricing), WHITE_LABEL (unlimited, €4900/year)
- Plans table extended with: `code`, `description`, `isPublic`, `isCustom`, `isWhiteLabel`, `sortOrder`
- Communities table extended with: `billingStatus`, `trialEndsAt`, `stripeCustomerId`, `stripeSubscriptionId`
- Member quota enforcement: `storage.createMembership()` checks plan limits before creating new members
- Plan change validation: `storage.changeCommunityPlan()` prevents downgrade when member count exceeds new plan limit

**Billing Routes:**
- `GET /api/plans` - List all plans (query `?public=true` for public plans only)
- `GET /api/plans/:id` - Get plan by ID
- `GET /api/plans/code/:code` - Get plan by code
- `GET /api/communities/:id/quota` - Check member quota for community
- `PATCH /api/communities/:id/plan` - Change community plan (with validation)
- Stripe routes prepared: `/api/billing/status`, `/api/billing/checkout`, `/api/billing/portal`, `/api/webhooks/stripe`

**Full Access VIP System (Platform Admin Only):**
- Allows SaaS owner to grant free unlimited access to specific communities
- Communities table extended with: `fullAccessGrantedAt`, `fullAccessExpiresAt`, `fullAccessReason`, `fullAccessGrantedBy`
- Storage: `hasActiveFullAccess()`, `grantFullAccess()`, `revokeFullAccess()`, `getCommunitiesWithFullAccess()`
- Member quota bypass: `checkMemberQuota()` returns canAdd=true when fullAccess is active
- API routes (require platform_super_admin verification):
  - `POST /api/platform/communities/:id/full-access` - Grant access (body: grantedBy, reason, expiresAt)
  - `DELETE /api/platform/communities/:id/full-access?userId=` - Revoke access
  - `GET /api/platform/full-access-communities?userId=` - List communities with active access
- UI: Platform SuperDashboard shows VIP badge and "Offrir" button with modal for granting/revoking access

**Authentication Model (Three-Tier System):**
- `accounts` table: Public Koomy mobile app users (email/password with bcrypt)
- `users` table: Back-office administrators with `globalRole` for platform admins
- `userGlobalRoleEnum`: platform_super_admin, platform_support
- Membership claiming: Admins create cards with auto-generated 8-char `claimCode`, users claim with their Koomy account

**Authentication Routes:**
- Mobile: `/api/accounts/register`, `/api/accounts/login`, `/api/memberships/claim`, `/api/memberships/verify/:claimCode`
- Web Admin: `/api/admin/login` - Returns user with memberships for community selection
- Platform Admin: `/api/platform/login` - Returns user with globalRole, requires platform_super_admin role

**Route Protection (client/src/contexts/AuthContext.tsx):**
- `authReady`: Synchronously hydrated from localStorage on initial render
- `isPlatformAdmin`: Computed from user.globalRole === 'platform_super_admin'
- `isAdmin`: Computed from user + currentMembership.role === 'admin'
- Guards prevent content flash by checking both authReady and role before rendering

**Enums for Status Management:**
- Subscription status, member status, contribution status
- Admin roles (super_admin, support_admin, finance_admin, content_admin)
- Ticket status and priority
- News status, scope (national/local)
- Payment and payment request statuses

**Multi-Tenant Data Isolation:**
- All community-scoped data includes `communityId` foreign key
- Users can belong to multiple communities with different roles per community
- Role-based access control implemented through `adminRole` enum on memberships

### Build and Deployment

**Development:**
- Vite dev server on port 5000 for client
- Hot module replacement (HMR) via WebSocket
- TypeScript compilation in watch mode
- Development-only Replit plugins (cartographer, dev banner)

**Production Build:**
- Client built with Vite to `dist/public/`
- Server bundled with esbuild to `dist/index.cjs`
- Dependencies selectively bundled vs externalized based on allowlist
- Static file serving from built client directory

**Environment Configuration:**
- `NODE_ENV` determines development vs production mode
- Database connection via `DATABASE_URL` environment variable
- Replit-specific environment detection via `REPL_ID`

## External Dependencies

### Database Service
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Connection**: Via `@neondatabase/serverless` package with WebSocket support
- **Purpose**: Primary data store for all application data

### UI Component Libraries
- **Radix UI**: Headless UI primitives for accessible components
- **shadcn/ui**: Pre-styled component library built on Radix UI
- **Lucide Icons**: Icon library for consistent iconography

### Development Tools
- **Drizzle ORM**: Type-safe database toolkit
- **Drizzle Kit**: Database migration and schema management
- **Zod**: Schema validation library
- **Vite**: Build tool and dev server

### Replit Platform Integration
- **Vite Plugins**: Runtime error modal, cartographer, dev banner
- **Meta Images Plugin**: Custom Vite plugin for OpenGraph image URL generation on Replit deployments

### Form Handling
- **React Hook Form**: Form state management
- **Hookform Resolvers**: Integration between React Hook Form and Zod validation

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing pipeline
- **class-variance-authority**: Utility for managing component variants
- **clsx/tailwind-merge**: Conditional className utilities

### Future Integration Points
- Email service (Nodemailer dependency present)
- Payment processing (Stripe dependency present)
- AI features (OpenAI and Google Generative AI dependencies present)
- File uploads (Multer dependency present)
- Excel export (XLSX dependency present)