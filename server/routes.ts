import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema, insertCommunitySchema, insertMembershipSchema,
  insertNewsSchema, insertEventSchema, insertTicketSchema, insertMessageSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Authentication Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // In production, use proper password hashing with bcrypt
      // For now, simple check (password is placeholder in seed)
      
      // Get user's community memberships
      const memberships = await storage.getUserMemberships(user.id);
      
      return res.json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          phone: user.phone
        },
        memberships
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Login failed" });
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

  // Plans Routes
  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getAllPlans();
      return res.json(plans);
    } catch (error) {
      console.error("Get plans error:", error);
      return res.status(500).json({ error: "Failed to fetch plans" });
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
      const membership = await storage.createMembership(validated);
      
      // Update community member count
      const memberships = await storage.getCommunityMemberships(validated.communityId);
      await storage.updateCommunityMemberCount(validated.communityId, memberships.length);
      
      return res.status(201).json(membership);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Create membership error:", error);
      return res.status(500).json({ error: "Failed to create membership" });
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

  return httpServer;
}
