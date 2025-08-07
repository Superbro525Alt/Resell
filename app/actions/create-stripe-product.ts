'use server';

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createStripeProduct(name: string, price: number) {
  const product = await stripe.products.create({ name });

  const priceObj = await stripe.prices.create({
    product: product.id,
    unit_amount: price * 100,
    currency: 'usd',
  });

  return {
    productId: product.id,
    priceId: priceObj.id,
  };
}
