import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "past_due", "canceled"]);
export const memberStatusEnum = pgEnum("member_status", ["active", "expired", "suspended"]);
export const contributionStatusEnum = pgEnum("contribution_status", ["up_to_date", "expired", "pending", "late"]);
export const adminRoleEnum = pgEnum("admin_role", ["super_admin", "support_admin", "finance_admin", "content_admin"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "resolved", "closed"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high"]);
export const newsStatusEnum = pgEnum("news_status", ["draft", "published"]);
export const scopeEnum = pgEnum("scope", ["national", "local"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed", "refunded"]);
export const paymentRequestStatusEnum = pgEnum("payment_request_status", ["pending", "paid", "expired", "cancelled"]);
export const userGlobalRoleEnum = pgEnum("user_global_role", ["platform_super_admin", "platform_support", "platform_commercial"]);
export const billingPeriodEnum = pgEnum("billing_period", ["one_time", "monthly", "yearly"]);

// Email Type Enum
export const emailTypeEnum = pgEnum("email_type", [
  "welcome_community_admin",
  "invite_delegate",
  "invite_member",
  "reset_password",
  "verify_email",
  "new_event",
  "new_collection",
  "message_to_admin"
]);

// Collection status enum (fundraising campaigns)
export const collectionStatusEnum = pgEnum("collection_status", ["open", "closed", "canceled"]);

// Transaction type enum (unified payment tracking)
export const transactionTypeEnum = pgEnum("transaction_type", ["subscription", "membership", "collection"]);

// Transaction status enum
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "succeeded", "failed", "refunded"]);

// Community Types
export const COMMUNITY_TYPES = [
  { value: "sports_club", label: "Club sportif" },
  { value: "association", label: "Association" },
  { value: "union", label: "Syndicat / Union" },
  { value: "cultural", label: "Communauté culturelle" },
  { value: "students", label: "Groupe d'étudiants" },
  { value: "parents", label: "Association de parents" },
  { value: "corporate", label: "Communauté d'entreprise" },
  { value: "neighborhood", label: "Communauté de quartier" },
  { value: "youth", label: "Groupe de jeunes" },
  { value: "charity", label: "Organisation caritative / ONG" },
  { value: "professional", label: "Réseau professionnel" },
  { value: "religious", label: "Communauté religieuse" },
  { value: "hobby", label: "Groupe de loisirs / hobby" },
  { value: "community_org", label: "Organisation communautaire" },
  { value: "other", label: "Autre" }
] as const;

export type CommunityType = typeof COMMUNITY_TYPES[number]["value"];

// Accounts Table (Global Koomy accounts for public app users)
export const accounts = pgTable("accounts", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
  authProvider: text("auth_provider").default("email"), // "email" | "google"
  providerId: text("provider_id"), // for OAuth providers
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Billing Status Enum
export const billingStatusEnum = pgEnum("billing_status", ["trialing", "active", "past_due", "canceled", "unpaid"]);

// Plans Table
export const plans = pgTable("plans", {
  id: varchar("id", { length: 50 }).primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  maxMembers: integer("max_members"), // null = unlimited
  priceMonthly: integer("price_monthly"), // in cents, null for custom/enterprise
  priceYearly: integer("price_yearly"), // in cents, null for custom/enterprise
  features: jsonb("features").$type<string[]>().notNull(),
  isPopular: boolean("is_popular").default(false),
  isPublic: boolean("is_public").default(true),
  isCustom: boolean("is_custom").default(false),
  isWhiteLabel: boolean("is_white_label").default(false),
  sortOrder: integer("sort_order").default(0)
});

// Plan codes constants
export const PLAN_CODES = {
  STARTER_FREE: "STARTER_FREE",
  COMMUNAUTE_STANDARD: "COMMUNAUTE_STANDARD",
  COMMUNAUTE_PRO: "COMMUNAUTE_PRO",
  ENTREPRISE_CUSTOM: "ENTREPRISE_CUSTOM",
  WHITE_LABEL: "WHITE_LABEL"
} as const;

export type PlanCode = typeof PLAN_CODES[keyof typeof PLAN_CODES];

// Communities Table (Tenants)
export const communities = pgTable("communities", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id", { length: 50 }).references(() => users.id),
  name: text("name").notNull(),
  communityType: text("community_type").notNull().default("association"),
  communityTypeOther: text("community_type_other"),
  category: text("category"),
  logo: text("logo"),
  primaryColor: text("primary_color").default("207 100% 63%"),
  secondaryColor: text("secondary_color").default("350 80% 55%"),
  description: text("description"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country").default("France"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  siret: text("siret"),
  iban: text("iban"),
  bic: text("bic"),
  website: text("website"),
  facebook: text("facebook"),
  twitter: text("twitter"),
  instagram: text("instagram"),
  linkedin: text("linkedin"),
  membershipStartDate: timestamp("membership_start_date"),
  membershipEndDate: timestamp("membership_end_date"),
  welcomeMessage: text("welcome_message"),
  membershipFeeEnabled: boolean("membership_fee_enabled").default(false),
  membershipFeeAmount: integer("membership_fee_amount"),
  currency: text("currency").default("EUR"),
  billingPeriod: billingPeriodEnum("billing_period").default("yearly"),
  stripePriceId: text("stripe_price_id"),
  stripeProductId: text("stripe_product_id"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  memberCount: integer("member_count").default(0),
  planId: varchar("plan_id", { length: 50 }).references(() => plans.id).notNull(),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").default("active"),
  billingStatus: billingStatusEnum("billing_status").default("active"),
  trialEndsAt: timestamp("trial_ends_at"),
  currentPeriodEnd: timestamp("current_period_end"),
  // Full access override (granted by platform super admin)
  fullAccessGrantedAt: timestamp("full_access_granted_at"),
  fullAccessExpiresAt: timestamp("full_access_expires_at"), // null = permanent
  fullAccessReason: text("full_access_reason"),
  fullAccessGrantedBy: varchar("full_access_granted_by", { length: 50 }),
  // Stripe Connect (for community payments)
  stripeConnectAccountId: text("stripe_connect_account_id"), // Stripe Connect Express account ID
  paymentsEnabled: boolean("payments_enabled").default(false), // true when Connect verified
  platformFeePercent: integer("platform_fee_percent").default(2), // Koomy commission % (default 2%)
  maxMembersAllowed: integer("max_members_allowed"), // derived from plan (50/1000/5000)
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Users Table (Back-office admins and platform admins)
export const users = pgTable("users", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  avatar: text("avatar"),
  globalRole: userGlobalRoleEnum("global_role"), // null for community admins, set for platform admins
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// User Community Memberships (Junction Table with role info)
export const userCommunityMemberships = pgTable("user_community_memberships", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 50 }).references(() => users.id), // nullable - for admin-created cards
  accountId: varchar("account_id", { length: 50 }).references(() => accounts.id), // linked Koomy account
  communityId: varchar("community_id", { length: 50 }).references(() => communities.id).notNull(),
  memberId: text("member_id").notNull(), // e.g., UNSA-2024-8892
  claimCode: text("claim_code").unique(), // code to link card to account (e.g., XXXX-XXXX)
  displayName: text("display_name"), // name shown on membership card
  email: text("email"), // email set by admin when creating member
  phone: text("phone"), // phone number for OTP and SMS notifications
  role: text("role").notNull(), // "member" | "admin" | "delegate"
  adminRole: adminRoleEnum("admin_role"), // if role is "admin"
  status: memberStatusEnum("status").default("active"),
  section: text("section"),
  joinDate: timestamp("join_date").defaultNow().notNull(),
  contributionStatus: contributionStatusEnum("contribution_status").default("pending"),
  nextDueDate: timestamp("next_due_date"),
  claimedAt: timestamp("claimed_at"), // when the card was linked to an account
  // Membership payment tracking
  membershipPaidAt: timestamp("membership_paid_at"), // last payment date
  membershipValidUntil: timestamp("membership_valid_until"), // membership validity end date
  membershipAmountPaid: integer("membership_amount_paid"), // last amount paid in cents
  // Delegate permissions (for role = "delegate" or "admin")
  canManageArticles: boolean("can_manage_articles").default(true),
  canManageEvents: boolean("can_manage_events").default(true),
  canManageCollections: boolean("can_manage_collections").default(true),
  canManageMessages: boolean("can_manage_messages").default(true),
  canManageMembers: boolean("can_manage_members").default(true),
  canScanPresence: boolean("can_scan_presence").default(true)
});

// Sections Table (for organizations with regional/local divisions)
export const sections = pgTable("sections", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id", { length: 50 }).references(() => communities.id).notNull(),
  name: text("name").notNull()
});

// News Articles
export const newsArticles = pgTable("news_articles", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id", { length: 50 }).references(() => communities.id).notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  image: text("image"),
  scope: scopeEnum("scope").default("national"),
  section: text("section"),
  author: text("author").notNull(),
  status: newsStatusEnum("status").default("draft"),
  publishedAt: timestamp("published_at").defaultNow().notNull()
});

// Events
export const events = pgTable("events", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id", { length: 50 }).references(() => communities.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location").notNull(),
  type: text("type").notNull(),
  scope: scopeEnum("scope").default("national"),
  section: text("section"),
  participants: integer("participants").default(0)
});

