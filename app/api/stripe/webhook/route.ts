import { NextRequest, NextResponse } from 'next/server';
import { stripe, getPlanKeyByPriceId } from '@/lib/stripe';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
        const periodStart = subscription.current_period_start || subscription.items?.data?.[0]?.current_period_start || Math.floor(Date.now() / 1000);
        const periodEnd = subscription.current_period_end || subscription.items?.data?.[0]?.current_period_end || Math.floor(Date.now() / 1000) + 30 * 86400;

        const result = await query(
          `UPDATE subscriptions SET
            stripe_subscription_id = $1,
            status = 'active',
            current_period_start = to_timestamp($2),
            current_period_end = to_timestamp($3),
            updated_at = NOW()
          WHERE user_id = (SELECT id FROM users WHERE stripe_customer_id = $4)`,
          [subscriptionId, periodStart, periodEnd, customerId]
        );

        if (result.rowCount === 0) {
          console.error('Webhook: no subscription found for customer');
        } else {
          console.warn('Checkout completed — subscription activated');
        }
        break;
      }

      case 'customer.subscription.updated': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = event.data.object as any;
        const status = subscription.status;
        const subPeriodStart = subscription.current_period_start || subscription.items?.data?.[0]?.current_period_start || 0;
        const subPeriodEnd = subscription.current_period_end || subscription.items?.data?.[0]?.current_period_end || 0;
        const newPriceId = subscription.items?.data?.[0]?.price?.id || null;

        // Resolve plan key from price ID (handles upgrades/downgrades)
        const newPlanKey = newPriceId ? getPlanKeyByPriceId(newPriceId) : null;

        if (newPlanKey) {
          // Update including plan field
          await query(
            `UPDATE subscriptions SET
              status = $1,
              current_period_start = to_timestamp($2),
              current_period_end = to_timestamp($3),
              cancel_at_period_end = $4,
              stripe_price_id = $5,
              plan = $6,
              updated_at = NOW()
            WHERE stripe_subscription_id = $7`,
            [status, subPeriodStart, subPeriodEnd, subscription.cancel_at_period_end, newPriceId, newPlanKey, subscription.id]
          );
        } else {
          // Update without changing plan field
          await query(
            `UPDATE subscriptions SET
              status = $1,
              current_period_start = to_timestamp($2),
              current_period_end = to_timestamp($3),
              cancel_at_period_end = $4,
              stripe_price_id = $5,
              updated_at = NOW()
            WHERE stripe_subscription_id = $6`,
            [status, subPeriodStart, subPeriodEnd, subscription.cancel_at_period_end, newPriceId, subscription.id]
          );
        }

        console.warn('Subscription updated:', subscription.id, '->', status, newPlanKey ? `plan: ${newPlanKey}` : '');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        await query(
          `UPDATE subscriptions SET
            status = 'canceled',
            updated_at = NOW()
          WHERE stripe_subscription_id = $1`,
          [subscription.id]
        );

        console.warn('Subscription canceled:', subscription.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          await query(
            `UPDATE subscriptions SET
              status = 'past_due',
              updated_at = NOW()
            WHERE stripe_subscription_id = $1`,
            [subscriptionId]
          );
        }

        console.warn('Payment failed for subscription:', subscriptionId);
        break;
      }

      default:
        console.warn('Unhandled event type:', event.type);
    }
  } catch (dbError) {
    console.error('Database error processing webhook:', dbError);
    // Return 500 so Stripe retries the webhook
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
