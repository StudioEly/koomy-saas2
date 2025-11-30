import { useState, useEffect } from "react";

// SAAS TYPES
export type Community = {
  id: string;
  name: string;
  logo: string; // Community specific logo
  primaryColor: string;
  secondaryColor: string;
  description: string;
  memberCount: number;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  phone?: string;
  // SaaS: User belongs to multiple communities with specific roles in each
  communities: UserCommunityMembership[];
};

export type UserCommunityMembership = {
  communityId: string;
  memberId: string; // ID specific to this community (e.g., UNSA-2024-X)
  role: "member" | "admin" | "super_admin"; // Admin within the community
  status: "active" | "expired" | "suspended";
  joinDate: string;
  section?: string;
  contributionStatus: "up_to_date" | "expired" | "pending" | "late";
  nextDueDate?: string;
};

export type NewsItem = {
  id: string;
  communityId: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  date: string;
  image: string;
  scope: "national" | "local";
  section?: string;
  author: string;
  status: "draft" | "published";
};

export type Message = {
  id: string;
  communityId: string;
  conversationId: string;
  sender: string;
  senderRole: "member" | "admin";
  content: string;
  timestamp: string;
  read: boolean;
};

export type Event = {
  id: string;
  communityId: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  type: string;
  scope: "national" | "local";
  section?: string;
  participants: number;
};

// MOCK COMMUNITIES (Tenants)
export const MOCK_COMMUNITIES: Community[] = [
  {
    id: "c_unsa",
    name: "UNSA Lidl",
    logo: "/attached_assets/generated_images/modern_minimalist_union_logo_with_letter_u_or_abstract_knot_symbol_in_blue_and_red.png", // Using existing asset as placeholder
    primaryColor: "215 85% 35%",
    secondaryColor: "350 80% 55%",
    description: "Union Syndicale - Section Lidl France",
    memberCount: 1250
  },
  {
    id: "c_chess",
    name: "Club d'Échecs Paris",
    logo: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=100&q=80",
    primaryColor: "270 50% 40%", // Purple
    secondaryColor: "45 90% 60%", // Gold
    description: "Le club historique de la capitale",
    memberCount: 340
  }
];

// MOCK USER (The person holding the phone)
export const MOCK_USER: User = {
  id: "u1",
  firstName: "Thomas",
  lastName: "Dubois",
  email: "thomas.dubois@example.com",
  phone: "06 12 34 56 78",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  communities: [
    {
      communityId: "c_unsa",
      memberId: "UNSA-2024-8892",
      role: "member",
      status: "active",
      section: "Section Île-de-France",
      joinDate: "2021-03-15",
      contributionStatus: "up_to_date",
      nextDueDate: "2026-01-15"
    },
    {
      communityId: "c_chess",
      memberId: "CHESS-099",
      role: "admin", // He is admin in the chess club!
      status: "active",
      joinDate: "2020-09-01",
      contributionStatus: "up_to_date",
      nextDueDate: "2025-09-01"
    }
  ]
};

// DATA FOR UNSA COMMUNITY
export const MOCK_NEWS_UNSA: NewsItem[] = [
  {
    id: "1",
    communityId: "c_unsa",
    title: "Accord Télétravail 2025",
    summary: "Nouvelles dispositions concernant le télétravail.",
    content: "Lorem ipsum...",
    category: "National",
    date: "2025-11-28",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
    scope: "national",
    author: "Super Admin",
    status: "published"
  }
];

export const MOCK_EVENTS_UNSA: Event[] = [
  {
    id: "1",
    communityId: "c_unsa",
    title: "Assemblée Générale",
    description: "Bilan annuel.",
    date: "2025-12-15T09:00:00",
    location: "Paris, Salle Wagram",
    type: "National",
    scope: "national",
    participants: 150
  }
];

// DATA FOR CHESS CLUB
export const MOCK_EVENTS_CHESS: Event[] = [
  {
    id: "101",
    communityId: "c_chess",
    title: "Tournoi de Noël",
    description: "Tournoi rapide 10+5.",
    date: "2025-12-20T14:00:00",
    location: "Club House",
    type: "Tournoi",
    scope: "local",
    participants: 45
  }
];

// Sections for UNSA
export const SECTIONS = [
  "Section Île-de-France",
  "Section Auvergne-Rhône-Alpes",
  "Section Occitanie",
  "Section Hauts-de-France",
  "Section Grand Est",
  "Section PACA"
];

// Helper to get current context
export const getCurrentCommunity = (id: string) => MOCK_COMMUNITIES.find(c => c.id === id);
export const getUserMembership = (userId: string, communityId: string) => MOCK_USER.communities.find(c => c.communityId === communityId);
