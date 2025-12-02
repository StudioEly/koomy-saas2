import { db } from "./db";
import { plans, communities, users, userCommunityMemberships, faqs, newsArticles, events, PLAN_CODES } from "@shared/schema";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Seed plans with the new structure
  await db.insert(plans).values([
    {
      id: "starter",
      code: PLAN_CODES.STARTER_FREE,
      name: "Starter",
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
      id: "standard",
      code: PLAN_CODES.COMMUNAUTE_STANDARD,
      name: "Communauté Plus",
      description: "Pour les associations et clubs en croissance",
      maxMembers: 1000,
      priceMonthly: 990, // 9.90€
      priceYearly: 9900, // 99€
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
      id: "pro",
      code: PLAN_CODES.COMMUNAUTE_PRO,
      name: "Communauté Pro",
      description: "Pour les grandes organisations avec des besoins avancés",
      maxMembers: 5000,
      priceMonthly: 2900, // 29€
      priceYearly: 29000, // 290€
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
      code: PLAN_CODES.ENTREPRISE_CUSTOM,
      name: "Grand Compte",
      description: "Solution sur mesure pour les très grandes organisations",
      maxMembers: null, // Unlimited
      priceMonthly: null, // Custom pricing
      priceYearly: null, // Custom pricing
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
      code: PLAN_CODES.WHITE_LABEL,
      name: "Koomy White Label",
      description: "Votre propre plateforme à vos couleurs",
      maxMembers: null, // Unlimited
      priceMonthly: null, // Custom pricing
      priceYearly: 490000, // À partir de 4900€/an
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
  ]).onConflictDoNothing();

  // Seed FAQs
  await db.insert(faqs).values([
    {
      question: "How do I access my digital membership card?",
      answer: "Your digital membership card is available in the 'Membership' section of the mobile app. It includes a QR code that can be scanned for verification.",
      category: "Membership",
      targetRole: "member"
    },
    {
      question: "How can I update my contribution status?",
      answer: "Contact your community administrator or use the payment section in your profile to update contribution information.",
      category: "Contributions",
      targetRole: "member"
    },
    {
      question: "How do I contact my community administrators?",
      answer: "Use the Messages tab in the app to send direct messages to administrators or delegates in your community.",
      category: "Support",
      targetRole: "member"
    },
    {
      question: "How do I add new members to my community?",
      answer: "Navigate to the Members section in the admin portal, click 'Add Member', and fill in their details. They will receive an invitation email to set up their account.",
      category: "Member Management",
      targetRole: "admin"
    },
    {
      question: "Can I publish news to specific sections only?",
      answer: "Yes! When creating news, select 'Local' scope and choose the target section. Only members of that section will see the article.",
      category: "Content Management",
      targetRole: "admin"
    },
    {
      question: "How do I upgrade my community's subscription plan?",
      answer: "Go to Settings > Subscription in your admin portal. Select the desired plan and complete the payment process.",
      category: "Billing",
      targetRole: "admin"
    }
  ]).onConflictDoNothing();

  // Create sample community with starter plan (auto-assigned to new communities)
  const [community] = await db.insert(communities).values({
    name: "UNSA - Union Nationale des Syndicats Autonomes",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=unsa",
    primaryColor: "215 85% 35%",
    secondaryColor: "350 80% 55%",
    description: "National union organization for autonomous workers",
    memberCount: 0,
    planId: "standard", // Using standard plan for demo purposes
    subscriptionStatus: "active",
    billingStatus: "active"
  }).returning().onConflictDoNothing();

  if (community) {
    console.log(`Created community: ${community.name}`);

    // Create sample admin user
    const [admin] = await db.insert(users).values({
      firstName: "Sophie",
      lastName: "Martin",
      email: "admin@unsa.org",
      password: "$2a$10$abcdefghijklmnopqrstuvwxyz123456", // Placeholder - in real app use bcrypt
      phone: "+33 6 12 34 56 78",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sophie"
    }).returning().onConflictDoNothing();

    if (admin) {
      // Create admin membership
      await db.insert(userCommunityMemberships).values({
        userId: admin.id,
        communityId: community.id,
        memberId: "UNSA-2024-0001",
        role: "admin",
        adminRole: "super_admin",
        status: "active",
        contributionStatus: "up_to_date"
      }).onConflictDoNothing();

      console.log(`Created admin user: ${admin.email}`);
    }

    // Create sample member user
    const [member] = await db.insert(users).values({
      firstName: "Jean",
      lastName: "Dupont",
      email: "member@unsa.org",
      password: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
      phone: "+33 6 98 76 54 32",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jean"
    }).returning().onConflictDoNothing();

    if (member) {
      // Create member membership
      await db.insert(userCommunityMemberships).values({
        userId: member.id,
        communityId: community.id,
        memberId: "UNSA-2024-0002",
        role: "member",
        status: "active",
        contributionStatus: "up_to_date",
        nextDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      }).onConflictDoNothing();

      console.log(`Created member user: ${member.email}`);
    }

    // Create sample news article
    await db.insert(newsArticles).values({
      communityId: community.id,
      title: "Bienvenue sur Koomy",
      summary: "Découvrez notre nouvelle plateforme de gestion communautaire",
      content: "Nous sommes ravis de vous présenter Koomy, la solution complète pour la gestion de votre organisation. Cette plateforme vous permet de gérer vos membres, publier des actualités, organiser des événements et bien plus encore.",
      category: "Annonces",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
      scope: "national",
      author: "Sophie Martin",
      status: "published"
    }).onConflictDoNothing();

    // Create sample event
    await db.insert(events).values({
      communityId: community.id,
      title: "Assemblée Générale 2024",
      description: "Assemblée générale annuelle de l'organisation. Tous les membres sont invités à participer.",
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +4 hours
      location: "Paris Convention Center",
      type: "Assemblée",
      scope: "national",
      participants: 0
    }).onConflictDoNothing();
  }

  console.log("Database seeding completed!");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  });
