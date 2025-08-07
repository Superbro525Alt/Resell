/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
// app/api/verify-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const config = {
  runtime: 'edge', // must be 'edge' for Cloudflare Workers
};

export async function POST(
  req: NextRequest,
  context: { env: { STRIPE_SECRET_KEY: string } }
) {
  const { sessionId } = await req.json();

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  const stripe = new Stripe(context.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product'],
    });

    const lineItem = session.line_items?.data?.[0];
    const product = (lineItem?.price?.product as any) || null;

    return NextResponse.json({
      sessionId: session.id,
      email: session.customer_details?.email,
      productId: product?.id,
      productName: product?.name,
      priceId: lineItem?.price?.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
