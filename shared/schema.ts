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

// Users Table
export const users = pgTable("users", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// User Community Memberships (Junction Table with role info)
export const userCommunityMemberships = pgTable("user_community_memberships", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 50 }).references(() => users.id).notNull(),
  communityId: varchar("community_id", { length: 50 }).references(() => communities.id).notNull(),
  memberId: text("member_id").notNull(), // e.g., UNSA-2024-8892
  role: text("role").notNull(), // "member" | "admin"
  adminRole: adminRoleEnum("admin_role"), // if role is "admin"
  status: memberStatusEnum("status").default("active"),
  section: text("section"),
  joinDate: timestamp("join_date").defaultNow().notNull(),
  contributionStatus: contributionStatusEnum("contribution_status").default("pending"),
  nextDueDate: timestamp("next_due_date")
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

// Relations
export const communitiesRelations = relations(communities, ({ one, many }) => ({
  plan: one(plans, { fields: [communities.planId], references: [plans.id] }),
  memberships: many(userCommunityMemberships),
  sections: many(sections),
  news: many(newsArticles),
  events: many(events),
  tickets: many(supportTickets),
  messages: many(messages)
}));

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(userCommunityMemberships),
  tickets: many(supportTickets),
  messages: many(messages)
}));

export const userCommunityMembershipsRelations = relations(userCommunityMemberships, ({ one }) => ({
  user: one(users, { fields: [userCommunityMemberships.userId], references: [users.id] }),
  community: one(communities, { fields: [userCommunityMemberships.communityId], references: [communities.id] })
}));

// Insert/Select Schemas
export const insertPlanSchema = createInsertSchema(plans);
export const insertCommunitySchema = createInsertSchema(communities).omit({ id: true, createdAt: true, memberCount: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertMembershipSchema = createInsertSchema(userCommunityMemberships).omit({ id: true, joinDate: true });
export const insertSectionSchema = createInsertSchema(sections).omit({ id: true });
export const insertNewsSchema = createInsertSchema(newsArticles).omit({ id: true, publishedAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const insertTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, lastUpdate: true });
export const insertFaqSchema = createInsertSchema(faqs).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, timestamp: true });

// Select Types
export type Plan = typeof plans.$inferSelect;
export type Community = typeof communities.$inferSelect;
export type User = typeof users.$inferSelect;
export type UserCommunityMembership = typeof userCommunityMemberships.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type NewsArticle = typeof newsArticles.$inferSelect;
export type Event = typeof events.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type FAQ = typeof faqs.$inferSelect;
export type Message = typeof messages.$inferSelect;

// Insert Types
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type InsertFAQ = z.infer<typeof insertFaqSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
