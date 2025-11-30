# Koomy - Multi-Tenant Community Management Platform

## Overview

Koomy is a SaaS platform designed for community management, targeting unions, clubs, associations, and non-profit organizations. The platform provides a complete digital ecosystem with mobile applications for members, administrative web interfaces for community managers, and a commercial website for customer acquisition.

The application follows a multi-tenant architecture where each community (tenant) operates independently within a shared infrastructure, with data isolation enforced at the database level through `community_id` foreign keys.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Platform-level tables:** `plans` for subscription tiers
- **Tenant tables:** `communities` representing each organization
- **User management:** `users` table with `userCommunityMemberships` junction table for multi-tenant access
- **Community features:** `sections`, `newsArticles`, `events`, `messages`, `supportTickets`, `faqs`
- **Financial:** `membershipFees`, `paymentRequests`, `payments`

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