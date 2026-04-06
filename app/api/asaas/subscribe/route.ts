import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createAsaasSubscription } from '@/lib/asaas';

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

    // Update subscription in database
    const updateResult = await query(
      `UPDATE subscriptions SET
        asaas_subscription_id = $1,
        status = 'trial',
        updated_at = NOW()
       WHERE user_id = $2 AND plan = $3`,
      [asaasSubscriptionId, userId, plan]
    );

    if (updateResult.rowCount === 0) {
      console.error('Subscription not found for update:', userId, plan);
      return NextResponse.json(
        { error: 'Erro ao atualizar assinatura' },
        { status: 404 }
      );
    }

    console.log('✅ Subscription created successfully:', {
      userId,
      plan,
      asaasSubscriptionId,
      status: 'trial',
    });

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
