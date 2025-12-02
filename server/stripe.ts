import Stripe from "stripe";
import { storage } from "./storage";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (!stripeSecretKey) {
    console.warn("Stripe not configured: STRIPE_SECRET_KEY is missing");
    return null;
  }
  
  if (!stripeClient) {
    stripeClient = new Stripe(stripeSecretKey);
  }
  
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return !!stripeSecretKey;
}

export interface CreateCheckoutSessionParams {
  communityId: string;
  planId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  isYearly?: boolean;
}

export interface CreateCheckoutSessionResult {
  sessionId: string;
  url: string;
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CreateCheckoutSessionResult | null> {
  const stripe = getStripeClient();
  if (!stripe) {
    console.error("Stripe is not configured");
    return null;
  }

  const { communityId, planId, userId, successUrl, cancelUrl, isYearly = true } = params;

  const community = await storage.getCommunity(communityId);
  if (!community) {
    throw new Error("Community not found");
  }

  const plan = await storage.getPlan(planId);
  if (!plan) {
    throw new Error("Plan not found");
  }

  if (!plan.priceMonthly && !plan.priceYearly) {
    throw new Error("This plan requires custom pricing - contact sales");
  }

  const priceAmount = isYearly ? plan.priceYearly : plan.priceMonthly;
  if (!priceAmount) {
    throw new Error("Price not available for selected billing period");
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      billing_address_collection: "required",
      customer_email: community.contactEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Koomy ${plan.name}`,
              description: plan.description || undefined,
            },
            unit_amount: priceAmount,
            recurring: {
              interval: isYearly ? "year" : "month",
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        communityId,
        planId,
        userId,
        isYearly: String(isYearly),
      },
      subscription_data: {
        metadata: {
          communityId,
          planId,
        },
      },
    });

    return {
      sessionId: session.id,
      url: session.url!,
    };
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    throw error;
  }
}

export interface CreateCustomerPortalParams {
  communityId: string;
  returnUrl: string;
}

export async function createCustomerPortalSession(
  params: CreateCustomerPortalParams
): Promise<string | null> {
  const stripe = getStripeClient();
  if (!stripe) {
    console.error("Stripe is not configured");
    return null;
  }

  const { communityId, returnUrl } = params;

  const community = await storage.getCommunity(communityId);
  if (!community) {
    throw new Error("Community not found");
  }

  if (!community.stripeCustomerId) {
    throw new Error("No Stripe customer associated with this community");
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: community.stripeCustomerId,
      return_url: returnUrl,
    });

    return session.url;
  } catch (error) {
    console.error("Failed to create customer portal session:", error);
    throw error;
  }
}

export async function handleWebhookEvent(
  payload: Buffer,
  signature: string
): Promise<{ received: boolean; type?: string; error?: string }> {
  const stripe = getStripeClient();
  if (!stripe) {
    return { received: false, error: "Stripe not configured" };
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return { received: false, error: "Webhook secret not configured" };
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return { received: false, error: `Webhook Error: ${err.message}` };
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true, type: event.type };
  } catch (error: any) {
    console.error(`Error processing webhook event ${event.type}:`, error);
    return { received: false, error: error.message };
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const { communityId, planId } = session.metadata || {};
  
  if (!communityId || !planId) {
    console.error("Missing metadata in checkout session");
    return;
  }

  await storage.updateCommunity(communityId, {
    stripeCustomerId: session.customer as string,
    stripeSubscriptionId: session.subscription as string,
    planId,
    subscriptionStatus: "active",
    billingStatus: "active",
  });

  console.log(`Community ${communityId} upgraded to plan ${planId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const communityId = subscription.metadata?.communityId;
  if (!communityId) {
    console.error("Missing communityId in subscription metadata");
    return;
  }

  const status = subscription.status;
  let subscriptionStatus: "active" | "past_due" | "canceled" = "active";
  let billingStatus: "trialing" | "active" | "past_due" | "canceled" | "unpaid" = "active";

  switch (status) {
    case "active":
      subscriptionStatus = "active";
      billingStatus = "active";
      break;
    case "trialing":
      subscriptionStatus = "active";
      billingStatus = "trialing";
      break;
    case "past_due":
      subscriptionStatus = "past_due";
      billingStatus = "past_due";
      break;
    case "canceled":
    case "unpaid":
      subscriptionStatus = "canceled";
      billingStatus = status === "unpaid" ? "unpaid" : "canceled";
      break;
  }

  const currentPeriodEnd = (subscription as any).current_period_end;
  await storage.updateCommunity(communityId, {
    subscriptionStatus,
    billingStatus,
    currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : undefined,
  });

  console.log(`Subscription updated for community ${communityId}: ${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const communityId = subscription.metadata?.communityId;
  if (!communityId) {
    console.error("Missing communityId in subscription metadata");
    return;
  }

  const freePlan = await storage.getPlanByCode("STARTER_FREE");
  
  await storage.updateCommunity(communityId, {
    stripeSubscriptionId: null,
    planId: freePlan?.id || "free",
    subscriptionStatus: "canceled",
    billingStatus: "canceled",
  });

  console.log(`Subscription deleted for community ${communityId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  console.log(`Payment succeeded for subscription ${subscriptionId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  console.log(`Payment failed for subscription ${subscriptionId}`);
}

export async function cancelSubscription(communityId: string): Promise<boolean> {
  const stripe = getStripeClient();
  if (!stripe) {
    console.error("Stripe is not configured");
    return false;
  }

  const community = await storage.getCommunity(communityId);
  if (!community || !community.stripeSubscriptionId) {
    throw new Error("No active subscription found");
  }

  try {
    await stripe.subscriptions.cancel(community.stripeSubscriptionId);
    return true;
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    throw error;
  }
}
