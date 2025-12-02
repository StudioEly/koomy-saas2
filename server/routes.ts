import type { Express } from "express";
import type { Server } from "http";
import { storage, MemberLimitReachedError, PlanDowngradeNotAllowedError } from "./storage";
import {
  insertUserSchema, insertCommunitySchema, insertMembershipSchema,
  insertNewsSchema, insertEventSchema, insertTicketSchema, insertMessageSchema,
  insertMembershipFeeSchema, insertPaymentRequestSchema, insertPaymentSchema,
  insertAccountSchema, insertCommercialContactSchema, insertSectionSchema,
  insertFaqSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import OpenAI from "openai";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import bcrypt from "bcryptjs";

function generateClaimCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // =====================================================
  // PUBLIC APP AUTHENTICATION (Koomy Accounts)
  // =====================================================
  
  app.post("/api/accounts/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      const existingAccount = await storage.getAccountByEmail(email);
      if (existingAccount) {
        return res.status(409).json({ error: "An account with this email already exists" });
      }
      
      const account = await storage.createAccount({
        email,
        passwordHash: await hashPassword(password),
        firstName: firstName || null,
        lastName: lastName || null
      });
      
      const { passwordHash, ...accountWithoutPassword } = account;
      
      const memberships = await storage.getAccountMemberships(account.id);
      
      return res.status(201).json({
        account: accountWithoutPassword,
        memberships
      });
    } catch (error) {
      console.error("Account registration error:", error);
      return res.status(500).json({ error: "Registration failed" });
    }
  });
  
  app.post("/api/accounts/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const account = await storage.getAccountByEmail(email);
      if (!account) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      if (!await verifyPassword(password, account.passwordHash)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const { passwordHash, ...accountWithoutPassword } = account;
      const memberships = await storage.getAccountMemberships(account.id);
      
      return res.json({
        account: accountWithoutPassword,
        memberships
      });
    } catch (error) {
      console.error("Account login error:", error);
      return res.status(500).json({ error: "Login failed" });
    }
  });
  
  app.get("/api/accounts/:id", async (req, res) => {
    try {
      const account = await storage.getAccount(req.params.id);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      const { passwordHash, ...accountWithoutPassword } = account;
      return res.json(accountWithoutPassword);
    } catch (error) {
      console.error("Get account error:", error);
      return res.status(500).json({ error: "Failed to fetch account" });
    }
  });
  
  app.get("/api/accounts/:id/memberships", async (req, res) => {
    try {
      const memberships = await storage.getAccountMemberships(req.params.id);
      
      const membershipsWithCommunity = await Promise.all(
        memberships.map(async (membership) => {
          const community = await storage.getCommunity(membership.communityId);
          return { ...membership, community };
        })
      );
      
      return res.json(membershipsWithCommunity);
    } catch (error) {
      console.error("Get account memberships error:", error);
      return res.status(500).json({ error: "Failed to fetch memberships" });
    }
  });
  
  app.post("/api/memberships/claim", async (req, res) => {
    try {
      const { claimCode, accountId } = req.body;
      
      if (!claimCode || !accountId) {
        return res.status(400).json({ error: "Claim code and account ID are required" });
      }
      
      const normalizedCode = claimCode.toUpperCase().replace(/\s/g, '');
      
      const membership = await storage.getMembershipByClaimCode(normalizedCode);
      if (!membership) {
        return res.status(404).json({ error: "Invalid claim code" });
      }
      
      if (membership.accountId) {
        return res.status(409).json({ error: "This membership card has already been claimed" });
      }
      
      const claimedMembership = await storage.claimMembership(normalizedCode, accountId);
      if (!claimedMembership) {
        return res.status(500).json({ error: "Failed to claim membership" });
      }
      
      const community = await storage.getCommunity(claimedMembership.communityId);
      
      return res.json({ 
        membership: claimedMembership,
        community,
        message: "Membership card successfully linked to your account!"
      });
    } catch (error) {
      console.error("Claim membership error:", error);
      return res.status(500).json({ error: "Failed to claim membership" });
    }
  });
  
  app.get("/api/memberships/verify/:claimCode", async (req, res) => {
    try {
      const normalizedCode = req.params.claimCode.toUpperCase().replace(/[\s-]/g, '');
      const membership = await storage.getMembershipByClaimCode(normalizedCode);
      
      if (!membership) {
        return res.status(404).json({ error: "Invalid claim code" });
      }
      
      if (membership.accountId) {
        return res.status(409).json({ error: "This membership card has already been claimed" });
      }
      
      const community = await storage.getCommunity(membership.communityId);
      
      return res.json({
        valid: true,
        displayName: membership.displayName,
        communityName: community?.name,
        memberId: membership.memberId
      });
    } catch (error) {
      console.error("Verify claim code error:", error);
      return res.status(500).json({ error: "Failed to verify claim code" });
    }
  });

  // =====================================================
  // ADMIN/BACK-OFFICE AUTHENTICATION (Users)
  // =====================================================
  
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }
      
      const memberships = await storage.getUserMemberships(user.id);
      
      const membershipsWithCommunities = await Promise.all(
        memberships.map(async (membership) => {
          const community = await storage.getCommunity(membership.communityId);
          return {
            ...membership,
            community: community ? {
              id: community.id,
              name: community.name,
              logo: community.logo
            } : null
          };
        })
      );
      
      return res.json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          phone: user.phone
        },
        memberships: membershipsWithCommunities
      });
    } catch (error) {
      console.error("Admin login error:", error);
      return res.status(500).json({ error: "Échec de connexion" });
    }
  });

  // Admin Registration (creates user + community + membership)
  app.post("/api/admin/register", async (req, res) => {
    try {
      const { 
        firstName, lastName, email, phone, password,
        communityName, communityType, communityTypeOther, category, description,
        address, city, postalCode, country,
        contactEmail, contactPhone, welcomeMessage,
        membershipFeeEnabled, membershipFeeAmount, currency, billingPeriod
      } = req.body;
      
      if (!firstName || !lastName || !email || !password || !communityName || !communityType) {
        return res.status(400).json({ error: "Tous les champs obligatoires doivent être remplis" });
      }
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Cet email est déjà utilisé" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        firstName,
        lastName,
        email,
        phone: phone || null,
        password: hashedPassword,
        avatar: null,
        globalRole: null
      });
      
      // Create community with all fields
      const community = await storage.createCommunity({
        name: communityName,
        ownerId: user.id,
        communityType: communityType,
        communityTypeOther: communityTypeOther || null,
        category: category || null,
        description: description || null,
        address: address || null,
        city: city || null,
        postalCode: postalCode || null,
        country: country || "France",
        contactEmail: contactEmail || email,
        contactPhone: contactPhone || phone || null,
        welcomeMessage: welcomeMessage || null,
        membershipFeeEnabled: membershipFeeEnabled || false,
        membershipFeeAmount: membershipFeeAmount || null,
        currency: currency || "EUR",
        billingPeriod: billingPeriod || "yearly",
        planId: "free",
        subscriptionStatus: "active",
        primaryColor: "207 100% 63%",
        secondaryColor: "350 80% 55%"
      });
      
      // Create membership (admin role)
      const memberId = `ADMIN-${Date.now().toString(36).toUpperCase()}`;
      const membership = await storage.createMembership({
        userId: user.id,
        communityId: community.id,
        memberId,
        role: "admin",
        displayName: `${firstName} ${lastName}`,
        status: "active",
        contributionStatus: "up_to_date"
      });
      
      return res.status(201).json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          phone: user.phone
        },
        memberships: [{
          ...membership,
          community: {
            id: community.id,
            name: community.name,
            logo: community.logo,
            communityType: community.communityType
          }
        }]
      });
    } catch (error) {
      console.error("Admin registration error:", error);
      return res.status(500).json({ error: "Échec de l'inscription" });
    }
  });

  // =====================================================
  // PLATFORM SUPER ADMIN AUTHENTICATION
  // =====================================================
  
  app.post("/api/platform/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }
      
      if (user.globalRole !== 'platform_super_admin') {
        return res.status(403).json({ error: "Accès non autorisé - Réservé aux administrateurs plateforme" });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }
      
      return res.json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          globalRole: user.globalRole
        }
      });
    } catch (error) {
      console.error("Platform login error:", error);
      return res.status(500).json({ error: "Échec de connexion" });
    }
  });

  // Communities Routes
  app.get("/api/communities", async (req, res) => {
    try {
      const communities = await storage.getAllCommunities();
      return res.json(communities);
    } catch (error) {
      console.error("Get communities error:", error);
      return res.status(500).json({ error: "Failed to fetch communities" });
    }
  });

  app.get("/api/communities/:id", async (req, res) => {
    try {
      const community = await storage.getCommunity(req.params.id);
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }
      return res.json(community);
    } catch (error) {
      console.error("Get community error:", error);
      return res.status(500).json({ error: "Failed to fetch community" });
    }
  });

  app.post("/api/communities", async (req, res) => {
    try {
      const validated = insertCommunitySchema.parse(req.body);
      const community = await storage.createCommunity(validated);
      return res.status(201).json(community);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Create community error:", error);
      return res.status(500).json({ error: "Failed to create community" });
    }
  });

  app.put("/api/communities/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const community = await storage.getCommunity(id);
      if (!community) {
        return res.status(404).json({ error: "Communauté non trouvée" });
      }
      
      const updates = insertCommunitySchema.partial().parse(req.body);
      const updatedCommunity = await storage.updateCommunity(id, updates);
      return res.json(updatedCommunity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Update community error:", error);
      return res.status(500).json({ error: "Échec de la mise à jour de la communauté" });
    }
  });

  app.get("/api/communities/:communityId/memberships", async (req, res) => {
    try {
      const memberships = await storage.getCommunityMemberships(req.params.communityId);
      return res.json(memberships);
    } catch (error) {
      console.error("Get community memberships error:", error);
      return res.status(500).json({ error: "Failed to fetch memberships" });
    }
  });

  // Plans Routes
  app.get("/api/plans", async (req, res) => {
    try {
      const publicOnly = req.query.public === "true";
      const plans = publicOnly 
        ? await storage.getPublicPlans() 
        : await storage.getAllPlans();
      return res.json(plans);
    } catch (error) {
      console.error("Get plans error:", error);
      return res.status(500).json({ error: "Failed to fetch plans" });
    }
  });

  app.get("/api/plans/:id", async (req, res) => {
    try {
      const plan = await storage.getPlan(req.params.id);
      if (!plan) {
        return res.status(404).json({ error: "Plan non trouvé" });
      }
      return res.json(plan);
    } catch (error) {
      console.error("Get plan error:", error);
      return res.status(500).json({ error: "Failed to fetch plan" });
    }
  });

  app.get("/api/plans/code/:code", async (req, res) => {
    try {
      const plan = await storage.getPlanByCode(req.params.code);
      if (!plan) {
        return res.status(404).json({ error: "Plan non trouvé" });
      }
      return res.json(plan);
    } catch (error) {
      console.error("Get plan by code error:", error);
      return res.status(500).json({ error: "Failed to fetch plan" });
    }
  });

  // Community Plan Management
  app.get("/api/communities/:id/quota", async (req, res) => {
    try {
      const quota = await storage.checkMemberQuota(req.params.id);
      return res.json(quota);
    } catch (error) {
      console.error("Check member quota error:", error);
      return res.status(500).json({ error: "Failed to check member quota" });
    }
  });

  app.patch("/api/communities/:id/plan", async (req, res) => {
    try {
      const { planId } = req.body;
      if (!planId) {
        return res.status(400).json({ error: "planId est requis" });
      }
      
      const community = await storage.changeCommunityPlan(req.params.id, planId);
      return res.json(community);
    } catch (error: any) {
      if (error.name === "PlanDowngradeNotAllowedError") {
        return res.status(400).json({ error: error.message });
      }
      console.error("Change community plan error:", error);
      return res.status(500).json({ error: "Failed to change community plan" });
    }
  });

  // Users Routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validated = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validated);
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Create user error:", error);
      return res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Memberships Routes
  app.get("/api/users/:userId/memberships", async (req, res) => {
    try {
      const memberships = await storage.getUserMemberships(req.params.userId);
      return res.json(memberships);
    } catch (error) {
      console.error("Get user memberships error:", error);
      return res.status(500).json({ error: "Failed to fetch memberships" });
    }
  });

  app.get("/api/communities/:communityId/members", async (req, res) => {
    try {
      const memberships = await storage.getCommunityMemberships(req.params.communityId);
      
      // Fetch user details for each membership
      const membersWithDetails = await Promise.all(
        memberships.map(async (membership) => {
          if (!membership.userId) {
            return {
              ...membership,
              user: null
            };
          }
          const user = await storage.getUser(membership.userId);
          if (!user) return null;
          const { password, ...userWithoutPassword } = user;
          return {
            ...membership,
            user: userWithoutPassword
          };
        })
      );
      
      return res.json(membersWithDetails.filter(m => m !== null));
    } catch (error) {
      console.error("Get community members error:", error);
      return res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  app.post("/api/memberships", async (req, res) => {
    try {
      const validated = insertMembershipSchema.parse(req.body);
      
      const claimCode = generateClaimCode();
      
      const membership = await storage.createMembership({
        ...validated,
        claimCode,
        displayName: validated.displayName || null,
        email: validated.email || null
      });
      
      return res.status(201).json(membership);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      if (error instanceof MemberLimitReachedError) {
        return res.status(403).json({ 
          error: error.message,
          code: "MEMBER_LIMIT_REACHED"
        });
      }
      console.error("Create membership error:", error);
      return res.status(500).json({ error: "Failed to create membership" });
    }
  });
  
  app.post("/api/memberships/:id/regenerate-code", async (req, res) => {
    try {
      const membership = await storage.getMembershipById(req.params.id);
      if (!membership) {
        return res.status(404).json({ error: "Membership not found" });
      }
      
      if (membership.accountId) {
        return res.status(400).json({ error: "Cannot regenerate code for a claimed membership" });
      }
      
      const newCode = generateClaimCode();
      const updated = await storage.updateMembership(req.params.id, { claimCode: newCode });
      
      return res.json(updated);
    } catch (error) {
      console.error("Regenerate claim code error:", error);
      return res.status(500).json({ error: "Failed to regenerate claim code" });
    }
  });

  app.patch("/api/memberships/:id", async (req, res) => {
    try {
      const membership = await storage.updateMembership(req.params.id, req.body);
      return res.json(membership);
    } catch (error) {
      console.error("Update membership error:", error);
      return res.status(500).json({ error: "Failed to update membership" });
    }
  });

  // =====================================================
  // FILE UPLOAD ROUTES (Object Storage)
  // =====================================================

  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/uploads/logo", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL("logos");
      return res.json({ uploadURL });
    } catch (error) {
      console.error("Get upload URL error:", error);
      return res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.post("/api/uploads/logo/finalize", async (req, res) => {
    try {
      const { uploadURL } = req.body;
      if (!uploadURL) {
        return res.status(400).json({ error: "uploadURL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

      return res.json({ objectPath });
    } catch (error) {
      console.error("Finalize upload error:", error);
      return res.status(500).json({ error: "Failed to finalize upload" });
    }
  });

  app.post("/api/uploads/image", async (req, res) => {
    try {
      const { folder = "images" } = req.body;
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL(folder);
      return res.json({ uploadURL });
    } catch (error) {
      console.error("Get image upload URL error:", error);
      return res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.post("/api/uploads/image/finalize", async (req, res) => {
    try {
      const { uploadURL } = req.body;
      if (!uploadURL) {
        return res.status(400).json({ error: "uploadURL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

      return res.json({ objectPath });
    } catch (error) {
      console.error("Finalize image upload error:", error);
      return res.status(500).json({ error: "Failed to finalize upload" });
    }
  });

  // Sections Routes
  app.get("/api/communities/:communityId/sections", async (req, res) => {
    try {
      const sections = await storage.getCommunitySections(req.params.communityId);
      return res.json(sections);
    } catch (error) {
      console.error("Get sections error:", error);
      return res.status(500).json({ error: "Failed to fetch sections" });
    }
  });

  app.post("/api/sections", async (req, res) => {
    try {
      const validated = insertSectionSchema.parse(req.body);
      const section = await storage.createSection(validated);
      return res.status(201).json(section);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Create section error:", error);
      return res.status(500).json({ error: "Failed to create section" });
    }
  });

  // Dashboard Stats Route
  app.get("/api/communities/:communityId/dashboard", async (req, res) => {
    try {
      const { communityId } = req.params;
      
      const [memberships, news, events, tickets] = await Promise.all([
        storage.getCommunityMemberships(communityId),
        storage.getCommunityNews(communityId),
        storage.getCommunityEvents(communityId),
        storage.getCommunityTickets(communityId)
      ]);
      
      const now = new Date();
      const thisMonth = now.getMonth();
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const thisYear = now.getFullYear();
      
      const membersThisMonth = memberships.filter(m => {
        const joinDate = new Date(m.joinDate);
        return joinDate.getMonth() === thisMonth && joinDate.getFullYear() === thisYear;
      }).length;
      
      const membersLastMonth = memberships.filter(m => {
        const joinDate = new Date(m.joinDate);
        return joinDate.getMonth() === lastMonth && (lastMonth === 11 ? joinDate.getFullYear() === thisYear - 1 : joinDate.getFullYear() === thisYear);
      }).length;
      
      const memberGrowth = membersLastMonth > 0 
        ? ((membersThisMonth - membersLastMonth) / membersLastMonth * 100).toFixed(1)
        : membersThisMonth > 0 ? "100" : "0";
      
      const upcomingEvents = events.filter(e => new Date(e.date) > now);
      
      const monthlyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(thisYear, thisMonth - i, 1);
        const monthName = date.toLocaleString('fr-FR', { month: 'short' });
        const monthMembers = memberships.filter(m => {
          const joinDate = new Date(m.joinDate);
          return joinDate <= new Date(date.getFullYear(), date.getMonth() + 1, 0);
        }).length;
        monthlyData.push({ name: monthName, adherents: monthMembers });
      }
      
      return res.json({
        stats: {
          totalMembers: memberships.length,
          membersThisMonth,
          memberGrowth: parseFloat(memberGrowth as string),
          totalNews: news.length,
          newsThisWeek: news.filter(n => {
            const pubDate = new Date(n.publishedAt || Date.now());
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return pubDate > weekAgo;
          }).length,
          totalEvents: events.length,
          upcomingEvents: upcomingEvents.length,
          openTickets: tickets.filter(t => t.status === 'open').length
        },
        monthlyData,
        recentNews: news.slice(0, 5),
        upcomingEvents: upcomingEvents.slice(0, 5)
      });
    } catch (error) {
      console.error("Get dashboard error:", error);
      return res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  // News Routes
  app.get("/api/communities/:communityId/news", async (req, res) => {
    try {
      const news = await storage.getCommunityNews(req.params.communityId);
      return res.json(news);
    } catch (error) {
      console.error("Get news error:", error);
      return res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const article = await storage.getNewsArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      return res.json(article);
    } catch (error) {
      console.error("Get news article error:", error);
      return res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  app.post("/api/news", async (req, res) => {
    try {
      const validated = insertNewsSchema.parse(req.body);
      const article = await storage.createNews(validated);
      return res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Create news error:", error);
      return res.status(500).json({ error: "Failed to create article" });
    }
  });

  app.patch("/api/news/:id", async (req, res) => {
    try {
      const article = await storage.updateNews(req.params.id, req.body);
      return res.json(article);
    } catch (error) {
      console.error("Update news error:", error);
      return res.status(500).json({ error: "Failed to update article" });
    }
  });

  // Events Routes
  app.get("/api/communities/:communityId/events", async (req, res) => {
    try {
      const events = await storage.getCommunityEvents(req.params.communityId);
      return res.json(events);
    } catch (error) {
      console.error("Get events error:", error);
      return res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      return res.json(event);
    } catch (error) {
      console.error("Get event error:", error);
      return res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const validated = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validated);
      return res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Create event error:", error);
      return res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.patch("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.updateEvent(req.params.id, req.body);
      return res.json(event);
    } catch (error) {
      console.error("Update event error:", error);
      return res.status(500).json({ error: "Failed to update event" });
    }
  });

  // Support Tickets Routes
  app.get("/api/tickets", async (req, res) => {
    try {
      const tickets = await storage.getAllTickets();
      return res.json(tickets);
    } catch (error) {
      console.error("Get all tickets error:", error);
      return res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.get("/api/users/:userId/tickets", async (req, res) => {
    try {
      const tickets = await storage.getUserTickets(req.params.userId);
      return res.json(tickets);
    } catch (error) {
      console.error("Get user tickets error:", error);
      return res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.get("/api/communities/:communityId/tickets", async (req, res) => {
    try {
      const tickets = await storage.getCommunityTickets(req.params.communityId);
      return res.json(tickets);
    } catch (error) {
      console.error("Get community tickets error:", error);
      return res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const validated = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(validated);
      return res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Create ticket error:", error);
      return res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  app.patch("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.updateTicket(req.params.id, req.body);
      return res.json(ticket);
    } catch (error) {
      console.error("Update ticket error:", error);
      return res.status(500).json({ error: "Failed to update ticket" });
    }
  });

  // FAQs Routes
  app.get("/api/faqs", async (req, res) => {
    try {
      const { role } = req.query;
      let faqs;
      
      if (role && typeof role === "string") {
        faqs = await storage.getFAQsByRole(role);
      } else {
        faqs = await storage.getAllFAQs();
      }
      
      return res.json(faqs);
    } catch (error) {
      console.error("Get FAQs error:", error);
      return res.status(500).json({ error: "Failed to fetch FAQs" });
    }
  });

  app.get("/api/communities/:communityId/faqs", async (req, res) => {
    try {
      const faqs = await storage.getCommunityFAQs(req.params.communityId);
      return res.json(faqs);
    } catch (error) {
      console.error("Get community FAQs error:", error);
      return res.status(500).json({ error: "Failed to fetch FAQs" });
    }
  });

  app.post("/api/faqs", async (req, res) => {
    try {
      const validated = insertFaqSchema.parse(req.body);
      const faq = await storage.createFAQ(validated);
      return res.status(201).json(faq);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Create FAQ error:", error);
      return res.status(500).json({ error: "Failed to create FAQ" });
    }
  });

  // Messages Routes
  app.get("/api/communities/:communityId/messages/:conversationId", async (req, res) => {
    try {
      const { communityId, conversationId } = req.params;
      const messages = await storage.getCommunityMessages(communityId, conversationId);
      return res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validated = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validated);
      return res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Create message error:", error);
      return res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.patch("/api/messages/:id/read", async (req, res) => {
    try {
      await storage.markMessageRead(req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Mark message read error:", error);
      return res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  // Membership Fees Routes
  app.get("/api/communities/:communityId/fees", async (req, res) => {
    try {
      const fees = await storage.getCommunityFees(req.params.communityId);
      return res.json(fees);
    } catch (error) {
      console.error("Get fees error:", error);
      return res.status(500).json({ error: "Failed to fetch fees" });
    }
  });

  app.post("/api/fees", async (req, res) => {
    try {
      const validated = insertMembershipFeeSchema.parse(req.body);
      const fee = await storage.createFee(validated);
      return res.status(201).json(fee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Create fee error:", error);
      return res.status(500).json({ error: "Failed to create fee" });
    }
  });

  app.patch("/api/fees/:id", async (req, res) => {
    try {
      const fee = await storage.updateFee(req.params.id, req.body);
      return res.json(fee);
    } catch (error) {
      console.error("Update fee error:", error);
      return res.status(500).json({ error: "Failed to update fee" });
    }
  });

  // Payment Requests Routes
  app.get("/api/memberships/:membershipId/payment-requests", async (req, res) => {
    try {
      const requests = await storage.getMemberPaymentRequests(req.params.membershipId);
      return res.json(requests);
    } catch (error) {
      console.error("Get member payment requests error:", error);
      return res.status(500).json({ error: "Failed to fetch payment requests" });
    }
  });

  app.get("/api/communities/:communityId/payment-requests", async (req, res) => {
    try {
      const requests = await storage.getCommunityPaymentRequests(req.params.communityId);
      return res.json(requests);
    } catch (error) {
      console.error("Get community payment requests error:", error);
      return res.status(500).json({ error: "Failed to fetch payment requests" });
    }
  });

  app.post("/api/payment-requests", async (req, res) => {
    try {
      const validated = insertPaymentRequestSchema.parse(req.body);
      const request = await storage.createPaymentRequest(validated);
      return res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Create payment request error:", error);
      return res.status(500).json({ error: "Failed to create payment request" });
    }
  });

  app.patch("/api/payment-requests/:id", async (req, res) => {
    try {
      const request = await storage.updatePaymentRequest(req.params.id, req.body);
      return res.json(request);
    } catch (error) {
      console.error("Update payment request error:", error);
      return res.status(500).json({ error: "Failed to update payment request" });
    }
  });

  // Payments Routes
  app.get("/api/memberships/:membershipId/payments", async (req, res) => {
    try {
      const payments = await storage.getMemberPayments(req.params.membershipId);
      return res.json(payments);
    } catch (error) {
      console.error("Get member payments error:", error);
      return res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.get("/api/communities/:communityId/payments", async (req, res) => {
    try {
      const payments = await storage.getCommunityPayments(req.params.communityId);
      return res.json(payments);
    } catch (error) {
      console.error("Get community payments error:", error);
      return res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validated = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validated);
      return res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Create payment error:", error);
      return res.status(500).json({ error: "Failed to create payment" });
    }
  });

  // Process payment (mock Stripe integration - will update membership status)
  app.post("/api/payments/:id/process", async (req, res) => {
    try {
      const payment = await storage.getPayment(req.params.id);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      // Mock payment processing - in production, integrate with Stripe
      const updatedPayment = await storage.updatePayment(req.params.id, {
        status: "completed",
        completedAt: new Date(),
        paymentMethod: req.body.paymentMethod || "card"
      });

      // Update payment request if linked
      if (payment.paymentRequestId) {
        await storage.updatePaymentRequest(payment.paymentRequestId, {
          status: "paid",
          paidAt: new Date()
        });
      }

      // Update membership contribution status
      const membership = await storage.getMembershipById(payment.membershipId);
      if (membership) {
        const nextDueDate = new Date();
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1); // 1 year from now
        
        await storage.updateMembership(membership.id, {
          contributionStatus: "up_to_date",
          nextDueDate: nextDueDate
        });
      }

      return res.json({ 
        success: true, 
        payment: updatedPayment,
        message: "Payment processed successfully" 
      });
    } catch (error) {
      console.error("Process payment error:", error);
      return res.status(500).json({ error: "Failed to process payment" });
    }
  });

  // =====================================================
  // PLATFORM ADMIN: FULL ACCESS MANAGEMENT
  // =====================================================

  // Helper function to verify platform super admin
  const verifyPlatformAdmin = async (userId: string | undefined): Promise<{ valid: boolean; user?: any; error?: string }> => {
    if (!userId) {
      return { valid: false, error: "userId is required for platform admin operations" };
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return { valid: false, error: "User not found" };
    }
    if (user.globalRole !== 'platform_super_admin') {
      return { valid: false, error: "Accès non autorisé - Réservé aux super administrateurs plateforme" };
    }
    return { valid: true, user };
  };

  // Grant full access to a community (platform super admin only)
  app.post("/api/platform/communities/:id/full-access", async (req, res) => {
    try {
      const { grantedBy, reason, expiresAt } = req.body;

      // Verify platform admin authorization
      const authResult = await verifyPlatformAdmin(grantedBy);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      if (!reason) {
        return res.status(400).json({ error: "reason is required" });
      }

      // Parse expiresAt if provided (can be null for permanent access)
      const expiresAtDate = expiresAt ? new Date(expiresAt) : null;

      const community = await storage.grantFullAccess(
        req.params.id,
        grantedBy,
        reason,
        expiresAtDate
      );

      return res.json({ 
        success: true, 
        community,
        message: expiresAtDate 
          ? `Accès complet accordé jusqu'au ${expiresAtDate.toLocaleDateString('fr-FR')}`
          : "Accès complet permanent accordé"
      });
    } catch (error: any) {
      console.error("Grant full access error:", error);
      return res.status(500).json({ error: error.message || "Failed to grant full access" });
    }
  });

  // Revoke full access from a community (platform super admin only)
  app.delete("/api/platform/communities/:id/full-access", async (req, res) => {
    try {
      // Get userId from query params or body
      const userId = req.query.userId as string || req.body?.userId;
      
      // Verify platform admin authorization
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const community = await storage.revokeFullAccess(req.params.id);

      return res.json({ 
        success: true, 
        community,
        message: "Accès complet révoqué"
      });
    } catch (error: any) {
      console.error("Revoke full access error:", error);
      return res.status(500).json({ error: error.message || "Failed to revoke full access" });
    }
  });

  // Get all communities with full access (platform super admin only)
  app.get("/api/platform/full-access-communities", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      // Verify platform admin authorization
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const communities = await storage.getCommunitiesWithFullAccess();
      return res.json(communities);
    } catch (error: any) {
      console.error("Get full access communities error:", error);
      return res.status(500).json({ error: "Failed to get communities with full access" });
    }
  });

  // =====================================================
  // PLATFORM FINANCIAL METRICS (Platform Super Admin)
  // =====================================================

  // Get comprehensive platform metrics
  app.get("/api/platform/metrics", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      // Verify platform admin authorization
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const metrics = await storage.getPlatformMetrics();
      return res.json(metrics);
    } catch (error: any) {
      console.error("Get platform metrics error:", error);
      return res.status(500).json({ error: "Failed to get platform metrics" });
    }
  });

  // Get monthly revenue history (last 12 months)
  app.get("/api/platform/revenue-history", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      // Verify platform admin authorization
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const history = await storage.getMonthlyRevenueHistory();
      return res.json(history);
    } catch (error: any) {
      console.error("Get revenue history error:", error);
      return res.status(500).json({ error: "Failed to get revenue history" });
    }
  });

  // Get top communities by revenue
  app.get("/api/platform/top-communities", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Verify platform admin authorization
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const topCommunities = await storage.getTopCommunitiesByRevenue(limit);
      return res.json(topCommunities);
    } catch (error: any) {
      console.error("Get top communities error:", error);
      return res.status(500).json({ error: "Failed to get top communities" });
    }
  });

  // Get all platform payments with community info
  app.get("/api/platform/payments", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      // Verify platform admin authorization
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const payments = await storage.getAllPlatformPayments();
      return res.json(payments);
    } catch (error: any) {
      console.error("Get platform payments error:", error);
      return res.status(500).json({ error: "Failed to get platform payments" });
    }
  });

  // =====================================================
  // PLATFORM COMMUNITY ANALYTICS
  // =====================================================

  // Get top communities by members
  app.get("/api/platform/analytics/top-by-members", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const topCommunities = await storage.getTopCommunitiesByMembers(limit);
      return res.json(topCommunities);
    } catch (error: any) {
      console.error("Get top communities by members error:", error);
      return res.status(500).json({ error: "Failed to get top communities by members" });
    }
  });

  // Get at-risk communities
  app.get("/api/platform/analytics/at-risk", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const atRiskCommunities = await storage.getAtRiskCommunities();
      return res.json(atRiskCommunities);
    } catch (error: any) {
      console.error("Get at-risk communities error:", error);
      return res.status(500).json({ error: "Failed to get at-risk communities" });
    }
  });

  // Get member growth history
  app.get("/api/platform/analytics/member-growth", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const growthHistory = await storage.getMemberGrowthHistory();
      return res.json(growthHistory);
    } catch (error: any) {
      console.error("Get member growth history error:", error);
      return res.status(500).json({ error: "Failed to get member growth history" });
    }
  });

  // Get plan utilization rates
  app.get("/api/platform/analytics/plan-utilization", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const utilizationRates = await storage.getPlanUtilizationRates();
      return res.json(utilizationRates);
    } catch (error: any) {
      console.error("Get plan utilization rates error:", error);
      return res.status(500).json({ error: "Failed to get plan utilization rates" });
    }
  });

  // Get community registrations timeline
  app.get("/api/platform/analytics/registrations", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const timeline = await storage.getCommunityRegistrationsTimeline();
      return res.json(timeline);
    } catch (error: any) {
      console.error("Get registrations timeline error:", error);
      return res.status(500).json({ error: "Failed to get registrations timeline" });
    }
  });

  // Get geographic distribution
  app.get("/api/platform/analytics/geographic", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const distribution = await storage.getCommunityGeographicDistribution();
      return res.json(distribution);
    } catch (error: any) {
      console.error("Get geographic distribution error:", error);
      return res.status(500).json({ error: "Failed to get geographic distribution" });
    }
  });

  // =====================================================
  // PLATFORM USER MANAGEMENT
  // =====================================================

  // Get all platform users
  app.get("/api/platform/users", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const platformUsers = await storage.getPlatformUsers();
      // Remove passwords from response
      const usersWithoutPasswords = platformUsers.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
      });
      return res.json(usersWithoutPasswords);
    } catch (error: any) {
      console.error("Get platform users error:", error);
      return res.status(500).json({ error: "Failed to get platform users" });
    }
  });

  // Create platform user
  app.post("/api/platform/users", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const { email, password, firstName, lastName, globalRole } = req.body;
      
      if (!email || !password || !globalRole) {
        return res.status(400).json({ error: "Email, password, and globalRole are required" });
      }

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Un utilisateur avec cet email existe déjà" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      const user = await storage.createPlatformUser({
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        globalRole,
        avatar: null,
        phone: null
      });

      const { password: _, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      console.error("Create platform user error:", error);
      return res.status(500).json({ error: "Failed to create platform user" });
    }
  });

  // Update platform user role
  app.patch("/api/platform/users/:id/role", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const targetUserId = req.params.id;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const { globalRole } = req.body;

      // If demoting from super_admin, check if it's the last one
      const targetUser = await storage.getUser(targetUserId);
      if (targetUser?.globalRole === 'platform_super_admin' && globalRole !== 'platform_super_admin') {
        const superAdminCount = await storage.countPlatformSuperAdmins();
        if (superAdminCount <= 1) {
          return res.status(400).json({ error: "Impossible de supprimer le dernier Super Admin" });
        }
      }

      const user = await storage.updatePlatformUserRole(targetUserId, globalRole);
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Update platform user role error:", error);
      return res.status(500).json({ error: "Failed to update platform user role" });
    }
  });

  // Demote platform user (remove platform role)
  app.delete("/api/platform/users/:id/role", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const targetUserId = req.params.id;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      // Check if it's the last super admin
      const targetUser = await storage.getUser(targetUserId);
      if (targetUser?.globalRole === 'platform_super_admin') {
        const superAdminCount = await storage.countPlatformSuperAdmins();
        if (superAdminCount <= 1) {
          return res.status(400).json({ error: "Impossible de supprimer le dernier Super Admin" });
        }
      }

      const user = await storage.demotePlatformUser(targetUserId);
      const { password, ...userWithoutPassword } = user;
      return res.json({ 
        success: true, 
        message: "Rôle plateforme retiré",
        user: userWithoutPassword 
      });
    } catch (error: any) {
      console.error("Demote platform user error:", error);
      return res.status(500).json({ error: "Failed to demote platform user" });
    }
  });

  // =====================================================
  // PAYMENT TRACKING & ANALYTICS
  // =====================================================

  // Get payment analytics
  app.get("/api/platform/payments/analytics", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const analytics = await storage.getPaymentAnalytics();
      return res.json(analytics);
    } catch (error: any) {
      console.error("Get payment analytics error:", error);
      return res.status(500).json({ error: "Failed to get payment analytics" });
    }
  });

  // Get pending invoices
  app.get("/api/platform/payments/pending", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const pendingInvoices = await storage.getPendingInvoices();
      return res.json(pendingInvoices);
    } catch (error: any) {
      console.error("Get pending invoices error:", error);
      return res.status(500).json({ error: "Failed to get pending invoices" });
    }
  });

  // Get failed payments
  app.get("/api/platform/payments/failed", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const failedPayments = await storage.getRecentFailedPayments(50);
      return res.json(failedPayments);
    } catch (error: any) {
      console.error("Get failed payments error:", error);
      return res.status(500).json({ error: "Failed to get failed payments" });
    }
  });

  // Get all platform payments
  app.get("/api/platform/payments", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const allPayments = await storage.getAllPlatformPayments();
      return res.json(allPayments);
    } catch (error: any) {
      console.error("Get all payments error:", error);
      return res.status(500).json({ error: "Failed to get payments" });
    }
  });

  // Get revenue history
  app.get("/api/platform/payments/revenue-history", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const history = await storage.getMonthlyRevenueHistory();
      return res.json(history);
    } catch (error: any) {
      console.error("Get revenue history error:", error);
      return res.status(500).json({ error: "Failed to get revenue history" });
    }
  });

  // =====================================================
  // PLATFORM TICKET MANAGEMENT
  // =====================================================

  // Get all tickets with details
  app.get("/api/platform/tickets", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const tickets = await storage.getAllTicketsWithDetails();
      return res.json(tickets);
    } catch (error: any) {
      console.error("Get all tickets error:", error);
      return res.status(500).json({ error: "Failed to get tickets" });
    }
  });

  // Get single ticket with full details
  app.get("/api/platform/tickets/:id", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const ticketId = req.params.id;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const ticket = await storage.getTicketWithDetails(ticketId);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      
      // Remove password from user if present
      if (ticket.user) {
        const { password, ...userWithoutPassword } = ticket.user;
        return res.json({ ...ticket, user: userWithoutPassword });
      }
      
      return res.json(ticket);
    } catch (error: any) {
      console.error("Get ticket details error:", error);
      return res.status(500).json({ error: "Failed to get ticket details" });
    }
  });

  // Assign ticket to platform user
  app.patch("/api/platform/tickets/:id/assign", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const ticketId = req.params.id;
      const { assignedTo } = req.body;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      if (!assignedTo) {
        return res.status(400).json({ error: "assignedTo is required" });
      }

      const ticket = await storage.assignTicket(ticketId, assignedTo);
      return res.json(ticket);
    } catch (error: any) {
      console.error("Assign ticket error:", error);
      return res.status(500).json({ error: "Failed to assign ticket" });
    }
  });

  // Update ticket status
  app.patch("/api/platform/tickets/:id/status", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const ticketId = req.params.id;
      const { status } = req.body;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      if (!status) {
        return res.status(400).json({ error: "status is required" });
      }

      const updates: any = { status, lastUpdate: new Date() };
      if (status === 'resolved' || status === 'closed') {
        updates.resolvedAt = new Date();
      }

      const ticket = await storage.updateTicket(ticketId, updates);
      return res.json(ticket);
    } catch (error: any) {
      console.error("Update ticket status error:", error);
      return res.status(500).json({ error: "Failed to update ticket status" });
    }
  });

  // Add response to ticket
  app.post("/api/platform/tickets/:id/responses", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const ticketId = req.params.id;
      const { message, isInternal } = req.body;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      if (!message) {
        return res.status(400).json({ error: "message is required" });
      }

      const response = await storage.createTicketResponse({
        ticketId,
        userId,
        message,
        isInternal: isInternal || false
      });

      // Update ticket status to in_progress if it was open
      const ticket = await storage.getTicketWithDetails(ticketId);
      if (ticket && ticket.status === 'open') {
        await storage.updateTicket(ticketId, { status: 'in_progress', lastUpdate: new Date() });
      }

      return res.status(201).json(response);
    } catch (error: any) {
      console.error("Add ticket response error:", error);
      return res.status(500).json({ error: "Failed to add ticket response" });
    }
  });

  // Get ticket responses
  app.get("/api/platform/tickets/:id/responses", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const ticketId = req.params.id;
      
      const authResult = await verifyPlatformAdmin(userId);
      if (!authResult.valid) {
        return res.status(403).json({ error: authResult.error });
      }

      const responses = await storage.getTicketResponses(ticketId);
      return res.json(responses);
    } catch (error: any) {
      console.error("Get ticket responses error:", error);
      return res.status(500).json({ error: "Failed to get ticket responses" });
    }
  });

  // ChatGPT-powered Chat for Public Website
  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
  });

  const KOOMY_SYSTEM_PROMPT = `Tu es l'assistant virtuel de Koomy, une plateforme SaaS de gestion de communautés (syndicats, clubs, associations, organisations à but non lucratif).

Ton rôle est d'aider les visiteurs du site web à comprendre les fonctionnalités et les tarifs de Koomy.

Informations clés sur Koomy:

FONCTIONNALITÉS:
- Gestion complète des membres et des adhésions
- Application mobile pour les membres avec carte d'adhérent numérique (QR code)
- Messagerie interne sécurisée
- Gestion des événements et calendrier
- Publication d'actualités et communications
- Tableau de bord administrateur complet
- Gestion des cotisations et paiements
- Support multi-communautés (un utilisateur peut appartenir à plusieurs communautés)
- Rôles d'administration multi-niveaux

TARIFS:
- Gratuit: jusqu'à 100 membres, fonctionnalités essentielles
- Growth (49€/mois): jusqu'à 500 membres, toutes les fonctionnalités
- Scale (99€/mois): jusqu'à 2000 membres, support prioritaire
- Enterprise: sur mesure, pour les grandes organisations

ESSAI:
- La formule gratuite permet de tester sans engagement
- Possibilité de passer à une formule supérieure à tout moment

SUPPORT:
- Email: support@koomy.io
- Chat en ligne (présent sur le site)
- Du lundi au vendredi, 9h-18h

Règles de conversation:
1. Réponds toujours en français
2. Sois concis et professionnel
3. Si tu ne connais pas la réponse, suggère de contacter le support
4. Propose de parler à un conseiller humain si la question est complexe ou commerciale
5. Ne parle jamais de sujets sans rapport avec Koomy`;

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: KOOMY_SYSTEM_PROMPT },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content
          }))
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const reply = completion.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse.";
      
      return res.json({ reply });
    } catch (error) {
      console.error("Chat API error:", error);
      return res.status(500).json({ error: "Failed to get chat response" });
    }
  });

  // =====================================================
  // PUBLIC CONTACT FORM
  // =====================================================
  
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertCommercialContactSchema.parse(req.body);
      const contact = await storage.createCommercialContact(validatedData);
      return res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      console.error("Contact form error:", error);
      return res.status(500).json({ error: "Failed to submit contact form" });
    }
  });
  
  app.get("/api/platform/contacts", async (req, res) => {
    try {
      const contacts = await storage.getAllCommercialContacts();
      return res.json(contacts);
    } catch (error) {
      console.error("Get contacts error:", error);
      return res.status(500).json({ error: "Failed to get contacts" });
    }
  });

  // =====================================================
  // STRIPE BILLING ROUTES (Prepared for integration)
  // =====================================================

  app.get("/api/billing/status", async (req, res) => {
    try {
      const { isStripeConfigured } = await import("./stripe");
      return res.json({ 
        configured: isStripeConfigured(),
        message: isStripeConfigured() 
          ? "Stripe is configured and ready" 
          : "Stripe is not configured. Please set STRIPE_SECRET_KEY."
      });
    } catch (error) {
      console.error("Billing status error:", error);
      return res.status(500).json({ error: "Failed to check billing status" });
    }
  });

  app.post("/api/billing/checkout", async (req, res) => {
    try {
      const { createCheckoutSession, isStripeConfigured } = await import("./stripe");
      
      if (!isStripeConfigured()) {
        return res.status(503).json({ 
          error: "Le système de paiement n'est pas encore configuré. Contactez l'administrateur." 
        });
      }

      const { communityId, planId, userId, isYearly } = req.body;

      if (!communityId || !planId || !userId) {
        return res.status(400).json({ error: "communityId, planId, and userId are required" });
      }

      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : "http://localhost:5000";

      const result = await createCheckoutSession({
        communityId,
        planId,
        userId,
        successUrl: `${baseUrl}/admin/billing?success=true`,
        cancelUrl: `${baseUrl}/admin/billing?canceled=true`,
        isYearly: isYearly ?? true
      });

      if (!result) {
        return res.status(500).json({ error: "Failed to create checkout session" });
      }

      return res.json(result);
    } catch (error: any) {
      console.error("Checkout session error:", error);
      return res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });

  app.post("/api/billing/portal", async (req, res) => {
    try {
      const { createCustomerPortalSession, isStripeConfigured } = await import("./stripe");
      
      if (!isStripeConfigured()) {
        return res.status(503).json({ 
          error: "Le système de paiement n'est pas encore configuré. Contactez l'administrateur." 
        });
      }

      const { communityId } = req.body;

      if (!communityId) {
        return res.status(400).json({ error: "communityId is required" });
      }

      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : "http://localhost:5000";

      const url = await createCustomerPortalSession({
        communityId,
        returnUrl: `${baseUrl}/admin/billing`
      });

      if (!url) {
        return res.status(500).json({ error: "Failed to create portal session" });
      }

      return res.json({ url });
    } catch (error: any) {
      console.error("Customer portal error:", error);
      return res.status(500).json({ error: error.message || "Failed to create portal session" });
    }
  });

  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      const { handleWebhookEvent, isStripeConfigured } = await import("./stripe");
      
      if (!isStripeConfigured()) {
        return res.status(503).json({ error: "Stripe not configured" });
      }

      const signature = req.headers["stripe-signature"] as string;
      if (!signature) {
        return res.status(400).json({ error: "Missing stripe-signature header" });
      }

      const result = await handleWebhookEvent(req.body, signature);

      if (!result.received) {
        return res.status(400).json({ error: result.error });
      }

      return res.json({ received: true, type: result.type });
    } catch (error: any) {
      console.error("Webhook error:", error);
      return res.status(500).json({ error: error.message || "Webhook processing failed" });
    }
  });

  return httpServer;
}
