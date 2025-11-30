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
};

export type Message = {
  id: string;
  sender: string;
  senderRole: "member" | "admin";
  content: string;
  timestamp: string;
  read: boolean;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: "National" | "Local";
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
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
};

export const MOCK_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Accord Télétravail 2025",
    summary: "Nouvelles dispositions concernant le télétravail pour l'année à venir.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    category: "National",
    date: "2025-11-28",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
    scope: "national"
  },
  {
    id: "2",
    title: "Réunion Section IDF",
    summary: "Compte rendu de la réunion mensuelle de novembre.",
    content: "Détails sur les discussions concernant les conditions de travail...",
    category: "Local",
    date: "2025-11-25",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80",
    scope: "local"
  },
  {
    id: "3",
    title: "Réforme des Retraites",
    summary: "Analyse de l'UNSA sur les derniers décrets publiés.",
    content: "Impact sur les carrières longues et les régimes spéciaux...",
    category: "Legal",
    date: "2025-11-20",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80",
    scope: "national"
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "Délégué Section IDF",
    senderRole: "admin",
    content: "Bonjour Thomas, as-tu bien reçu ton invitation pour l'AG ?",
    timestamp: "2025-11-29T10:30:00",
    read: false
  },
  {
    id: "2",
    sender: "Thomas Dubois",
    senderRole: "member",
    content: "Oui c'est bon, je serai présent !",
    timestamp: "2025-11-29T10:35:00",
    read: true
  }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "Assemblée Générale",
    description: "Bilan annuel et votes des résolutions.",
    date: "2025-12-15T09:00:00",
    location: "Paris, Salle Wagram",
    type: "National"
  },
  {
    id: "2",
    title: "Atelier Droits du Travail",
    description: "Formation sur les nouveaux droits.",
    date: "2025-12-05T14:00:00",
    location: "Lyon, Siège Local",
    type: "Local"
  }
];
