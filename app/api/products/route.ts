/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
// app/api/products/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const config = {
  runtime: 'edge', // switch to 'edge' for Cloudflare
};

export async function GET(_req: Request, context: { env: { STRIPE_SECRET_KEY: string } }) {
  try {
    const stripe = new Stripe(context.env.STRIPE_SECRET_KEY);

    const products = await stripe.products.list({ active: true });
    const prices = await stripe.prices.list({ active: true });

    const items = products.data.map(product => {
      const price = prices.data.find(p => p.product === product.id);

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        image: product.images?.[0] ?? null,
        price: {
          id: price?.id,
          unit_amount: price?.unit_amount,
          currency: price?.currency,
        },
      };
    });

    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
