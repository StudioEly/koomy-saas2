import type { Plan } from "@shared/schema";

export const staticPlans: Plan[] = [
  {
    id: "free",
    code: "STARTER_FREE",
    name: "Free Starter",
    description: "Idéal pour les petites communautés qui débutent",
    maxMembers: 50,
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "Jusqu'à 50 membres",
      "Cartes de membre digitales",
      "Fil d'actualités",
      "Événements basiques",
      "Support par email"
    ],
    isPopular: false,
    isPublic: true,
    isCustom: false,
    isWhiteLabel: false,
    sortOrder: 1
  },
  {
    id: "growth",
    code: "COMMUNAUTE_STANDARD",
    name: "Communauté Plus",
    description: "Pour les associations et clubs en croissance",
    maxMembers: 1000,
    priceMonthly: 990,
    priceYearly: 9900,
    features: [
      "Jusqu'à 1 000 membres",
      "Cartes de membre avec QR code",
      "Gestion des cotisations",
      "Événements et inscriptions",
      "Messagerie membres-admins",
      "Statistiques de base",
      "Support prioritaire"
    ],
    isPopular: true,
    isPublic: true,
    isCustom: false,
    isWhiteLabel: false,
    sortOrder: 2
  },
  {
    id: "scale",
    code: "COMMUNAUTE_PRO",
    name: "Communauté Pro",
    description: "Pour les grandes organisations avec des besoins avancés",
    maxMembers: 5000,
    priceMonthly: 2900,
    priceYearly: 29000,
    features: [
      "Jusqu'à 5 000 membres",
      "Multi-administrateurs avec rôles",
      "Sections/régions illimitées",
      "Personnalisation complète",
      "Analytiques avancées",
      "Export de données",
      "Intégrations API",
      "Support 24/7"
    ],
    isPopular: false,
    isPublic: true,
    isCustom: false,
    isWhiteLabel: false,
    sortOrder: 3
  },
  {
    id: "enterprise",
    code: "ENTREPRISE_CUSTOM",
    name: "Grand Compte",
    description: "Solution sur mesure pour les très grandes organisations",
    maxMembers: null,
    priceMonthly: null,
    priceYearly: null,
    features: [
      "Membres illimités",
      "Configuration personnalisée",
      "Manager de succès dédié",
      "Intégrations sur mesure",
      "SLA garanti",
      "Formation des équipes",
      "Sécurité renforcée",
      "Support prioritaire 24/7"
    ],
    isPopular: false,
    isPublic: true,
    isCustom: true,
    isWhiteLabel: false,
    sortOrder: 4
  },
  {
    id: "whitelabel",
    code: "WHITE_LABEL",
    name: "Koomy White Label",
    description: "Votre propre plateforme à vos couleurs",
    maxMembers: null,
    priceMonthly: null,
    priceYearly: 490000,
    features: [
      "Plateforme en marque blanche",
      "Nom de domaine personnalisé",
      "Branding complet",
      "App mobile personnalisée",
      "Membres illimités",
      "Toutes les fonctionnalités Pro",
      "Support dédié premium",
      "Maintenance incluse"
    ],
    isPopular: false,
    isPublic: true,
    isCustom: false,
    isWhiteLabel: true,
    sortOrder: 5
  }
];
