import { useState, useEffect } from "react";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  memberId: string;
  joinDate: string;
  status: "active" | "expired" | "suspended";
  section: string;
  role: "member" | "admin" | "super_admin";
  avatar?: string;
  phone?: string;
  // Contribution fields
  contributionStatus: "up_to_date" | "expired" | "pending" | "late";
  lastContributionDate?: string;
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
  title: string;
  summary: string;
  content: string;
  category: "National" | "Local" | "Legal" | "Events";
  date: string;
  image: string;
  scope: "national" | "local";
  section?: string; // If scope is local
  author: string;
  status: "draft" | "published";
};

export type Message = {
  id: string;
  sender: string;
  senderRole: "member" | "admin";
  content: string;
  timestamp: string;
  read: boolean;
  conversationId: string;
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
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  type: "National" | "Local";
  scope: "national" | "local";
  section?: string;
  participants: number;
};

// MOCK STATE
export const MOCK_USER: User = {
  id: "1",
  firstName: "Thomas",
  lastName: "Dubois",
  email: "thomas.dubois@example.com",
  memberId: "UNSA-2024-8892",
  joinDate: "2021-03-15",
  status: "active",
  section: "Section Île-de-France",
  role: "member",
  phone: "06 12 34 56 78",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  contributionStatus: "up_to_date",
  lastContributionDate: "2025-01-15",
  nextDueDate: "2026-01-15",
  history: [
    { id: "p1", date: "2025-01-15", amount: 120, year: 2025, method: "Card", status: "paid" },
    { id: "p2", date: "2024-01-10", amount: 115, year: 2024, method: "Card", status: "paid" },
    { id: "p3", date: "2023-01-12", amount: 110, year: 2023, method: "Check", status: "paid" }
  ]
};

export const MOCK_MEMBERS: User[] = [
  MOCK_USER,
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Martin",
    email: "sarah.m@example.com",
    memberId: "UNSA-2023-4421",
    joinDate: "2023-01-10",
    status: "active",
    section: "Section Auvergne-Rhône-Alpes",
    role: "member",
    phone: "06 98 76 54 32",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    contributionStatus: "up_to_date",
    lastContributionDate: "2025-02-01",
    nextDueDate: "2026-02-01"
  },
  {
    id: "3",
    firstName: "Jean",
    lastName: "Dupont",
    email: "j.dupont@example.com",
    memberId: "UNSA-2022-1123",
    joinDate: "2022-05-20",
    status: "expired",
    section: "Section Île-de-France",
    role: "member",
    phone: "07 00 00 00 00",
    contributionStatus: "expired",
    lastContributionDate: "2024-05-20",
    nextDueDate: "2025-05-20"
  },
  {
    id: "4",
    firstName: "Admin",
    lastName: "Local",
    email: "admin.local@unsa.org",
    memberId: "ADM-001",
    joinDate: "2020-01-01",
    status: "active",
    section: "Section Île-de-France",
    role: "admin",
    phone: "06 11 11 11 11",
    contributionStatus: "up_to_date"
  },
  {
    id: "5",
    firstName: "Super",
    lastName: "Admin",
    email: "super.admin@unsa.org",
    memberId: "SADM-001",
    joinDate: "2019-01-01",
    status: "active",
    section: "National",
    role: "super_admin",
    phone: "06 22 22 22 22",
    contributionStatus: "up_to_date"
  },
  {
    id: "6",
    firstName: "Pierre",
    lastName: "Durand",
    email: "pierre.d@example.com",
    memberId: "UNSA-2021-5567",
    joinDate: "2021-11-15",
    status: "active",
    section: "Section Occitanie",
    role: "member",
    phone: "06 55 44 33 22",
    contributionStatus: "late",
    lastContributionDate: "2024-11-15",
    nextDueDate: "2025-11-15"
  }
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Accord Télétravail 2025",
    summary: "Nouvelles dispositions concernant le télétravail pour l'année à venir.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    category: "National",
    date: "2025-11-28",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
    scope: "national",
    author: "Super Admin",
    status: "published"
  },
  {
    id: "2",
    title: "Réunion Section IDF",
    summary: "Compte rendu de la réunion mensuelle de novembre.",
    content: "Détails sur les discussions concernant les conditions de travail...",
    category: "Local",
    date: "2025-11-25",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80",
    scope: "local",
    section: "Section Île-de-France",
    author: "Admin Local",
    status: "published"
  },
  {
    id: "3",
    title: "Réforme des Retraites",
    summary: "Analyse de l'UNSA sur les derniers décrets publiés.",
    content: "Impact sur les carrières longues et les régimes spéciaux...",
    category: "Legal",
    date: "2025-11-20",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80",
    scope: "national",
    author: "Service Juridique",
    status: "published"
  }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    memberId: "1",
    memberName: "Thomas Dubois",
    memberAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    section: "Section Île-de-France",
    lastMessage: "Oui c'est bon, je serai présent !",
    lastMessageDate: "2025-11-29T10:35:00",
    unreadCount: 0
  },
  {
    id: "c2",
    memberId: "2",
    memberName: "Sarah Martin",
    memberAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    section: "Section Auvergne-Rhône-Alpes",
    lastMessage: "Pouvez-vous m'envoyer le formulaire ?",
    lastMessageDate: "2025-11-29T09:15:00",
    unreadCount: 1
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    conversationId: "c1",
    sender: "Délégué Section IDF",
    senderRole: "admin",
    content: "Bonjour Thomas, as-tu bien reçu ton invitation pour l'AG ?",
    timestamp: "2025-11-29T10:30:00",
    read: false
  },
  {
    id: "2",
    conversationId: "c1",
    sender: "Thomas Dubois",
    senderRole: "member",
    content: "Oui c'est bon, je serai présent !",
    timestamp: "2025-11-29T10:35:00",
    read: true
  },
  {
    id: "3",
    conversationId: "c2",
    sender: "Sarah Martin",
    senderRole: "member",
    content: "Bonjour, je n'ai pas reçu les documents pour l'inscription.",
    timestamp: "2025-11-29T09:00:00",
    read: true
  },
  {
    id: "4",
    conversationId: "c2",
    sender: "Sarah Martin",
    senderRole: "member",
    content: "Pouvez-vous m'envoyer le formulaire ?",
    timestamp: "2025-11-29T09:15:00",
    read: false
  }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "Assemblée Générale",
    description: "Bilan annuel et votes des résolutions.",
    date: "2025-12-15T09:00:00",
    endDate: "2025-12-15T17:00:00",
    location: "Paris, Salle Wagram",
    type: "National",
    scope: "national",
    participants: 150
  },
  {
    id: "2",
    title: "Atelier Droits du Travail",
    description: "Formation sur les nouveaux droits.",
    date: "2025-12-05T14:00:00",
    endDate: "2025-12-05T16:00:00",
    location: "Lyon, Siège Local",
    type: "Local",
    scope: "local",
    section: "Section Auvergne-Rhône-Alpes",
    participants: 25
  }
];

export const SECTIONS = [
  "Section Île-de-France",
  "Section Auvergne-Rhône-Alpes",
  "Section Occitanie",
  "Section Hauts-de-France",
  "Section Grand Est",
  "Section PACA"
];
