export const PLAN_LIMITS = {
  FREE: {
    name: 'Free',
    price: 0,
    priceId: null,
    maxLinks: 50,
    features: [
      '50 links per month',
      'Basic analytics',
      'QR codes',
      'Password protection',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 9,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    maxLinks: 5000,
    features: [
      '5,000 links per month',
      'Advanced analytics',
      'Custom slugs',
      'Password protection',
      'Link expiration',
      'Priority support',
    ],
  },
  BUSINESS: {
    name: 'Business',
    price: 29,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID,
    maxLinks: -1,
    features: [
      'Unlimited links',
      'All Pro features',
      'API access',
      'Custom domains',
      'Team workspaces',
      'Dedicated support',
    ],
  },
};

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as PlanType] || PLAN_LIMITS.FREE;
}