// Support Tickets
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 50 }).references(() => users.id).notNull(),
  communityId: varchar("community_id", { length: 50 }).references(() => communities.id).notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: ticketStatusEnum("status").default("open"),
  priority: ticketPriorityEnum("priority").default("medium"),
  assignedTo: varchar("assigned_to", { length: 50 }).references(() => users.id),
  assignedAt: timestamp("assigned_at"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdate: timestamp("last_update").defaultNow().notNull()
});

// Ticket Responses (replies to support tickets)
export const ticketResponses = pgTable("ticket_responses", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id", { length: 50 }).references(() => supportTickets.id).notNull(),
  userId: varchar("user_id", { length: 50 }).references(() => users.id).notNull(),
  message: text("message").notNull(),
  isInternal: boolean("is_internal").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// FAQs
export const faqs = pgTable("faqs", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(),
  targetRole: text("target_role").notNull() // "member" | "admin" | "all"
});

// Messages (for member-admin communication)
export const messages = pgTable("messages", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id", { length: 50 }).references(() => communities.id).notNull(),
  conversationId: varchar("conversation_id", { length: 50 }).notNull(),
  senderMembershipId: varchar("sender_membership_id", { length: 50 }).references(() => userCommunityMemberships.id),
  senderType: text("sender_type").notNull().default("member"),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Membership Fees (defines contribution amounts per community)
export const membershipFees = pgTable("membership_fees", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id", { length: 50 }).references(() => communities.id).notNull(),
  name: text("name").notNull(), // e.g., "Annual Membership", "Monthly Contribution"
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("EUR"),
  period: text("period").notNull(), // "monthly", "yearly", "one_time"
  description: text("description"),
  isActive: boolean("is_active").default(true)
});

