import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createAsaasSubscription } from '@/lib/asaas';
import { sendWelcomeEmail, sendTrialActivatedEmail } from '@/lib/email';

interface CreditCardData {
  cardNumber: string;
  cardExpiryMonth: string;
  cardExpiryYear: string;
  cardCcv: string;
  cardHolderName: string;
}

interface CreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
}

export async function POST(req: NextRequest) {
  try {
    const {
      customerId,
      userId,
      plan,
      creditCard,
      creditCardHolderInfo,
    } = await req.json();

    // Validation
    if (!customerId || !userId || !plan || !creditCard || !creditCardHolderInfo) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    if (
      !creditCard.cardNumber ||
      !creditCard.cardExpiryMonth ||
      !creditCard.cardExpiryYear ||
      !creditCard.cardCcv ||
      !creditCard.cardHolderName
    ) {
      return NextResponse.json(
        { error: 'Dados do cartão incompletos' },
        { status: 400 }
      );
    }

    // Create subscription in Asaas
    let asaasSubscriptionId: string;
    try {
      const { subscriptionId } = await createAsaasSubscription(
        customerId,
        plan,
        creditCard as CreditCardData,
        creditCardHolderInfo as CreditCardHolderInfo
      );
      asaasSubscriptionId = subscriptionId;
    } catch (asaasError) {
      console.error('Asaas subscription error:', asaasError);
      return NextResponse.json(
        {
          error:
            asaasError instanceof Error
              ? asaasError.message
              : 'Erro ao processar assinatura',
        },
        { status: 500 }
      );
    }

    // Step 1: Save asaas_subscription_id immediately so webhooks can find this subscription
    await query(
      `UPDATE subscriptions SET asaas_subscription_id = $1, updated_at = NOW()
       WHERE user_id = $2 AND plan = $3`,
      [asaasSubscriptionId, userId, plan]
    );

    // Step 2: Activate trial — only if webhook hasn't already set it to 'active'
    const updateResult = await query(
      `UPDATE subscriptions SET
        status = 'trial',
        current_period_start = NOW(),
        current_period_end = NOW() + INTERVAL '7 days',
        updated_at = NOW()
       WHERE user_id = $2 AND plan = $3 AND status = 'pending_payment'`,
      [userId, plan]
    );

    if (updateResult.rowCount === 0) {
      // Either subscription not found, or webhook already activated it — both OK
      const check = await query(
        `SELECT status FROM subscriptions WHERE user_id = $1 AND plan = $2`,
        [userId, plan]
      );
      if (check.rows.length === 0) {
        console.error('Subscription not found for update:', userId, plan);
        return NextResponse.json(
          { error: 'Erro ao atualizar assinatura' },
          { status: 404 }
        );
      }
      console.log('ℹ️ Subscription already activated by webhook:', check.rows[0].status);
    }

    console.log('✅ Subscription created successfully:', {
      userId,
      plan,
      asaasSubscriptionId,
      status: 'trial',
    });

    // Get user data for email sending
    const userResult = await query(
      'SELECT name, email FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length > 0) {
      const { name, email } = userResult.rows[0];

      // Send welcome and trial activated emails
      sendWelcomeEmail(name, email, plan).catch(err => {
        console.error('Failed to send welcome email:', err);
      });

      sendTrialActivatedEmail(name, email).catch(err => {
        console.error('Failed to send trial activated email:', err);
      });
    }

    return NextResponse.json({
      success: true,
      subscriptionId: asaasSubscriptionId,
      status: 'trial',
    });
  } catch (error: unknown) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar assinatura' },
      { status: 500 }
    );
  }
}
