import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Asaas Webhook Handler
 * Processes payment and subscription events from Asaas
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, payment, subscription } = body;

    console.log('📨 Asaas webhook received:', event);

    // Validate required fields
    if (!event) {
      return NextResponse.json({ received: true });
    }

    switch (event) {
      // ─────────────────────────────────────────────────────────────
      // PAYMENT_RECEIVED: Trial period payment confirmed (first payment)
      // ─────────────────────────────────────────────────────────────
      case 'PAYMENT_RECEIVED': {
        if (!payment?.subscription) {
          console.warn('Payment received but no subscription ID');
          return NextResponse.json({ received: true });
        }

        try {
          const result = await query(
            `UPDATE subscriptions SET
              status = 'active',
              current_period_start = NOW(),
              current_period_end = NOW() + INTERVAL '30 days',
              updated_at = NOW()
             WHERE asaas_subscription_id = $1`,
            [payment.subscription]
          );

          if (result.rowCount === 0) {
            console.warn('Subscription not found for payment:', payment.subscription);
          } else {
            console.log('✅ Subscription activated:', payment.subscription);
          }
        } catch (dbError) {
          console.error('Database error updating subscription:', dbError);
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // PAYMENT_CONFIRMED: Recurring payment confirmed
      // ─────────────────────────────────────────────────────────────
      case 'PAYMENT_CONFIRMED': {
        if (!payment?.subscription) {
          console.warn('Payment confirmed but no subscription ID');
          return NextResponse.json({ received: true });
        }

        try {
          const result = await query(
            `UPDATE subscriptions SET
              status = 'active',
              current_period_start = NOW(),
              current_period_end = NOW() + INTERVAL '30 days',
              updated_at = NOW()
             WHERE asaas_subscription_id = $1`,
            [payment.subscription]
          );

          if (result.rowCount === 0) {
            console.warn('Subscription not found for confirmed payment:', payment.subscription);
          } else {
            console.log('✅ Recurring payment confirmed:', payment.subscription);
          }
        } catch (dbError) {
          console.error('Database error updating subscription:', dbError);
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // PAYMENT_OVERDUE: Payment failed or overdue
      // ─────────────────────────────────────────────────────────────
      case 'PAYMENT_OVERDUE': {
        if (!payment?.subscription) {
          console.warn('Payment overdue but no subscription ID');
          return NextResponse.json({ received: true });
        }

        try {
          const result = await query(
            `UPDATE subscriptions SET
              status = 'past_due',
              updated_at = NOW()
             WHERE asaas_subscription_id = $1`,
            [payment.subscription]
          );

          if (result.rowCount === 0) {
            console.warn('Subscription not found for overdue payment:', payment.subscription);
          } else {
            console.log('⚠️ Subscription marked as past_due:', payment.subscription);
          }
        } catch (dbError) {
          console.error('Database error marking subscription past_due:', dbError);
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // SUBSCRIPTION_DELETED: Subscription canceled
      // ─────────────────────────────────────────────────────────────
      case 'SUBSCRIPTION_DELETED': {
        if (!subscription?.id) {
          console.warn('Subscription deleted but no subscription ID');
          return NextResponse.json({ received: true });
        }

        try {
          const result = await query(
            `UPDATE subscriptions SET
              status = 'canceled',
              updated_at = NOW()
             WHERE asaas_subscription_id = $1`,
            [subscription.id]
          );

          if (result.rowCount === 0) {
            console.warn('Subscription not found for deletion:', subscription.id);
          } else {
            console.log('❌ Subscription canceled:', subscription.id);
          }
        } catch (dbError) {
          console.error('Database error canceling subscription:', dbError);
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // SUBSCRIPTION_CREATED: Subscription created (informational)
      // ─────────────────────────────────────────────────────────────
      case 'SUBSCRIPTION_CREATED': {
        console.log('📝 Subscription created:', subscription?.id);
        break;
      }

      // ─────────────────────────────────────────────────────────────
      // SUBSCRIPTION_UPDATED: Subscription updated (informational)
      // ─────────────────────────────────────────────────────────────
      case 'SUBSCRIPTION_UPDATED': {
        console.log('🔄 Subscription updated:', subscription?.id);
        break;
      }

      default:
        console.warn('Unhandled event type:', event);
    }

    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    // Still return 200 to prevent retries on malformed requests
    return NextResponse.json({ received: true });
  }
}