// Payment Requests (sent by admin to members)
export const paymentRequests = pgTable("payment_requests", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id", { length: 50 }).references(() => communities.id).notNull(),
  membershipId: varchar("membership_id", { length: 50 }).references(() => userCommunityMemberships.id).notNull(),
  feeId: varchar("fee_id", { length: 50 }).references(() => membershipFees.id).notNull(),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("EUR"),
  status: paymentRequestStatusEnum("status").default("pending"),
  dueDate: timestamp("due_date").notNull(),
  message: text("message"), // optional message from admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at")
});

// Payments (completed transactions)
export const payments = pgTable("payments", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id", { length: 50 }).references(() => communities.id).notNull(),
  membershipId: varchar("membership_id", { length: 50 }).references(() => userCommunityMemberships.id).notNull(),
  paymentRequestId: varchar("payment_request_id", { length: 50 }).references(() => paymentRequests.id),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("EUR"),
  status: paymentStatusEnum("status").default("pending"),
  paymentMethod: text("payment_method"), // "card", "bank_transfer", etc.
  stripePaymentId: text("stripe_payment_id"), // for Stripe integration
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at")
});

// Collections (Fundraising campaigns)
export const collections = pgTable("collections", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id", { length: 50 }).references(() => communities.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetAmountCents: integer("target_amount_cents"), // optional goal amount
  amountCents: integer("amount_cents").notNull(), // amount per participant
  currency: text("currency").default("EUR"),
  status: collectionStatusEnum("status").default("open"),
  platformFeePercent: integer("platform_fee_percent"), // override community fee if set
  allowCustomAmount: boolean("allow_custom_amount").default(false), // let user choose amount
  deadline: timestamp("deadline"), // optional deadline
  collectedAmountCents: integer("collected_amount_cents").default(0), // total collected
  participantsCount: integer("participants_count").default(0), // number of contributors
  createdAt: timestamp("created_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at")
});

