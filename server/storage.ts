import { 
  users, communities, plans, userCommunityMemberships, sections, newsArticles, events, supportTickets, faqs, messages,
  membershipFees, paymentRequests, payments, accounts, commercialContacts, PLAN_CODES,
  type User, type InsertUser, type Community, type InsertCommunity, type Plan, type InsertPlan,
  type UserCommunityMembership, type InsertMembership, type Section, type InsertSection,
  type NewsArticle, type InsertNews, type Event, type InsertEvent,
  type SupportTicket, type InsertTicket, type FAQ, type InsertFAQ,
  type Message, type InsertMessage,
  type MembershipFee, type InsertMembershipFee, type PaymentRequest, type InsertPaymentRequest,
  type Payment, type InsertPayment,
  type Account, type InsertAccount,
  type CommercialContact, type InsertCommercialContact,
  type PlanCode
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull, asc, sql } from "drizzle-orm";

// Custom error for member limit reached
export class MemberLimitReachedError extends Error {
  constructor(currentCount: number, maxMembers: number, planName: string) {
    super(`Votre communauté a atteint la limite de ${maxMembers} membres pour le plan ${planName}. Merci de mettre à niveau votre abonnement.`);
    this.name = "MemberLimitReachedError";
  }
}

// Custom error for plan downgrade not allowed
export class PlanDowngradeNotAllowedError extends Error {
  constructor(currentCount: number, newMaxMembers: number, newPlanName: string) {
    super(`Impossible de passer au plan ${newPlanName} car votre communauté compte ${currentCount} membres, ce qui dépasse la limite de ${newMaxMembers} membres du nouveau plan.`);
    this.name = "PlanDowngradeNotAllowedError";
  }
}

export interface IStorage {
  // Accounts (Public App Users)
  getAccount(id: string): Promise<Account | undefined>;
  getAccountByEmail(email: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: string, updates: Partial<InsertAccount>): Promise<Account>;
  getAccountMemberships(accountId: string): Promise<UserCommunityMembership[]>;
  
  // Users (Admin/Back-Office Users)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Communities
  getCommunity(id: string): Promise<Community | undefined>;
  getAllCommunities(): Promise<Community[]>;
  createCommunity(community: InsertCommunity): Promise<Community>;
  updateCommunity(id: string, updates: Partial<InsertCommunity>): Promise<Community>;
  updateCommunityMemberCount(id: string, count: number): Promise<void>;
  
  // Plans
  getAllPlans(): Promise<Plan[]>;
  getPublicPlans(): Promise<Plan[]>;
  getPlan(id: string): Promise<Plan | undefined>;
  getPlanByCode(code: string): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  
  // Plan Changes
  changeCommunityPlan(communityId: string, newPlanId: string): Promise<Community>;
  checkMemberQuota(communityId: string): Promise<{ canAdd: boolean; current: number; max: number | null; planName: string }>;
  
  // Memberships
  getUserMemberships(userId: string): Promise<UserCommunityMembership[]>;
  getCommunityMemberships(communityId: string): Promise<UserCommunityMembership[]>;
  getMembership(userId: string, communityId: string): Promise<UserCommunityMembership | undefined>;
  getMembershipById(id: string): Promise<UserCommunityMembership | undefined>;
  getMembershipByClaimCode(claimCode: string): Promise<UserCommunityMembership | undefined>;
  createMembership(membership: InsertMembership): Promise<UserCommunityMembership>;
  updateMembership(id: string, updates: Partial<InsertMembership>): Promise<UserCommunityMembership>;
  claimMembership(claimCode: string, accountId: string): Promise<UserCommunityMembership | undefined>;
  
  // Sections
  getCommunitySections(communityId: string): Promise<Section[]>;
  createSection(section: InsertSection): Promise<Section>;
  
  // News
  getCommunityNews(communityId: string): Promise<NewsArticle[]>;
  getNewsArticle(id: string): Promise<NewsArticle | undefined>;
  createNews(news: InsertNews): Promise<NewsArticle>;
  updateNews(id: string, updates: Partial<InsertNews>): Promise<NewsArticle>;
  
  // Events
  getCommunityEvents(communityId: string): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event>;
  
  // Support Tickets
  getAllTickets(): Promise<SupportTicket[]>;
  getUserTickets(userId: string): Promise<SupportTicket[]>;
  getCommunityTickets(communityId: string): Promise<SupportTicket[]>;
  createTicket(ticket: InsertTicket): Promise<SupportTicket>;
  updateTicket(id: string, updates: Partial<InsertTicket>): Promise<SupportTicket>;
  
