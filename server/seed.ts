import { db } from "./db";
import { plans, communities, users, userCommunityMemberships, faqs, newsArticles, events } from "@shared/schema";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Seed plans
  await db.insert(plans).values([
    {
      id: "free",
      name: "Free Starter",
      maxMembers: 100,
      priceMonthly: 0,
      priceYearly: 0,
      features: [
        "Up to 100 members",
        "Basic member database",
        "Digital membership cards",
        "Community news feed",
        "Email support"
      ],
      isPopular: false
    },
    {
      id: "growth",
      name: "Growth",
      maxMembers: 500,
      priceMonthly: 4900,
      priceYearly: 49000,
      features: [
        "Up to 500 members",
        "Advanced member management",
        "Digital membership cards with QR codes",
        "News feed & event management",
        "Member messaging system",
        "Basic analytics",
        "Priority email support"
      ],
      isPopular: true
    },
    {
      id: "scale",
      name: "Scale",
      maxMembers: 2000,
      priceMonthly: 14900,
      priceYearly: 149000,
      features: [
        "Up to 2,000 members",
        "Multi-role admin management",
        "Custom branding & theming",
        "Advanced analytics & reporting",
        "Automated contribution tracking",
        "Section/regional management",
        "API access",
        "24/7 phone & email support"
      ],
      isPopular: false
    },
    {
      id: "enterprise",
      name: "Enterprise",
      maxMembers: 999999,
      priceMonthly: 0,
      priceYearly: 0,
      features: [
        "Unlimited members",
        "Full customization",
        "Dedicated success manager",
        "Custom integrations",
        "Advanced security & compliance",
        "Multi-language support",
        "White-label options",
        "SLA guarantee"
      ],
      isPopular: false
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

  // Create sample community
  const [community] = await db.insert(communities).values({
    name: "UNSA - Union Nationale des Syndicats Autonomes",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=unsa",
    primaryColor: "215 85% 35%",
    secondaryColor: "350 80% 55%",
    description: "National union organization for autonomous workers",
    memberCount: 0,
    planId: "growth",
    subscriptionStatus: "active"
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