// Transactions (Unified payment tracking)
export const transactions = pgTable("transactions", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id", { length: 50 }).references(() => communities.id).notNull(),
  membershipId: varchar("membership_id", { length: 50 }).references(() => userCommunityMemberships.id),
  collectionId: varchar("collection_id", { length: 50 }).references(() => collections.id),
  type: transactionTypeEnum("type").notNull(), // subscription | membership | collection
  amountTotalCents: integer("amount_total_cents").notNull(), // total amount in cents
  amountFeeKoomyCents: integer("amount_fee_koomy_cents").default(0), // Koomy commission
  amountToCommunity: integer("amount_to_community").notNull(), // net amount to community
  currency: text("currency").default("EUR"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  stripeTransferId: text("stripe_transfer_id"), // for Connect transfers
  stripeApplicationFeeId: text("stripe_application_fee_id"), // Koomy fee ID
  status: transactionStatusEnum("status").default("pending"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at")
});

// Commercial Contacts (from public website contact form)
export const commercialContacts = pgTable("commercial_contacts", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  organization: text("organization").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  type: text("type").notNull(), // "info", "demo", "devis", "partenariat", "autre"
  status: text("status").default("new"), // "new", "contacted", "qualified", "converted", "closed"
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Email Templates (managed by SaaS Owner)
export const emailTemplates = pgTable("email_templates", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  type: emailTypeEnum("type").notNull().unique(),
  subject: text("subject").notNull(),
  html: text("html").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Email Logs (for debugging and tracking)
export const emailLogs = pgTable("email_logs", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  to: text("to").notNull(),
  type: emailTypeEnum("type").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  success: boolean("success").notNull(),
  errorMessage: text("error_message")
});

// Relations
export const accountsRelations = relations(accounts, ({ many }) => ({
  memberships: many(userCommunityMemberships)
}));

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  plan: one(plans, { fields: [communities.planId], references: [plans.id] }),
  memberships: many(userCommunityMemberships),
  sections: many(sections),
  news: many(newsArticles),
  events: many(events),
  tickets: many(supportTickets),
  messages: many(messages),
  fees: many(membershipFees),
  paymentRequests: many(paymentRequests),
  payments: many(payments),
  collections: many(collections),
  transactions: many(transactions)
}));

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(userCommunityMemberships),
  tickets: many(supportTickets),
  messages: many(messages)
}));

