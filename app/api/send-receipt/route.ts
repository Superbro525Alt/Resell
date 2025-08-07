import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const config = {
  runtime: 'nodejs',
};

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { to, orderId, productName, priceId } = await req.json();

  try {
    const data = await resend.emails.send({
      from: 'Your Store <noreply@paulsstuff.dev>',
      to,
      subject: 'Your Order Receipt',
      html: `
        <h2>Thank you for your order!</h2>
        <p>We’ve received your payment and your order is now being processed.</p>
        <ul>
          <li><strong>Product:</strong> ${productName}</li>
          <li><strong>Order ID:</strong> ${orderId}</li>
          <li><strong>Stripe Price ID:</strong> ${priceId}</li>
        </ul>
        <p>We’ll notify you once your order is on its way!</p>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Failed to send email:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
