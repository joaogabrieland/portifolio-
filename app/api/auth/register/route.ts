import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { stripe, PLANS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, plan } = await req.json();

    if (!name || !email || !password || !plan) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Senha deve ter no mínimo 8 caracteres' }, { status: 400 });
    }
    const validPlans = Object.keys(PLANS);
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe não configurado' }, { status: 503 });
    }

    const customer = await stripe.customers.create({
      email: email.toLowerCase(),
      name,
      metadata: { plan },
    });

    const userResult = await query(
      `INSERT INTO users (name, email, password_hash, stripe_customer_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [name, email.toLowerCase(), passwordHash, customer.id]
    );
    const userId = userResult.rows[0].id;

    const planData = PLANS[plan as keyof typeof PLANS];
    await query(
      `INSERT INTO subscriptions (user_id, plan, status, stripe_price_id)
       VALUES ($1, $2, 'pending_payment', $3)`,
      [userId, plan, planData.priceId]
    );

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customer.id,
      line_items: [{ price: planData.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://creatorflowia.com'}/login?registered=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://creatorflowia.com'}/signup?plan=${plan}&canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'pt-BR',
      metadata: {
        userId,
        plan,
      },
    });

    // No JWT issued here — token only granted after payment confirmed via login
    return NextResponse.json({
      checkoutUrl: session.url,
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 });
  }
}