export const userCommunityMembershipsRelations = relations(userCommunityMemberships, ({ one, many }) => ({
  user: one(users, { fields: [userCommunityMemberships.userId], references: [users.id] }),
  account: one(accounts, { fields: [userCommunityMemberships.accountId], references: [accounts.id] }),
  community: one(communities, { fields: [userCommunityMemberships.communityId], references: [communities.id] }),
  transactions: many(transactions)
}));

// Collections relations
export const collectionsRelations = relations(collections, ({ one, many }) => ({
  community: one(communities, { fields: [collections.communityId], references: [communities.id] }),
  transactions: many(transactions)
}));

// Transactions relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
  community: one(communities, { fields: [transactions.communityId], references: [communities.id] }),
  membership: one(userCommunityMemberships, { fields: [transactions.membershipId], references: [userCommunityMemberships.id] }),
  collection: one(collections, { fields: [transactions.collectionId], references: [collections.id] })
}));

// Insert/Select Schemas
export const insertPlanSchema = createInsertSchema(plans);
export const insertCommunitySchema = createInsertSchema(communities).omit({ id: true, createdAt: true, memberCount: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMembershipSchema = createInsertSchema(userCommunityMemberships).omit({ id: true, joinDate: true, claimedAt: true });
export const insertSectionSchema = createInsertSchema(sections).omit({ id: true });
export const insertNewsSchema = createInsertSchema(newsArticles).omit({ id: true, publishedAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const insertTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, lastUpdate: true, assignedAt: true, resolvedAt: true });
export const insertTicketResponseSchema = createInsertSchema(ticketResponses).omit({ id: true, createdAt: true });
export const insertFaqSchema = createInsertSchema(faqs).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertMembershipFeeSchema = createInsertSchema(membershipFees).omit({ id: true });
export const insertPaymentRequestSchema = createInsertSchema(paymentRequests).omit({ id: true, createdAt: true, paidAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, completedAt: true });
export const insertCollectionSchema = createInsertSchema(collections).omit({ id: true, createdAt: true, closedAt: true, collectedAmountCents: true, participantsCount: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, completedAt: true });
export const insertCommercialContactSchema = createInsertSchema(commercialContacts).omit({ id: true, createdAt: true, status: true });
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({ id: true, updatedAt: true });
export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({ id: true, sentAt: true });

// Select Types
export type Plan = typeof plans.$inferSelect;
export type Community = typeof communities.$inferSelect;
export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type UserCommunityMembership = typeof userCommunityMemberships.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type NewsArticle = typeof newsArticles.$inferSelect;
export type Event = typeof events.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type TicketResponse = typeof ticketResponses.$inferSelect;
export type FAQ = typeof faqs.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MembershipFee = typeof membershipFees.$inferSelect;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type CommercialContact = typeof commercialContacts.$inferSelect;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type EmailLog = typeof emailLogs.$inferSelect;

// Insert Types
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type InsertTicketResponse = z.infer<typeof insertTicketResponseSchema>;
export type InsertFAQ = z.infer<typeof insertFaqSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertMembershipFee = z.infer<typeof insertMembershipFeeSchema>;
export type InsertPaymentRequest = z.infer<typeof insertPaymentRequestSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertCommercialContact = z.infer<typeof insertCommercialContactSchema>;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;

// Delegate Permissions Type
export interface DelegatePermissions {
  canManageArticles: boolean;
  canManageEvents: boolean;
  canManageCollections: boolean;
  canManageMessages: boolean;
  canManageMembers: boolean;
  canScanPresence: boolean;
}

// Helper to extract permissions from membership
export function extractPermissions(membership: UserCommunityMembership): DelegatePermissions {
  return {
    canManageArticles: membership.canManageArticles ?? true,
    canManageEvents: membership.canManageEvents ?? true,
    canManageCollections: membership.canManageCollections ?? true,
    canManageMessages: membership.canManageMessages ?? true,
    canManageMembers: membership.canManageMembers ?? true,
    canScanPresence: membership.canScanPresence ?? true
  };
}
