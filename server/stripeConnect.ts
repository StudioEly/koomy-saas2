import { getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';

const CONNECT_URLS = {
  refresh: 'https://backoffice.koomy.app/payments/connect/refresh',
  return: 'https://backoffice.koomy.app/payments/connect/success',
};

export interface CreateConnectAccountResult {
  accountId: string;
  onboardingUrl: string;
}

export async function createConnectAccount(communityId: string): Promise<string> {
  const stripe = await getUncachableStripeClient();
  
  const community = await storage.getCommunity(communityId);
  if (!community) {
    throw new Error('Community not found');
  }

  const account = await stripe.accounts.create({
    type: 'express',
    country: 'FR',
    email: community.contactEmail || undefined,
    business_type: 'non_profit',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      communityId,
      communityName: community.name,
    },
  });

  await storage.updateCommunity(communityId, {
    stripeConnectAccountId: account.id,
  });

  return account.id;
}

export async function createOnboardingLink(accountId: string): Promise<string> {
  const stripe = await getUncachableStripeClient();

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: CONNECT_URLS.refresh,
    return_url: CONNECT_URLS.return,
    type: 'account_onboarding',
  });

  return accountLink.url;
}

export async function setupConnectForCommunity(communityId: string): Promise<CreateConnectAccountResult> {
  const community = await storage.getCommunity(communityId);
  if (!community) {
    throw new Error('Community not found');
  }

  let accountId = community.stripeConnectAccountId;

  if (!accountId) {
    accountId = await createConnectAccount(communityId);
  }

  const onboardingUrl = await createOnboardingLink(accountId);

  return {
    accountId,
    onboardingUrl,
  };
}

export async function checkConnectAccountStatus(accountId: string): Promise<{
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}> {
  const stripe = await getUncachableStripeClient();
  const account = await stripe.accounts.retrieve(accountId);

  return {
    chargesEnabled: account.charges_enabled || false,
    payoutsEnabled: account.payouts_enabled || false,
    detailsSubmitted: account.details_submitted || false,
  };
}

export async function updateConnectAccountStatusFromWebhook(accountId: string): Promise<void> {
  const status = await checkConnectAccountStatus(accountId);
  
  const stripe = await getUncachableStripeClient();
  const account = await stripe.accounts.retrieve(accountId);
  const communityId = account.metadata?.communityId;
  
  if (!communityId) {
    console.error(`No communityId found in Connect account ${accountId} metadata`);
    return;
  }

  if (status.chargesEnabled && status.payoutsEnabled) {
    await storage.updateCommunity(communityId, {
      paymentsEnabled: true,
    });
    console.log(`Payments enabled for community ${communityId} via Connect account ${accountId}`);
  }
}
