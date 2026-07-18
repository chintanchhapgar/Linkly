import { Router } from 'express';
import express from 'express';
import { stripe } from '../lib/stripe';
import { prisma } from '../lib/prisma';
import type Stripe from 'stripe';

const router = Router();

router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    console.log('\n🔔🔔🔔 WEBHOOK CALLED 🔔🔔🔔');
    console.log('Time:', new Date().toISOString());
    console.log('Has signature:', !!req.headers['stripe-signature']);
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('❌ Webhook signature failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`🎣 Webhook: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          console.log('\n🎬 ============ CHECKOUT COMPLETED ============');
          
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          
          console.log('👤 UserId:', userId);
          
          if (!userId) {
            console.error('❌ No userId in metadata!');
            break;
          }

          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const priceId = subscription.items.data[0].price.id;
          
          console.log('\n📊 Price Comparison:');
          console.log('   Received Price ID:  ', priceId);
          console.log('   Expected PRO:       ', process.env.STRIPE_PRO_PRICE_ID);
          console.log('   Expected BUSINESS:  ', process.env.STRIPE_BUSINESS_PRICE_ID);
          
          let plan: 'PRO' | 'BUSINESS' = 'PRO';
          
          if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) {
            plan = 'BUSINESS';
            console.log('✅ Matched BUSINESS plan');
          } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
            plan = 'PRO';
            console.log('✅ Matched PRO plan');
          } else {
            console.log('⚠️ Price ID did not match either plan, defaulting to PRO');
          }
          
          console.log('📋 Final plan:', plan);

          const updated = await prisma.user.update({
            where: { id: userId },
            data: {
              plan,
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
          });
          
          console.log('✅ User updated to plan:', updated.plan);
          console.log('============================================\n');
          break;
        }

        case 'customer.subscription.updated': {
          console.log('\n🔄 ============ SUBSCRIPTION UPDATED ============');
          
          const subscription = event.data.object as Stripe.Subscription;
          const priceId = subscription.items.data[0].price.id;
          
          console.log('📊 Price ID:', priceId);
          console.log('   Expected PRO:      ', process.env.STRIPE_PRO_PRICE_ID);
          console.log('   Expected BUSINESS: ', process.env.STRIPE_BUSINESS_PRICE_ID);
          
          let plan: 'PRO' | 'BUSINESS' | 'FREE' = 'FREE';
          if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = 'PRO';
          else if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) plan = 'BUSINESS';

          console.log('📋 Final plan:', plan);

          await prisma.user.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              plan,
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
          });

          console.log(`✅ Subscription updated to: ${plan}`);
          console.log('==============================================\n');
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;

          await prisma.user.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              plan: 'FREE',
              stripeSubscriptionId: null,
              stripePriceId: null,
              stripeCurrentPeriodEnd: null,
            },
          });

          console.log(`⬇️ Subscription cancelled`);
          break;
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error('❌ Webhook error:', error);
      res.status(500).json({ error: 'Webhook failed' });
    }
  }
);

export default router;