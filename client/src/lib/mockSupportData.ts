
// ... existing types ...

export type SupportTicket = {
  id: string;
  userId: string;
  userName: string;
  userRole: "member" | "admin";
  communityId: string;
  communityName: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  lastUpdate: string;
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: "general" | "account" | "events" | "payment" | "technical";
  targetRole: "member" | "admin" | "all";
};

// ... existing mock data ...

export const MOCK_FAQS: FAQItem[] = [
  {
    id: "f1",
    question: "Comment réinitialiser mon mot de passe ?",
    answer: "Vous pouvez réinitialiser votre mot de passe depuis l'écran de connexion en cliquant sur 'Mot de passe oublié'.",
    category: "account",
    targetRole: "all"
  },
  {
    id: "f2",
    question: "Où trouver ma carte d'adhérent ?",
    answer: "Votre carte d'adhérent est accessible depuis l'onglet 'Carte' de l'application mobile.",
    category: "general",
    targetRole: "member"
  },
  {
    id: "f3",
    question: "Comment scanner un QR code lors d'un événement ?",
    answer: "Utilisez l'application Admin Mobile et accédez à la section 'Scanner' pour valider les entrées.",
    category: "events",
    targetRole: "admin"
  },
  {
    id: "f4",
    question: "Puis-je gérer plusieurs communautés ?",
    answer: "Oui, vous pouvez basculer entre vos différentes communautés depuis le 'Community Hub'.",
    category: "account",
    targetRole: "all"
  }
];

export const MOCK_TICKETS: SupportTicket[] = [
  {
    id: "t1",
    userId: "u1",
    userName: "Thomas Dubois",
    userRole: "member",
    communityId: "c_unsa",
    communityName: "UNSA Lidl",
    subject: "Problème de paiement cotisation",
    message: "Je n'arrive pas à payer ma cotisation par carte bancaire, j'ai une erreur 404.",
    status: "open",
    priority: "high",
    createdAt: "2025-11-29T14:30:00",
    lastUpdate: "2025-11-29T14:30:00"
  },
  {
    id: "t2",
    userId: "u4",
    userName: "Admin Local",
    userRole: "admin",
    communityId: "c_unsa",
    communityName: "UNSA Lidl",
    subject: "Export des membres impossible",
    message: "Le bouton d'export CSV ne fonctionne pas sur Safari.",
    status: "in_progress",
    priority: "medium",
    createdAt: "2025-11-28T09:15:00",
    lastUpdate: "2025-11-29T10:00:00"
  }
];
