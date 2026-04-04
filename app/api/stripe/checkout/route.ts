import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Set STRIPE_SECRET_KEY.' },
      { status: 503 }
    );
  }

  try {
    const { priceId, customerEmail } = await req.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://creatorflowia.com';

    if (!priceId || typeof priceId !== 'string') {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: customerEmail || undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/#pricing`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'pt-BR',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
