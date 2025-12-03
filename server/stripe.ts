import Stripe from "stripe";
import { storage } from "./storage";
import { 
  getUncachableStripeClient, 
  getPriceId, 
  getPlanCode,
  type BillingPlan, 
  type BillingPeriod 
} from "./stripeClient";

let stripeClientCached: Stripe | null = null;

export async function getStripeClient(): Promise<Stripe> {
  if (!stripeClientCached) {
    stripeClientCached = await getUncachableStripeClient();
  }
  return stripeClientCached;
}

export function isStripeConfigured(): boolean {
  return true;
}

export interface CreateKoomySubscriptionSessionParams {
  communityId: string;
  billingPlan: BillingPlan;
  billingPeriod: BillingPeriod;
}

export interface CreateKoomySubscriptionSessionResult {
  sessionId: string;
  sessionUrl: string;
}

export async function createKoomySubscriptionSession(
  params: CreateKoomySubscriptionSessionParams
): Promise<CreateKoomySubscriptionSessionResult> {
  const { communityId, billingPlan, billingPeriod } = params;
  
  const priceId = getPriceId(billingPlan, billingPeriod);
  if (!priceId) {
    throw new Error(`Price not configured for ${billingPlan} ${billingPeriod}. Please set STRIPE_PRICE_${billingPlan.toUpperCase()}_${billingPeriod.toUpperCase()} environment variable.`);
  }

  const community = await storage.getCommunity(communityId);
  if (!community) {
    throw new Error("Community not found");
  }

  const planCode = getPlanCode(billingPlan);
  const plan = await storage.getPlanByCode(planCode);
  if (!plan) {
    throw new Error(`Plan with code ${planCode} not found`);
  }

  const stripe = await getStripeClient();

  let customerId = community.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: community.contactEmail || undefined,
      name: community.name,
      metadata: { communityId },
    });
    customerId = customer.id;
    
    await storage.updateCommunity(communityId, {
      stripeCustomerId: customerId,
    });
  }

  const successUrl = `https://lorpesikoomyadmin.koomy.app/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `https://lorpesikoomyadmin.koomy.app/subscription/cancel`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        communityId,
        planId: plan.id,
        billingPeriod,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      communityId,
      planId: plan.id,
      billingPeriod,
    },
  });

  return {
    sessionId: session.id,
    sessionUrl: session.url!,
  };
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
  const stripe = await getStripeClient();

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
  const stripe = await getStripeClient();

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
  payload: Buffer | string,
  signature: string
): Promise<{ received: boolean; type?: string; error?: string }> {
  const stripe = await getStripeClient();

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return { received: false, error: "Webhook secret not configured" };
  }

  let event: Stripe.Event;

  try {
    const payloadString = typeof payload === 'string' ? payload : payload.toString();
    event = stripe.webhooks.constructEvent(payloadString, signature, webhookSecret);
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

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
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
  const { communityId, planId, billingPeriod } = session.metadata || {};
  
  if (!communityId) {
    console.error("Missing communityId in checkout session metadata");
    return;
  }

  const updateData: any = {
    stripeCustomerId: session.customer as string,
    stripeSubscriptionId: session.subscription as string,
  };
  
  if (planId) {
    updateData.planId = planId;
  }
  
  if (billingPeriod && (billingPeriod === 'monthly' || billingPeriod === 'yearly')) {
    updateData.billingPeriod = billingPeriod;
  }

  await storage.updateCommunity(communityId, updateData);

  console.log(`Checkout completed for community ${communityId} - customer: ${session.customer}, subscription: ${session.subscription}`);
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  const communityId = subscription.metadata?.communityId;
  if (!communityId) {
    console.error("Missing communityId in subscription metadata");
    return;
  }

  const subscriptionStatus = mapStripeStatusToSubscriptionStatus(subscription.status);
  const currentPeriodEnd = (subscription as any).current_period_end;

  await storage.updateCommunity(communityId, {
    subscriptionStatus,
    currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : undefined,
  });

  console.log(`Subscription created for community ${communityId}: ${subscription.status} -> ${subscriptionStatus}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const communityId = subscription.metadata?.communityId;
  if (!communityId) {
    console.error("Missing communityId in subscription metadata");
    return;
  }

  const subscriptionStatus = mapStripeStatusToSubscriptionStatus(subscription.status);
  const currentPeriodEnd = (subscription as any).current_period_end;

  await storage.updateCommunity(communityId, {
    subscriptionStatus,
    currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : undefined,
  });

  console.log(`Subscription updated for community ${communityId}: ${subscription.status} -> ${subscriptionStatus}`);
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
  });

  console.log(`Subscription deleted for community ${communityId} - reverted to free plan`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  console.log(`Payment succeeded for subscription ${subscriptionId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  const stripe = await getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const communityId = subscription.metadata?.communityId;

  if (communityId) {
    await storage.updateCommunity(communityId, {
      subscriptionStatus: "past_due",
    });
    console.log(`Payment failed for community ${communityId} - status set to past_due`);
  } else {
    console.log(`Payment failed for subscription ${subscriptionId} - no communityId found`);
  }
}

function mapStripeStatusToSubscriptionStatus(stripeStatus: string): "active" | "past_due" | "canceled" {
  switch (stripeStatus) {
    case "trialing":
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
    case "paused":
      return "canceled";
    default:
      return "active";
  }
}

export async function cancelSubscription(communityId: string): Promise<boolean> {
  const stripe = await getStripeClient();

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
