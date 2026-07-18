import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { stripe } from '../lib/stripe';
import { PLAN_LIMITS } from '../lib/plans';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get available plans
router.get('/plans', async (_req, res) => {
  console.log('📋 GET /api/subscription/plans');
  res.json(PLAN_LIMITS);
});

// Get current subscription
router.get('/current', authenticate, async (req: AuthRequest, res, next) => {
  try {
    console.log('📋 GET /api/subscription/current');
    
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const linkCount = await prisma.link.count({
      where: { userId: req.userId },
    });

    const planInfo = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS];

    res.json({
      plan: user.plan,
      planInfo,
      linkCount,
      linkLimit: planInfo.maxLinks,
      hasActiveSubscription: !!user.stripeSubscriptionId,
      currentPeriodEnd: user.stripeCurrentPeriodEnd,
    });
  } catch (error) {
    console.error('❌ Error in /current:', error);
    next(error);
  }
});

// Create checkout session
router.post('/checkout', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
      metadata: { userId: user.id },
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

// Create billing portal
router.post('/portal', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });
    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/billing`,
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

// Cancel subscription
router.post('/cancel', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });
    if (!user || !user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription' });
    }

    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({ success: true, message: 'Subscription will cancel at period end' });
  } catch (error) {
    next(error);
  }
});

export default router;