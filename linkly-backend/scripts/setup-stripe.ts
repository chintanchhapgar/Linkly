import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia' as any,
});

async function setup() {
  console.log('🚀 Setting up Stripe products...\n');

  // Create Pro Plan
  const proProduct = await stripe.products.create({
    name: 'Linkly Pro',
    description: 'For power users and small teams',
    metadata: { plan: 'PRO' },
  });

  const proPrice = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 900, // $9.00
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { plan: 'PRO' },
  });

  console.log('✅ Pro Plan created!');
  console.log(`   Product ID: ${proProduct.id}`);
  console.log(`   Price ID: ${proPrice.id}\n`);

  // Create Business Plan
  const bizProduct = await stripe.products.create({
    name: 'Linkly Business',
    description: 'For growing businesses and teams',
    metadata: { plan: 'BUSINESS' },
  });

  const bizPrice = await stripe.prices.create({
    product: bizProduct.id,
    unit_amount: 2900, // $29.00
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { plan: 'BUSINESS' },
  });

  console.log('✅ Business Plan created!');
  console.log(`   Product ID: ${bizProduct.id}`);
  console.log(`   Price ID: ${bizPrice.id}\n`);

  console.log('📝 Add these to your .env file:\n');
  console.log(`STRIPE_PRO_PRICE_ID="${proPrice.id}"`);
  console.log(`STRIPE_BUSINESS_PRICE_ID="${bizPrice.id}"`);
}

setup().catch(console.error);