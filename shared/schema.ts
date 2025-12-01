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
export const userGlobalRoleEnum = pgEnum("user_global_role", ["platform_super_admin", "platform_support"]);

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

// Plans Table
export const plans = pgTable("plans", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: text("name").notNull(),
  maxMembers: integer("max_members").notNull(),
  priceMonthly: integer("price_monthly").notNull(), // in cents
  priceYearly: integer("price_yearly").notNull(), // in cents
  features: jsonb("features").$type<string[]>().notNull(),
  isPopular: boolean("is_popular").default(false)
});

// Communities Table (Tenants)
export const communities = pgTable("communities", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  logo: text("logo"),
  primaryColor: text("primary_color").default("215 85% 35%"),
  secondaryColor: text("secondary_color").default("350 80% 55%"),
  description: text("description"),
  memberCount: integer("member_count").default(0),
  planId: varchar("plan_id", { length: 50 }).references(() => plans.id).notNull(),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").default("active"),
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
  role: text("role").notNull(), // "member" | "admin"
  adminRole: adminRoleEnum("admin_role"), // if role is "admin"
  status: memberStatusEnum("status").default("active"),
  section: text("section"),
  joinDate: timestamp("join_date").defaultNow().notNull(),
  contributionStatus: contributionStatusEnum("contribution_status").default("pending"),
  nextDueDate: timestamp("next_due_date"),
  claimedAt: timestamp("claimed_at") // when the card was linked to an account
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdate: timestamp("last_update").defaultNow().notNull()
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
  senderId: varchar("sender_id", { length: 50 }).references(() => users.id).notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  timestamp: timestamp("timestamp").defaultNow().notNull()
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
  payments: many(payments)
}));

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(userCommunityMemberships),
  tickets: many(supportTickets),
  messages: many(messages)
}));

export const userCommunityMembershipsRelations = relations(userCommunityMemberships, ({ one }) => ({
  user: one(users, { fields: [userCommunityMemberships.userId], references: [users.id] }),
  account: one(accounts, { fields: [userCommunityMemberships.accountId], references: [accounts.id] }),
  community: one(communities, { fields: [userCommunityMemberships.communityId], references: [communities.id] })
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
export const insertTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, lastUpdate: true });
export const insertFaqSchema = createInsertSchema(faqs).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, timestamp: true });
export const insertMembershipFeeSchema = createInsertSchema(membershipFees).omit({ id: true });
export const insertPaymentRequestSchema = createInsertSchema(paymentRequests).omit({ id: true, createdAt: true, paidAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, completedAt: true });
export const insertCommercialContactSchema = createInsertSchema(commercialContacts).omit({ id: true, createdAt: true, status: true });

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
export type FAQ = typeof faqs.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MembershipFee = typeof membershipFees.$inferSelect;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type CommercialContact = typeof commercialContacts.$inferSelect;

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
export type InsertFAQ = z.infer<typeof insertFaqSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertMembershipFee = z.infer<typeof insertMembershipFeeSchema>;
export type InsertPaymentRequest = z.infer<typeof insertPaymentRequestSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertCommercialContact = z.infer<typeof insertCommercialContactSchema>;
