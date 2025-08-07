// app/api/verify-session/route.ts
import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json();

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

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
