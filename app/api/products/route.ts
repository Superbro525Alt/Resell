// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
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