  // FAQs
  getAllFAQs(): Promise<FAQ[]>;
  getFAQsByRole(role: string): Promise<FAQ[]>;
  getCommunityFAQs(communityId: string): Promise<FAQ[]>;
  createFAQ(faq: InsertFAQ): Promise<FAQ>;
  
  // Messages
  getCommunityMessages(communityId: string, conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageRead(id: string): Promise<void>;
  
  // Membership Fees
  getCommunityFees(communityId: string): Promise<MembershipFee[]>;
  getFee(id: string): Promise<MembershipFee | undefined>;
  createFee(fee: InsertMembershipFee): Promise<MembershipFee>;
  updateFee(id: string, updates: Partial<InsertMembershipFee>): Promise<MembershipFee>;
  
  // Payment Requests
  getMemberPaymentRequests(membershipId: string): Promise<PaymentRequest[]>;
  getCommunityPaymentRequests(communityId: string): Promise<PaymentRequest[]>;
  getPaymentRequest(id: string): Promise<PaymentRequest | undefined>;
  createPaymentRequest(request: InsertPaymentRequest): Promise<PaymentRequest>;
  updatePaymentRequest(id: string, updates: Partial<PaymentRequest>): Promise<PaymentRequest>;
  
  // Payments
  getMemberPayments(membershipId: string): Promise<Payment[]>;
  getCommunityPayments(communityId: string): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment>;
  
  // Commercial Contacts
  getAllCommercialContacts(): Promise<CommercialContact[]>;
  createCommercialContact(contact: InsertCommercialContact): Promise<CommercialContact>;
  updateCommercialContactStatus(id: string, status: string): Promise<CommercialContact>;
}

export class DatabaseStorage implements IStorage {
  // Accounts (Public App Users)
  async getAccount(id: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account || undefined;
  }

