import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function listPrices() {
  console.log('\n📋 Fetching Stripe products & prices...\n');
  
  const products = await stripe.products.list({ active: true });
  
  for (const product of products.data) {
    console.log(`\n📦 Product: ${product.name}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Metadata:`, product.metadata);
    
    const prices = await stripe.prices.list({ product: product.id });
    
    prices.data.forEach((price) => {
      console.log(`   💰 Price: ${price.id}`);
      console.log(`      Amount: $${(price.unit_amount! / 100).toFixed(2)}/${price.recurring?.interval}`);
    });
  }
  
  console.log('\n📝 Your .env should have:\n');
  
  const proProduct = products.data.find(p => p.metadata.plan === 'PRO');
  const bizProduct = products.data.find(p => p.metadata.plan === 'BUSINESS');
  
  if (proProduct) {
    const proPrices = await stripe.prices.list({ product: proProduct.id });
    if (proPrices.data[0]) {
      console.log(`STRIPE_PRO_PRICE_ID="${proPrices.data[0].id}"`);
    }
  }
  
  if (bizProduct) {
    const bizPrices = await stripe.prices.list({ product: bizProduct.id });
    if (bizPrices.data[0]) {
      console.log(`STRIPE_BUSINESS_PRICE_ID="${bizPrices.data[0].id}"`);
    }
  }
}

listPrices().catch(console.error);