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
  history?: Contribution[];
};

export type Contribution = {
  id: string;
  date: string;
  amount: number;
  year: number;
  method: "Card" | "Transfer" | "Check";
  status: "paid" | "pending";
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

export type Conversation = {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar?: string;
  section: string;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
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
    logo: "/attached_assets/generated_images/modern_minimalist_union_logo_with_letter_u_or_abstract_knot_symbol_in_blue_and_red.png",
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

// MOCK USERS
export const MOCK_USERS: User[] = [
  {
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
        nextDueDate: "2026-01-15",
        history: [
          { id: "p1", date: "2025-01-15", amount: 120, year: 2025, method: "Card", status: "paid" }
        ]
      },
      {
        communityId: "c_chess",
        memberId: "CHESS-099",
        role: "admin",
        status: "active",
        joinDate: "2020-09-01",
        contributionStatus: "up_to_date"
      }
    ]
  },
  {
    id: "u2",
    firstName: "Sarah",
    lastName: "Martin",
    email: "sarah.m@example.com",
    phone: "06 98 76 54 32",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    communities: [
      {
        communityId: "c_unsa",
        memberId: "UNSA-2023-4421",
        role: "member",
        status: "active",
        section: "Section Auvergne-Rhône-Alpes",
        joinDate: "2023-01-10",
        contributionStatus: "up_to_date"
      }
    ]
  },
  {
    id: "u3",
    firstName: "Jean",
    lastName: "Dupont",
    email: "j.dupont@example.com",
    phone: "07 00 00 00 00",
    communities: [
      {
        communityId: "c_unsa",
        memberId: "UNSA-2022-1123",
        role: "member",
        status: "expired",
        section: "Section Île-de-France",
        joinDate: "2022-05-20",
        contributionStatus: "expired"
      }
    ]
  },
  {
    id: "u4",
    firstName: "Admin",
    lastName: "Local",
    email: "admin.local@unsa.org",
    communities: [
      {
        communityId: "c_unsa",
        memberId: "ADM-001",
        role: "admin",
        status: "active",
        section: "Section Île-de-France",
        joinDate: "2020-01-01",
        contributionStatus: "up_to_date"
      }
    ]
  },
  {
    id: "u5",
    firstName: "Super",
    lastName: "Admin",
    email: "super.admin@unsa.org",
    communities: [
      {
        communityId: "c_unsa",
        memberId: "SADM-001",
        role: "super_admin",
        status: "active",
        section: "National",
        joinDate: "2019-01-01",
        contributionStatus: "up_to_date"
      }
    ]
  }
];

export const MOCK_USER = MOCK_USERS[0];

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
  },
  {
    id: "2",
    communityId: "c_unsa",
    title: "Réunion Section IDF",
    summary: "Compte rendu de la réunion mensuelle de novembre.",
    content: "Détails sur les discussions...",
    category: "Local",
    date: "2025-11-25",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80",
    scope: "local",
    section: "Section Île-de-France",
    author: "Admin Local",
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
    endDate: "2025-12-15T17:00:00",
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

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    memberId: "u1",
    memberName: "Thomas Dubois",
    memberAvatar: MOCK_USERS[0].avatar,
    section: "Section Île-de-France",
    lastMessage: "Oui c'est bon, je serai présent !",
    lastMessageDate: "2025-11-29T10:35:00",
    unreadCount: 0
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    communityId: "c_unsa",
    conversationId: "c1",
    sender: "Délégué Section IDF",
    senderRole: "admin",
    content: "Bonjour Thomas, as-tu bien reçu ton invitation pour l'AG ?",
    timestamp: "2025-11-29T10:30:00",
    read: false
  },
  {
    id: "2",
    communityId: "c_unsa",
    conversationId: "c1",
    sender: "Thomas Dubois",
    senderRole: "member",
    content: "Oui c'est bon, je serai présent !",
    timestamp: "2025-11-29T10:35:00",
    read: true
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

// ALIASES FOR BACKWARD COMPATIBILITY (Admin Views default to UNSA)
export const MOCK_NEWS = MOCK_NEWS_UNSA;
export const MOCK_EVENTS = MOCK_EVENTS_UNSA;

// Export flattened members for Admin view (UNSA context)
export const MOCK_MEMBERS = MOCK_USERS.map(user => {
  const membership = user.communities.find(c => c.communityId === "c_unsa");
  if (!membership) return null;
  
  return {
    ...user,
    ...membership, // Flatten membership properties (role, section, etc.)
    communities: undefined // Remove nested to avoid confusion in Admin views
  };
}).filter(u => u !== null);

// Helper to get current context
export const getCurrentCommunity = (id: string) => MOCK_COMMUNITIES.find(c => c.id === id);
export const getUserMembership = (userId: string, communityId: string) => MOCK_USERS.find(u => u.id === userId)?.communities.find(c => c.communityId === communityId);

// Type for Admin Views (Flattened User + Membership)
export type AdminUser = Omit<User, "communities"> & UserCommunityMembership;