  async getAccountByEmail(email: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.email, email));
    return account || undefined;
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await db.insert(accounts).values(insertAccount).returning();
    return account;
  }

  async updateAccount(id: string, updates: Partial<InsertAccount>): Promise<Account> {
    const [account] = await db.update(accounts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(accounts.id, id))
      .returning();
    return account;
  }

  async getAccountMemberships(accountId: string): Promise<UserCommunityMembership[]> {
    return await db.select().from(userCommunityMemberships)
      .where(eq(userCommunityMemberships.accountId, accountId));
  }

  // Users (Admin/Back-Office)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Communities
  async getCommunity(id: string): Promise<Community | undefined> {
    const [community] = await db.select().from(communities).where(eq(communities.id, id));
    return community || undefined;
  }

  async getAllCommunities(): Promise<Community[]> {
    return await db.select().from(communities);
  }

  async createCommunity(insertCommunity: InsertCommunity): Promise<Community> {
    const [community] = await db.insert(communities).values(insertCommunity).returning();
    return community;
  }

  async updateCommunity(id: string, updates: Partial<InsertCommunity>): Promise<Community> {
    const [community] = await db.update(communities).set(updates).where(eq(communities.id, id)).returning();
    return community;
  }

  async updateCommunityMemberCount(id: string, count: number): Promise<void> {
    await db.update(communities).set({ memberCount: count }).where(eq(communities.id, id));
  }

  // Plans
  async getAllPlans(): Promise<Plan[]> {
    return await db.select().from(plans).orderBy(asc(plans.sortOrder));
  }

  async getPublicPlans(): Promise<Plan[]> {
    return await db.select().from(plans)
      .where(eq(plans.isPublic, true))
      .orderBy(asc(plans.sortOrder));
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan || undefined;
  }

  async getPlanByCode(code: string): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.code, code));
    return plan || undefined;
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const [plan] = await db.insert(plans).values(insertPlan as any).returning();
    return plan;
  }

  // Plan Changes
  async changeCommunityPlan(communityId: string, newPlanId: string): Promise<Community> {
    const community = await this.getCommunity(communityId);
    if (!community) {
      throw new Error("Communauté non trouvée");
    }

    const newPlan = await this.getPlan(newPlanId);
    if (!newPlan) {
      throw new Error("Plan non trouvé");
    }

    // Check if downgrade is possible (member count <= new plan max members)
    if (newPlan.maxMembers !== null && community.memberCount > newPlan.maxMembers) {
      throw new PlanDowngradeNotAllowedError(community.memberCount, newPlan.maxMembers, newPlan.name);
    }

    // Update the community's plan
    const [updated] = await db.update(communities)
      .set({ planId: newPlanId })
      .where(eq(communities.id, communityId))
      .returning();
    
    return updated;
  }

  async checkMemberQuota(communityId: string): Promise<{ canAdd: boolean; current: number; max: number | null; planName: string }> {
    const community = await this.getCommunity(communityId);
    if (!community) {
      throw new Error("Communauté non trouvée");
    }

    const plan = await this.getPlan(community.planId);
    if (!plan) {
      throw new Error("Plan non trouvé");
    }

    const current = community.memberCount;
    const max = plan.maxMembers;
    const canAdd = max === null || current < max;

    return {
      canAdd,
      current,
      max,
      planName: plan.name
    };
  }

  // Memberships
  async getUserMemberships(userId: string): Promise<UserCommunityMembership[]> {
    return await db.select().from(userCommunityMemberships).where(eq(userCommunityMemberships.userId, userId));
  }

  async getCommunityMemberships(communityId: string): Promise<UserCommunityMembership[]> {
    return await db.select().from(userCommunityMemberships).where(eq(userCommunityMemberships.communityId, communityId));
  }

  async getMembership(userId: string, communityId: string): Promise<UserCommunityMembership | undefined> {
    const [membership] = await db.select().from(userCommunityMemberships)
      .where(and(
        eq(userCommunityMemberships.userId, userId),
        eq(userCommunityMemberships.communityId, communityId)
      ));
    return membership || undefined;
  }

  async getMembershipById(id: string): Promise<UserCommunityMembership | undefined> {
    const [membership] = await db.select().from(userCommunityMemberships)
      .where(eq(userCommunityMemberships.id, id));
    return membership || undefined;
  }

  async getMembershipByClaimCode(claimCode: string): Promise<UserCommunityMembership | undefined> {
    const [membership] = await db.select().from(userCommunityMemberships)
      .where(eq(userCommunityMemberships.claimCode, claimCode));
    return membership || undefined;
  }

  async createMembership(insertMembership: InsertMembership): Promise<UserCommunityMembership> {
    // Check member quota before creating
    const quota = await this.checkMemberQuota(insertMembership.communityId);
    if (!quota.canAdd) {
      throw new MemberLimitReachedError(quota.current, quota.max!, quota.planName);
    }

    // Create the membership
    const [membership] = await db.insert(userCommunityMemberships).values(insertMembership).returning();
    
    // Update the community member count
    await this.updateCommunityMemberCount(insertMembership.communityId, quota.current + 1);
    
    return membership;
  }

  async updateMembership(id: string, updates: Partial<InsertMembership>): Promise<UserCommunityMembership> {
    const [membership] = await db.update(userCommunityMemberships)
      .set(updates)
      .where(eq(userCommunityMemberships.id, id))
      .returning();
    return membership;
  }

  async claimMembership(claimCode: string, accountId: string): Promise<UserCommunityMembership | undefined> {
    const membership = await this.getMembershipByClaimCode(claimCode);
    if (!membership) return undefined;
    if (membership.accountId) return undefined;
    
    const [updated] = await db.update(userCommunityMemberships)
      .set({ 
        accountId, 
        claimedAt: new Date(),
        claimCode: null
      })
      .where(and(
        eq(userCommunityMemberships.claimCode, claimCode),
        isNull(userCommunityMemberships.accountId)
      ))
      .returning();
    return updated || undefined;
  }

  // Sections
  async getCommunitySections(communityId: string): Promise<Section[]> {
    return await db.select().from(sections).where(eq(sections.communityId, communityId));
  }

  async createSection(insertSection: InsertSection): Promise<Section> {
    const [section] = await db.insert(sections).values(insertSection).returning();
    return section;
  }

  // News
  async getCommunityNews(communityId: string): Promise<NewsArticle[]> {
    return await db.select().from(newsArticles)
      .where(eq(newsArticles.communityId, communityId))
      .orderBy(desc(newsArticles.publishedAt));
  }

  async getNewsArticle(id: string): Promise<NewsArticle | undefined> {
    const [article] = await db.select().from(newsArticles).where(eq(newsArticles.id, id));
    return article || undefined;
  }

  async createNews(insertNews: InsertNews): Promise<NewsArticle> {
    const [article] = await db.insert(newsArticles).values(insertNews).returning();
    return article;
  }

  async updateNews(id: string, updates: Partial<InsertNews>): Promise<NewsArticle> {
    const [article] = await db.update(newsArticles)
      .set(updates)
      .where(eq(newsArticles.id, id))
      .returning();
    return article;
  }

  // Events
  async getCommunityEvents(communityId: string): Promise<Event[]> {
    return await db.select().from(events)
      .where(eq(events.communityId, communityId))
      .orderBy(desc(events.date));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(insertEvent).returning();
    return event;
  }

  async updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event> {
    const [event] = await db.update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  // Support Tickets
  async getAllTickets(): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
  }

  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.createdAt));
  }

  async getCommunityTickets(communityId: string): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets)
      .where(eq(supportTickets.communityId, communityId))
      .orderBy(desc(supportTickets.createdAt));
  }

  async createTicket(insertTicket: InsertTicket): Promise<SupportTicket> {
    const [ticket] = await db.insert(supportTickets).values(insertTicket).returning();
    return ticket;
  }

  async updateTicket(id: string, updates: Partial<InsertTicket>): Promise<SupportTicket> {
    const [ticket] = await db.update(supportTickets)
      .set({ ...updates, lastUpdate: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return ticket;
  }

  // FAQs
  async getAllFAQs(): Promise<FAQ[]> {
    return await db.select().from(faqs);
  }

  async getFAQsByRole(role: string): Promise<FAQ[]> {
    return await db.select().from(faqs).where(eq(faqs.targetRole, role));
  }

  async getCommunityFAQs(communityId: string): Promise<FAQ[]> {
    return await db.select().from(faqs);
  }

  async createFAQ(insertFAQ: InsertFAQ): Promise<FAQ> {
    const [faq] = await db.insert(faqs).values(insertFAQ).returning();
    return faq;
  }

  // Messages
  async getCommunityMessages(communityId: string, conversationId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(and(
        eq(messages.communityId, communityId),
        eq(messages.conversationId, conversationId)
      ))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values({
      ...insertMessage,
      conversationId: insertMessage.conversationId || insertMessage.communityId
    }).returning();
    return message;
  }

  async markMessageRead(id: string): Promise<void> {
    await db.update(messages).set({ read: true }).where(eq(messages.id, id));
  }

  // Membership Fees
  async getCommunityFees(communityId: string): Promise<MembershipFee[]> {
    return await db.select().from(membershipFees)
      .where(eq(membershipFees.communityId, communityId));
  }

  async getFee(id: string): Promise<MembershipFee | undefined> {
    const [fee] = await db.select().from(membershipFees).where(eq(membershipFees.id, id));
    return fee || undefined;
  }

  async createFee(insertFee: InsertMembershipFee): Promise<MembershipFee> {
    const [fee] = await db.insert(membershipFees).values(insertFee).returning();
    return fee;
  }

  async updateFee(id: string, updates: Partial<InsertMembershipFee>): Promise<MembershipFee> {
    const [fee] = await db.update(membershipFees)
      .set(updates)
      .where(eq(membershipFees.id, id))
      .returning();
    return fee;
  }

  // Payment Requests
  async getMemberPaymentRequests(membershipId: string): Promise<PaymentRequest[]> {
    return await db.select().from(paymentRequests)
      .where(eq(paymentRequests.membershipId, membershipId))
      .orderBy(desc(paymentRequests.createdAt));
  }

  async getCommunityPaymentRequests(communityId: string): Promise<PaymentRequest[]> {
    return await db.select().from(paymentRequests)
      .where(eq(paymentRequests.communityId, communityId))
      .orderBy(desc(paymentRequests.createdAt));
  }

  async getPaymentRequest(id: string): Promise<PaymentRequest | undefined> {
    const [request] = await db.select().from(paymentRequests).where(eq(paymentRequests.id, id));
    return request || undefined;
  }

  async createPaymentRequest(insertRequest: InsertPaymentRequest): Promise<PaymentRequest> {
    const [request] = await db.insert(paymentRequests).values(insertRequest).returning();
    return request;
  }

  async updatePaymentRequest(id: string, updates: Partial<PaymentRequest>): Promise<PaymentRequest> {
    const [request] = await db.update(paymentRequests)
      .set(updates)
      .where(eq(paymentRequests.id, id))
      .returning();
    return request;
  }

  // Payments
  async getMemberPayments(membershipId: string): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(eq(payments.membershipId, membershipId))
      .orderBy(desc(payments.createdAt));
  }

  async getCommunityPayments(communityId: string): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(eq(payments.communityId, communityId))
      .orderBy(desc(payments.createdAt));
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const [payment] = await db.update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }
  
  // Commercial Contacts
  async getAllCommercialContacts(): Promise<CommercialContact[]> {
    return await db.select().from(commercialContacts).orderBy(desc(commercialContacts.createdAt));
  }

  async createCommercialContact(contact: InsertCommercialContact): Promise<CommercialContact> {
    const [result] = await db.insert(commercialContacts).values(contact).returning();
    return result;
  }

  async updateCommercialContactStatus(id: string, status: string): Promise<CommercialContact> {
    const [result] = await db.update(commercialContacts)
      .set({ status })
      .where(eq(commercialContacts.id, id))
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
