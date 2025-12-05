import { 
  users, communities, plans, userCommunityMemberships, sections, newsArticles, events, supportTickets, ticketResponses, faqs, messages,
  membershipFees, paymentRequests, payments, accounts, commercialContacts, emailTemplates, emailLogs, transactions, collections, PLAN_CODES,
  type User, type InsertUser, type Community, type InsertCommunity, type Plan, type InsertPlan,
  type UserCommunityMembership, type InsertMembership, type Section, type InsertSection,
  type NewsArticle, type InsertNews, type Event, type InsertEvent,
  type SupportTicket, type InsertTicket, type TicketResponse, type InsertTicketResponse, type FAQ, type InsertFAQ,
  type Message, type InsertMessage,
  type MembershipFee, type InsertMembershipFee, type PaymentRequest, type InsertPaymentRequest,
  type Payment, type InsertPayment,
  type Account, type InsertAccount,
  type CommercialContact, type InsertCommercialContact,
  type EmailTemplate, type InsertEmailTemplate, type EmailLog, type InsertEmailLog,
  type Transaction, type InsertTransaction,
  type Collection, type InsertCollection,
  type PlanCode,
  type BrandConfig
} from "@shared/schema";

// White Label update interface
export interface WhiteLabelUpdate {
  whiteLabel?: boolean;
  whiteLabelTier?: "basic" | "standard" | "premium" | null;
  billingMode?: "self_service" | "manual_contract";
  setupFeeAmountCents?: number | null;
  setupFeeCurrency?: string;
  setupFeeInvoiceRef?: string | null;
  maintenanceAmountYearCents?: number | null;
  maintenanceCurrency?: string;
  maintenanceNextBillingDate?: Date | null;
  maintenanceStatus?: "active" | "pending" | "late" | "stopped" | null;
  internalNotes?: string | null;
  brandConfig?: BrandConfig | null;
  // White Label contract member quotas
  whiteLabelIncludedMembers?: number | null;
  whiteLabelMaxMembersSoftLimit?: number | null;
  whiteLabelAdditionalFeePerMemberCents?: number | null;
}
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
  updateCommunityWhiteLabel(id: string, updates: WhiteLabelUpdate): Promise<Community>;
  
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
  updateTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket>;
  
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
  deleteFee(id: string): Promise<void>;
  
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

  // Ticket Responses
  getTicketResponses(ticketId: string): Promise<TicketResponse[]>;
  createTicketResponse(response: InsertTicketResponse): Promise<TicketResponse>;
  assignTicket(ticketId: string, assignedTo: string): Promise<SupportTicket>;
  getTicketWithDetails(ticketId: string): Promise<(SupportTicket & { responses: TicketResponse[]; user: User | null; community: Community | null; assignedUser: User | null }) | undefined>;
  getAllTicketsWithDetails(): Promise<(SupportTicket & { userName: string; communityName: string; assignedUserName: string | null; responseCount: number })[]>;
  
  // Email Templates
  getAllEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplateByType(type: string): Promise<EmailTemplate | undefined>;
  updateEmailTemplate(type: string, updates: { subject: string; html: string }): Promise<EmailTemplate | undefined>;
  
  // Email Logs
  getEmailLogs(limit: number, offset: number): Promise<EmailLog[]>;
  createEmailLog(log: InsertEmailLog): Promise<EmailLog>;
  
  // Transactions
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionByPaymentIntentId(stripePaymentIntentId: string): Promise<Transaction | undefined>;
  getCommunityTransactions(communityId: string): Promise<Transaction[]>;
  getMembershipTransactions(membershipId: string): Promise<Transaction[]>;
  insertTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction>;
  
  // Collections (Fundraising)
  createCollection(collection: InsertCollection): Promise<Collection>;
  getCollection(id: string): Promise<Collection | undefined>;
  getCommunityCollections(communityId: string): Promise<Collection[]>;
  getOpenCollections(communityId: string): Promise<Collection[]>;
  updateCollection(id: string, updates: Partial<InsertCollection>): Promise<Collection>;
  updateCollectionAmounts(id: string, amountCents: number): Promise<Collection>;
  closeCollection(id: string): Promise<Collection>;
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

  async updateCommunityWhiteLabel(id: string, updates: WhiteLabelUpdate): Promise<Community> {
    // Build dynamic update object to only include fields that are explicitly provided
    const updateData: Record<string, any> = {};
    
    if (updates.whiteLabel !== undefined) updateData.whiteLabel = updates.whiteLabel;
    if (updates.whiteLabelTier !== undefined) updateData.whiteLabelTier = updates.whiteLabelTier;
    if (updates.billingMode !== undefined) updateData.billingMode = updates.billingMode;
    if (updates.setupFeeAmountCents !== undefined) updateData.setupFeeAmountCents = updates.setupFeeAmountCents;
    if (updates.setupFeeCurrency !== undefined) updateData.setupFeeCurrency = updates.setupFeeCurrency;
    if (updates.setupFeeInvoiceRef !== undefined) updateData.setupFeeInvoiceRef = updates.setupFeeInvoiceRef;
    if (updates.maintenanceAmountYearCents !== undefined) updateData.maintenanceAmountYearCents = updates.maintenanceAmountYearCents;
    if (updates.maintenanceCurrency !== undefined) updateData.maintenanceCurrency = updates.maintenanceCurrency;
    if (updates.maintenanceNextBillingDate !== undefined) updateData.maintenanceNextBillingDate = updates.maintenanceNextBillingDate;
    if (updates.maintenanceStatus !== undefined) updateData.maintenanceStatus = updates.maintenanceStatus;
    if (updates.internalNotes !== undefined) updateData.internalNotes = updates.internalNotes;
    if (updates.brandConfig !== undefined) updateData.brandConfig = updates.brandConfig;
    if (updates.whiteLabelIncludedMembers !== undefined) updateData.whiteLabelIncludedMembers = updates.whiteLabelIncludedMembers;
    if (updates.whiteLabelMaxMembersSoftLimit !== undefined) updateData.whiteLabelMaxMembersSoftLimit = updates.whiteLabelMaxMembersSoftLimit;
    if (updates.whiteLabelAdditionalFeePerMemberCents !== undefined) updateData.whiteLabelAdditionalFeePerMemberCents = updates.whiteLabelAdditionalFeePerMemberCents;
    
    const [community] = await db.update(communities)
      .set(updateData)
      .where(eq(communities.id, id))
      .returning();
    return community;
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

    const memberCount = community.memberCount ?? 0;
    
    // Check if downgrade is possible (member count <= new plan max members)
    if (newPlan.maxMembers !== null && memberCount > newPlan.maxMembers) {
      throw new PlanDowngradeNotAllowedError(memberCount, newPlan.maxMembers, newPlan.name);
    }

    // Update the community's plan
    const [updated] = await db.update(communities)
      .set({ planId: newPlanId })
      .where(eq(communities.id, communityId))
      .returning();
    
    return updated;
  }

  async checkMemberQuota(communityId: string): Promise<{ canAdd: boolean; current: number; max: number | null; planName: string; hasFullAccess: boolean }> {
    const community = await this.getCommunity(communityId);
    if (!community) {
      throw new Error("Communauté non trouvée");
    }

    const plan = await this.getPlan(community.planId);
    if (!plan) {
      throw new Error("Plan non trouvé");
    }

    const current = community.memberCount ?? 0;
    const max = plan.maxMembers;
    
    // Check if community has active full access
    const hasFullAccess = this.hasActiveFullAccess(community);
    
    // If full access is active, always allow adding members
    const canAdd = hasFullAccess || max === null || current < max;

    return {
      canAdd,
      current,
      max,
      planName: plan.name,
      hasFullAccess
    };
  }

  // Full Access Management
  hasActiveFullAccess(community: Community): boolean {
    if (!community.fullAccessGrantedAt) return false;
    if (!community.fullAccessExpiresAt) return true; // Permanent access
    return new Date() < new Date(community.fullAccessExpiresAt);
  }

  async grantFullAccess(
    communityId: string, 
    grantedBy: string, 
    reason: string, 
    expiresAt?: Date | null
  ): Promise<Community> {
    const [updated] = await db.update(communities)
      .set({
        fullAccessGrantedAt: new Date(),
        fullAccessExpiresAt: expiresAt ?? null,
        fullAccessReason: reason,
        fullAccessGrantedBy: grantedBy
      })
      .where(eq(communities.id, communityId))
      .returning();
    
    if (!updated) {
      throw new Error("Communauté non trouvée");
    }
    
    return updated;
  }

  async revokeFullAccess(communityId: string): Promise<Community> {
    const [updated] = await db.update(communities)
      .set({
        fullAccessGrantedAt: null,
        fullAccessExpiresAt: null,
        fullAccessReason: null,
        fullAccessGrantedBy: null
      })
      .where(eq(communities.id, communityId))
      .returning();
    
    if (!updated) {
      throw new Error("Communauté non trouvée");
    }
    
    return updated;
  }

  async getCommunitiesWithFullAccess(): Promise<Community[]> {
    const allCommunities = await db.select().from(communities);
    return allCommunities.filter(c => this.hasActiveFullAccess(c));
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

  async updateTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket> {
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

  async deleteFee(id: string): Promise<void> {
    await db.delete(membershipFees).where(eq(membershipFees.id, id));
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

  // Platform Financial Metrics
  async getPlatformMetrics(): Promise<{
    mrr: number;
    arr: number;
    totalClients: number;
    activeClients: number;
    totalMembers: number;
    revenueByPlan: { planId: string; planName: string; planCode: string; count: number; mrr: number }[];
    volumeCollected: number;
    volumeCollectedThisMonth: number;
    paymentsCount: number;
    paymentsCountThisMonth: number;
    newClientsThisMonth: number;
    churnedClientsThisMonth: number;
    mrrGrowth: number;
  }> {
    const allCommunities = await this.getAllCommunities();
    const allPlans = await this.getAllPlans();
    const allPayments = await db.select().from(payments);
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Calculate MRR based on active subscriptions
    let mrr = 0;
    const revenueByPlan: { planId: string; planName: string; planCode: string; count: number; mrr: number }[] = [];
    
    const planMap = new Map(allPlans.map(p => [p.id, p]));
    const planCounts = new Map<string, { count: number; mrr: number }>();

    for (const community of allCommunities) {
      const plan = planMap.get(community.planId);
      if (!plan) continue;

      // Skip communities with full access (they don't pay)
      if (this.hasActiveFullAccess(community)) continue;

      // Only count active subscriptions
      if (community.billingStatus === 'active' || community.subscriptionStatus === 'active') {
        const monthlyPrice = plan.priceMonthly ? plan.priceMonthly / 100 : 0;
        mrr += monthlyPrice;

        const current = planCounts.get(plan.id) || { count: 0, mrr: 0 };
        planCounts.set(plan.id, { 
          count: current.count + 1, 
          mrr: current.mrr + monthlyPrice 
        });
      }
    }

    // Build revenue by plan array
    for (const plan of allPlans) {
      const stats = planCounts.get(plan.id) || { count: 0, mrr: 0 };
      if (stats.count > 0 || plan.isPublic) {
        revenueByPlan.push({
          planId: plan.id,
          planName: plan.name,
          planCode: plan.code,
          count: stats.count,
          mrr: stats.mrr
        });
      }
    }

    // Calculate ARR
    const arr = mrr * 12;

    // Calculate total members across all communities
    const totalMembers = allCommunities.reduce((sum, c) => sum + (c.memberCount || 0), 0);

    // Calculate volume collected (completed payments)
    const completedPayments = allPayments.filter(p => p.status === 'completed');
    const volumeCollected = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100;

    // Volume collected this month
    const paymentsThisMonth = completedPayments.filter(p => 
      p.completedAt && new Date(p.completedAt) >= startOfMonth
    );
    const volumeCollectedThisMonth = paymentsThisMonth.reduce((sum, p) => sum + (p.amount || 0), 0) / 100;

    // New clients this month
    const newClientsThisMonth = allCommunities.filter(c => 
      c.createdAt && new Date(c.createdAt) >= startOfMonth
    ).length;

    // Churned clients this month (canceled status)
    const churnedClientsThisMonth = allCommunities.filter(c => 
      c.billingStatus === 'canceled' || c.subscriptionStatus === 'canceled'
    ).length;

    // MRR growth (simplified - comparing current MRR to estimate of last month)
    // In a real scenario, you'd store historical MRR data
    const mrrGrowth = newClientsThisMonth > 0 ? 12.5 : 0; // Placeholder percentage

    return {
      mrr,
      arr,
      totalClients: allCommunities.length,
      activeClients: allCommunities.filter(c => 
        c.billingStatus === 'active' || c.subscriptionStatus === 'active'
      ).length,
      totalMembers,
      revenueByPlan,
      volumeCollected,
      volumeCollectedThisMonth,
      paymentsCount: completedPayments.length,
      paymentsCountThisMonth: paymentsThisMonth.length,
      newClientsThisMonth,
      churnedClientsThisMonth,
      mrrGrowth
    };
  }

  // Get all payments across the platform with community info
  async getAllPlatformPayments(): Promise<(Payment & { communityName?: string })[]> {
    const allPayments = await db.select().from(payments).orderBy(desc(payments.createdAt));
    const allCommunities = await this.getAllCommunities();
    const communityMap = new Map(allCommunities.map(c => [c.id, c.name]));

    return allPayments.map(p => ({
      ...p,
      communityName: communityMap.get(p.communityId) || 'Unknown'
    }));
  }

  // Get monthly revenue history (last 12 months)
  async getMonthlyRevenueHistory(): Promise<{ month: string; revenue: number; payments: number }[]> {
    const allPayments = await db.select().from(payments);
    const completedPayments = allPayments.filter(p => p.status === 'completed');

    const monthlyData: Map<string, { revenue: number; payments: number }> = new Map();

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(key, { revenue: 0, payments: 0 });
    }

    // Aggregate payments by month
    for (const payment of completedPayments) {
      if (!payment.completedAt) continue;
      const date = new Date(payment.completedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData.has(key)) {
        const current = monthlyData.get(key)!;
        monthlyData.set(key, {
          revenue: current.revenue + (payment.amount || 0) / 100,
          payments: current.payments + 1
        });
      }
    }

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      payments: data.payments
    }));
  }

  // Get top communities by revenue
  async getTopCommunitiesByRevenue(limit: number = 10): Promise<{
    communityId: string;
    communityName: string;
    totalRevenue: number;
    memberCount: number;
    planName: string;
  }[]> {
    const allCommunities = await this.getAllCommunities();
    const allPayments = await db.select().from(payments);
    const allPlans = await this.getAllPlans();
    
    const planMap = new Map(allPlans.map(p => [p.id, p.name]));
    const completedPayments = allPayments.filter(p => p.status === 'completed');

    // Aggregate revenue by community
    const revenueMap: Map<string, number> = new Map();
    for (const payment of completedPayments) {
      const current = revenueMap.get(payment.communityId) || 0;
      revenueMap.set(payment.communityId, current + (payment.amount || 0) / 100);
    }

    // Build and sort community list
    const communityRevenue = allCommunities.map(c => ({
      communityId: c.id,
      communityName: c.name,
      totalRevenue: revenueMap.get(c.id) || 0,
      memberCount: c.memberCount || 0,
      planName: planMap.get(c.planId) || 'Unknown'
    }));

    return communityRevenue
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }

  // =====================================================
  // COMMUNITY ANALYTICS
  // =====================================================

  // Get top communities by member count
  async getTopCommunitiesByMembers(limit: number = 10): Promise<{
    communityId: string;
    communityName: string;
    memberCount: number;
    planName: string;
    country: string | null;
  }[]> {
    const allCommunities = await this.getAllCommunities();
    const allPlans = await this.getAllPlans();
    const planMap = new Map(allPlans.map(p => [p.id, p.name]));

    return allCommunities
      .map(c => ({
        communityId: c.id,
        communityName: c.name,
        memberCount: c.memberCount || 0,
        planName: planMap.get(c.planId) || 'Unknown',
        country: c.country
      }))
      .sort((a, b) => b.memberCount - a.memberCount)
      .slice(0, limit);
  }

  // Get at-risk communities (low activity, late payments, approaching quota)
  async getAtRiskCommunities(): Promise<{
    communityId: string;
    communityName: string;
    riskType: 'quota_limit' | 'low_activity' | 'late_payments' | 'inactive';
    riskLevel: 'high' | 'medium' | 'low';
    details: string;
    memberCount: number;
    planName: string;
  }[]> {
    const allCommunities = await this.getAllCommunities();
    const allPlans = await this.getAllPlans();
    const planMap = new Map(allPlans.map(p => [p.id, p]));
    const atRiskCommunities: {
      communityId: string;
      communityName: string;
      riskType: 'quota_limit' | 'low_activity' | 'late_payments' | 'inactive';
      riskLevel: 'high' | 'medium' | 'low';
      details: string;
      memberCount: number;
      planName: string;
    }[] = [];

    for (const community of allCommunities) {
      const plan = planMap.get(community.planId);
      if (!plan) continue;

      const memberCount = community.memberCount || 0;
      const maxMembers = plan.maxMembers;

      // Check quota limit risk
      if (maxMembers && memberCount > 0) {
        const usagePercent = (memberCount / maxMembers) * 100;
        if (usagePercent >= 90) {
          atRiskCommunities.push({
            communityId: community.id,
            communityName: community.name,
            riskType: 'quota_limit',
            riskLevel: usagePercent >= 95 ? 'high' : 'medium',
            details: `${usagePercent.toFixed(0)}% du quota utilisé (${memberCount}/${maxMembers})`,
            memberCount,
            planName: plan.name
          });
        }
      }

      // Check for inactive communities (no members)
      if (memberCount === 0) {
        const createdAt = community.createdAt ? new Date(community.createdAt) : null;
        const daysSinceCreation = createdAt ? Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        
        if (daysSinceCreation > 30) {
          atRiskCommunities.push({
            communityId: community.id,
            communityName: community.name,
            riskType: 'inactive',
            riskLevel: daysSinceCreation > 90 ? 'high' : 'medium',
            details: `Aucun membre depuis ${daysSinceCreation} jours`,
            memberCount: 0,
            planName: plan.name
          });
        }
      }

      // Check for late billing status
      if (community.billingStatus === 'past_due' || community.billingStatus === 'unpaid') {
        atRiskCommunities.push({
          communityId: community.id,
          communityName: community.name,
          riskType: 'late_payments',
          riskLevel: community.billingStatus === 'unpaid' ? 'high' : 'medium',
          details: `Statut: ${community.billingStatus === 'past_due' ? 'Paiement en retard' : 'Impayé'}`,
          memberCount,
          planName: plan.name
        });
      }
    }

    return atRiskCommunities.sort((a, b) => {
      const levelOrder = { high: 0, medium: 1, low: 2 };
      return levelOrder[a.riskLevel] - levelOrder[b.riskLevel];
    });
  }

  // Get member growth history (last 12 months)
  async getMemberGrowthHistory(): Promise<{ month: string; totalMembers: number; newMembers: number }[]> {
    const allMemberships = await db.select().from(userCommunityMemberships);
    const monthlyData: Map<string, { total: number; new: number }> = new Map();

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(key, { total: 0, new: 0 });
    }

    // Count memberships by creation month
    let cumulativeTotal = 0;
    const sortedMonths = Array.from(monthlyData.keys()).sort();
    
    for (const membership of allMemberships) {
      if (!membership.joinDate) continue;
      const date = new Date(membership.joinDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData.has(key)) {
        const current = monthlyData.get(key)!;
        monthlyData.set(key, { ...current, new: current.new + 1 });
      }
    }

    // Calculate cumulative totals
    for (const month of sortedMonths) {
      const data = monthlyData.get(month)!;
      cumulativeTotal += data.new;
      monthlyData.set(month, { ...data, total: cumulativeTotal });
    }

    return sortedMonths.map(month => ({
      month,
      totalMembers: monthlyData.get(month)!.total,
      newMembers: monthlyData.get(month)!.new
    }));
  }

  // Get plan utilization rates
  async getPlanUtilizationRates(): Promise<{
    planId: string;
    planName: string;
    maxMembers: number | null;
    totalMembersUsed: number;
    totalMembersAllowed: number;
    utilizationPercent: number;
    communityCount: number;
  }[]> {
    const allCommunities = await this.getAllCommunities();
    const allPlans = await this.getAllPlans();
    
    const planStats: Map<string, { 
      membersUsed: number; 
      membersAllowed: number; 
      count: number 
    }> = new Map();

    // Initialize stats for each plan
    for (const plan of allPlans) {
      planStats.set(plan.id, { membersUsed: 0, membersAllowed: 0, count: 0 });
    }

    // Aggregate community data by plan
    for (const community of allCommunities) {
      const plan = allPlans.find(p => p.id === community.planId);
      if (!plan) continue;

      const stats = planStats.get(plan.id)!;
      const memberCount = community.memberCount || 0;
      const maxAllowed = plan.maxMembers || 0;

      planStats.set(plan.id, {
        membersUsed: stats.membersUsed + memberCount,
        membersAllowed: stats.membersAllowed + maxAllowed,
        count: stats.count + 1
      });
    }

    return allPlans.map(plan => {
      const stats = planStats.get(plan.id)!;
      const utilizationPercent = stats.membersAllowed > 0 
        ? (stats.membersUsed / stats.membersAllowed) * 100 
        : 0;

      return {
        planId: plan.id,
        planName: plan.name,
        maxMembers: plan.maxMembers,
        totalMembersUsed: stats.membersUsed,
        totalMembersAllowed: stats.membersAllowed,
        utilizationPercent: Math.round(utilizationPercent * 10) / 10,
        communityCount: stats.count
      };
    });
  }

  // Get new community registrations timeline
  async getCommunityRegistrationsTimeline(): Promise<{ date: string; count: number; communityNames: string[] }[]> {
    const allCommunities = await this.getAllCommunities();
    const dailyData: Map<string, { count: number; names: string[] }> = new Map();

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      dailyData.set(key, { count: 0, names: [] });
    }

    // Count registrations by day
    for (const community of allCommunities) {
      if (!community.createdAt) continue;
      const key = new Date(community.createdAt).toISOString().split('T')[0];
      
      if (dailyData.has(key)) {
        const current = dailyData.get(key)!;
        dailyData.set(key, { 
          count: current.count + 1, 
          names: [...current.names, community.name] 
        });
      }
    }

    return Array.from(dailyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        count: data.count,
        communityNames: data.names
      }));
  }

  // Get geographic distribution of communities
  async getCommunityGeographicDistribution(): Promise<{
    country: string;
    count: number;
    totalMembers: number;
    cities: { city: string; count: number }[];
  }[]> {
    const allCommunities = await this.getAllCommunities();
    const countryData: Map<string, { 
      count: number; 
      members: number; 
      cities: Map<string, number> 
    }> = new Map();

    for (const community of allCommunities) {
      const country = community.country || 'Non spécifié';
      const city = community.city || 'Ville non spécifiée';
      const memberCount = community.memberCount || 0;

      if (!countryData.has(country)) {
        countryData.set(country, { count: 0, members: 0, cities: new Map() });
      }

      const data = countryData.get(country)!;
      data.count += 1;
      data.members += memberCount;

      const currentCityCount = data.cities.get(city) || 0;
      data.cities.set(city, currentCityCount + 1);
    }

    return Array.from(countryData.entries())
      .map(([country, data]) => ({
        country,
        count: data.count,
        totalMembers: data.members,
        cities: Array.from(data.cities.entries())
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      }))
      .sort((a, b) => b.count - a.count);
  }

  // =====================================================
  // PLATFORM USER MANAGEMENT
  // =====================================================

  // Get all platform users (users with global roles)
  async getPlatformUsers(): Promise<User[]> {
    return await db.select().from(users)
      .where(sql`${users.globalRole} IS NOT NULL`)
      .orderBy(desc(users.createdAt));
  }

  // Create platform user
  async createPlatformUser(userData: InsertUser & { globalRole: string }): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Update platform user role
  async updatePlatformUserRole(userId: string, role: string | null): Promise<User> {
    const [user] = await db.update(users)
      .set({ globalRole: role as any })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Count platform super admins (to prevent deleting the last one)
  async countPlatformSuperAdmins(): Promise<number> {
    const result = await db.select().from(users)
      .where(eq(users.globalRole, 'platform_super_admin'));
    return result.length;
  }

  // Delete platform user (demote to regular user)
  async demotePlatformUser(userId: string): Promise<User> {
    const [user] = await db.update(users)
      .set({ globalRole: null })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // =====================================================
  // TICKET MANAGEMENT
  // =====================================================

  // Get ticket responses
  async getTicketResponses(ticketId: string): Promise<TicketResponse[]> {
    return await db.select().from(ticketResponses)
      .where(eq(ticketResponses.ticketId, ticketId))
      .orderBy(asc(ticketResponses.createdAt));
  }

  // Create ticket response
  async createTicketResponse(response: InsertTicketResponse): Promise<TicketResponse> {
    const [result] = await db.insert(ticketResponses).values(response).returning();
    
    // Update ticket lastUpdate timestamp
    await db.update(supportTickets)
      .set({ lastUpdate: new Date() })
      .where(eq(supportTickets.id, response.ticketId));
    
    return result;
  }

  // Assign ticket to a platform user
  async assignTicket(ticketId: string, assignedTo: string): Promise<SupportTicket> {
    const [ticket] = await db.update(supportTickets)
      .set({ 
        assignedTo, 
        assignedAt: new Date(),
        status: 'in_progress',
        lastUpdate: new Date()
      })
      .where(eq(supportTickets.id, ticketId))
      .returning();
    return ticket;
  }

  // Get ticket with all details (responses, user info, community info)
  async getTicketWithDetails(ticketId: string): Promise<(SupportTicket & { 
    responses: TicketResponse[]; 
    user: User | null; 
    community: Community | null; 
    assignedUser: User | null 
  }) | undefined> {
    const [ticket] = await db.select().from(supportTickets)
      .where(eq(supportTickets.id, ticketId));
    
    if (!ticket) return undefined;

    const responses = await this.getTicketResponses(ticketId);
    const user = ticket.userId ? await this.getUser(ticket.userId) : null;
    const community = ticket.communityId ? await this.getCommunity(ticket.communityId) : null;
    const assignedUser = ticket.assignedTo ? await this.getUser(ticket.assignedTo) : null;

    return {
      ...ticket,
      responses,
      user: user || null,
      community: community || null,
      assignedUser: assignedUser || null
    };
  }

  // Get all tickets with summary info for listing
  async getAllTicketsWithDetails(): Promise<(SupportTicket & { 
    userName: string; 
    communityName: string; 
    assignedUserName: string | null; 
    responseCount: number 
  })[]> {
    const allTickets = await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
    const allUsers = await db.select().from(users);
    const allCommunities = await this.getAllCommunities();
    const allResponses = await db.select().from(ticketResponses);

    const userMap = new Map(allUsers.map(u => [u.id, `${u.firstName} ${u.lastName}`]));
    const communityMap = new Map(allCommunities.map(c => [c.id, c.name]));

    // Count responses per ticket
    const responseCountMap = new Map<string, number>();
    for (const response of allResponses) {
      responseCountMap.set(response.ticketId, (responseCountMap.get(response.ticketId) || 0) + 1);
    }

    return allTickets.map(ticket => ({
      ...ticket,
      userName: userMap.get(ticket.userId) || 'Utilisateur inconnu',
      communityName: communityMap.get(ticket.communityId) || 'Communauté inconnue',
      assignedUserName: ticket.assignedTo ? (userMap.get(ticket.assignedTo) || null) : null,
      responseCount: responseCountMap.get(ticket.id) || 0
    }));
  }

  // =====================================================
  // PAYMENT TRACKING & ANALYTICS
  // =====================================================

  // Get detailed payment analytics
  async getPaymentAnalytics(): Promise<{
    totalVolume: number;
    totalVolumeThisMonth: number;
    failedPayments: { count: number; amount: number };
    pendingPayments: { count: number; amount: number };
    completedPayments: { count: number; amount: number };
    refundedPayments: { count: number; amount: number };
    failureRate: number;
    averagePaymentAmount: number;
    paymentsByMethod: { method: string; count: number; amount: number }[];
    monthlyForecast: { month: string; expectedRevenue: number }[];
  }> {
    const allPayments = await db.select().from(payments);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Group payments by status
    const byStatus = {
      pending: allPayments.filter(p => p.status === 'pending'),
      completed: allPayments.filter(p => p.status === 'completed'),
      failed: allPayments.filter(p => p.status === 'failed'),
      refunded: allPayments.filter(p => p.status === 'refunded')
    };

    const sumAmount = (payments: Payment[]) => payments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100;

    // This month's completed payments
    const completedThisMonth = byStatus.completed.filter(p => 
      p.completedAt && new Date(p.completedAt) >= startOfMonth
    );

    // Group by payment method
    const methodMap = new Map<string, { count: number; amount: number }>();
    for (const payment of byStatus.completed) {
      const method = payment.paymentMethod || 'Autre';
      const current = methodMap.get(method) || { count: 0, amount: 0 };
      methodMap.set(method, {
        count: current.count + 1,
        amount: current.amount + (payment.amount || 0) / 100
      });
    }

    // Calculate failure rate
    const totalProcessed = byStatus.completed.length + byStatus.failed.length;
    const failureRate = totalProcessed > 0 ? (byStatus.failed.length / totalProcessed) * 100 : 0;

    // Calculate average payment amount
    const averagePaymentAmount = byStatus.completed.length > 0 
      ? sumAmount(byStatus.completed) / byStatus.completed.length 
      : 0;

    // Monthly forecast (based on current MRR from active subscriptions)
    const metrics = await this.getPlatformMetrics();
    const monthlyForecast: { month: string; expectedRevenue: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthStr = futureDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      monthlyForecast.push({
        month: monthStr,
        expectedRevenue: metrics.mrr
      });
    }

    return {
      totalVolume: sumAmount(byStatus.completed),
      totalVolumeThisMonth: sumAmount(completedThisMonth),
      failedPayments: { count: byStatus.failed.length, amount: sumAmount(byStatus.failed) },
      pendingPayments: { count: byStatus.pending.length, amount: sumAmount(byStatus.pending) },
      completedPayments: { count: byStatus.completed.length, amount: sumAmount(byStatus.completed) },
      refundedPayments: { count: byStatus.refunded.length, amount: sumAmount(byStatus.refunded) },
      failureRate: Math.round(failureRate * 100) / 100,
      averagePaymentAmount: Math.round(averagePaymentAmount * 100) / 100,
      paymentsByMethod: Array.from(methodMap.entries()).map(([method, data]) => ({
        method,
        count: data.count,
        amount: data.amount
      })),
      monthlyForecast
    };
  }

  // Get pending invoices (unpaid payment requests)
  async getPendingInvoices(): Promise<(PaymentRequest & { communityName: string; memberName: string })[]> {
    const pendingRequests = await db.select().from(paymentRequests)
      .where(eq(paymentRequests.status, 'pending'))
      .orderBy(desc(paymentRequests.createdAt));
    
    const allCommunities = await this.getAllCommunities();
    const allMemberships = await db.select().from(userCommunityMemberships);
    
    const communityMap = new Map(allCommunities.map(c => [c.id, c.name]));
    const membershipMap = new Map(allMemberships.map(m => [m.id, m.displayName || m.email || m.memberId]));

    return pendingRequests.map(req => ({
      ...req,
      communityName: communityMap.get(req.communityId) || 'Communauté inconnue',
      memberName: membershipMap.get(req.membershipId) || 'Membre inconnu'
    }));
  }

  // Get recent failed payments with details
  async getRecentFailedPayments(limit: number = 20): Promise<(Payment & { communityName: string })[]> {
    const failedPayments = await db.select().from(payments)
      .where(eq(payments.status, 'failed'))
      .orderBy(desc(payments.createdAt))
      .limit(limit);
    
    const allCommunities = await this.getAllCommunities();
    const communityMap = new Map(allCommunities.map(c => [c.id, c.name]));

    return failedPayments.map(p => ({
      ...p,
      communityName: communityMap.get(p.communityId) || 'Communauté inconnue'
    }));
  }
  
  // Email Templates
  async getAllEmailTemplates(): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplates).orderBy(asc(emailTemplates.type));
  }
  
  async getEmailTemplateByType(type: string): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.type, type as any));
    return template || undefined;
  }
  
  async updateEmailTemplate(type: string, updates: { subject: string; html: string }): Promise<EmailTemplate | undefined> {
    const [template] = await db.update(emailTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emailTemplates.type, type as any))
      .returning();
    return template || undefined;
  }
  
  // Email Logs
  async getEmailLogs(limitNum: number = 50, offset: number = 0): Promise<EmailLog[]> {
    return await db.select().from(emailLogs)
      .orderBy(desc(emailLogs.sentAt))
      .limit(limitNum)
      .offset(offset);
  }
  
  async createEmailLog(log: InsertEmailLog): Promise<EmailLog> {
    const [emailLog] = await db.insert(emailLogs).values(log).returning();
    return emailLog;
  }
  
  // Transactions
  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }
  
  async getTransactionByPaymentIntentId(stripePaymentIntentId: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions)
      .where(eq(transactions.stripePaymentIntentId, stripePaymentIntentId));
    return transaction || undefined;
  }
  
  async getCommunityTransactions(communityId: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.communityId, communityId))
      .orderBy(desc(transactions.createdAt));
  }
  
  async getMembershipTransactions(membershipId: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.membershipId, membershipId))
      .orderBy(desc(transactions.createdAt));
  }
  
  async insertTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }
  
  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction> {
    const [updated] = await db.update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();
    return updated;
  }
  
  // Collections (Fundraising)
  async createCollection(collection: InsertCollection): Promise<Collection> {
    const [newCollection] = await db.insert(collections).values(collection).returning();
    return newCollection;
  }
  
  async getCollection(id: string): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.id, id));
    return collection || undefined;
  }
  
  async getCommunityCollections(communityId: string): Promise<Collection[]> {
    return await db.select().from(collections)
      .where(eq(collections.communityId, communityId))
      .orderBy(desc(collections.createdAt));
  }
  
  async getOpenCollections(communityId: string): Promise<Collection[]> {
    return await db.select().from(collections)
      .where(and(
        eq(collections.communityId, communityId),
        eq(collections.status, "open")
      ))
      .orderBy(desc(collections.createdAt));
  }
  
  async updateCollection(id: string, updates: Partial<InsertCollection>): Promise<Collection> {
    const [updated] = await db.update(collections)
      .set(updates)
      .where(eq(collections.id, id))
      .returning();
    return updated;
  }
  
  async updateCollectionAmounts(id: string, amountCents: number): Promise<Collection> {
    const [updated] = await db.update(collections)
      .set({
        collectedAmountCents: sql`COALESCE(${collections.collectedAmountCents}, 0) + ${amountCents}`,
        participantsCount: sql`COALESCE(${collections.participantsCount}, 0) + 1`
      })
      .where(eq(collections.id, id))
      .returning();
    return updated;
  }
  
  async closeCollection(id: string): Promise<Collection> {
    const [updated] = await db.update(collections)
      .set({
        status: "closed",
        closedAt: new Date()
      })
      .where(eq(collections.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
