# Koomy - Multi-Tenant Community Management Platform

## Overview

Koomy is a SaaS platform designed for community management, catering to unions, clubs, associations, and non-profit organizations. It offers a comprehensive digital ecosystem including mobile applications for members, administrative web interfaces for community managers, and a commercial website for customer acquisition. The platform utilizes a multi-tenant architecture, ensuring data isolation for each community (tenant) within a shared infrastructure.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

Koomy's frontend is built with **React 19** and **TypeScript**, using **Vite** for tooling and **Wouter** for routing. **TanStack React Query** manages server state, while **Tailwind CSS** with **shadcn/ui** (based on **Radix UI**) provides the styling. Component organization separates UI, layout, and page components by user type (mobile member/admin, web admin, platform super-admin, public website). Authentication state is managed via `AuthContext`, and local UI state uses React hooks. Routing is structured to differentiate between various application contexts (e.g., `/app/{communityId}/*`, `/admin/*`, `/platform/*`).

### Backend Architecture

The backend runs on **Node.js** with **Express.js** and **TypeScript**. It connects to a **Neon PostgreSQL** database using **Drizzle ORM** for type-safe data access, including WebSocket support. The API is RESTful, with endpoints under `/api/*`, and uses **Zod** for schema validation. A multi-tenant database strategy is employed, where `community_id` foreign keys enforce data isolation. Key architectural patterns include a repository pattern via a storage interface, schema-driven validation, and shared type definitions between client and server.

### Data Storage

The database schema includes platform-level tables (e.g., `plans`, `accounts`) and tenant-specific tables for communities and their features (e.g., `newsArticles`, `events`). User management differentiates between public Koomy mobile app users (`accounts`) and back-office administrators (`users`) with defined `globalRole` enums. A subscription plans system manages member quotas and billing statuses, integrated with Stripe for payment processing. A "Full Access VIP" system allows platform admins to grant unlimited access to specific communities.

Platform analytics provide insights into community performance, member growth, plan utilization, and geographic distribution. A robust authentication model supports three tiers: mobile app users, web administrators, and platform administrators, with role-based access control. Multi-tenant data isolation is enforced through `communityId` foreign keys and role-based access control. Enums are used extensively for managing various statuses like subscriptions, members, tickets, and payments.

### Build and Deployment

Development leverages Vite for client and Node.js for server, with hot module replacement and TypeScript watch mode. Production builds minify and bundle client assets and server code using Vite and esbuild, respectively. Environment variables control configuration, and Replit-specific integrations are utilized.

## External Dependencies

-   **Database**: Neon PostgreSQL (via `@neondatabase/serverless`)
-   **UI Components**: Radix UI, shadcn/ui, Lucide Icons
-   **Development Tools**: Drizzle ORM, Drizzle Kit, Zod, Vite
-   **Replit Integration**: Vite Plugins (runtime error modal, cartographer, dev banner), Meta Images Plugin
-   **Form Handling**: React Hook Form, Hookform Resolvers
-   **Styling**: Tailwind CSS, PostCSS, class-variance-authority, clsx/tailwind-merge
-   **Internationalization**: react-i18next (for French and English)
-   **Other Libraries**: Nodemailer, Stripe, OpenAI, Google Generative AI, Multer, XLSX (dependencies present for future integrations)