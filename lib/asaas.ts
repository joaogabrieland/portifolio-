/**
 * Asaas Payment Integration
 * Handles customer and subscription management with Asaas API
 * API Base: https://api.asaas.com/v3
 */

export type PlanKey = 'solo' | 'maker' | 'studio' | 'agency';

// Plan values in BRL (Brazilian Real)
const PLAN_VALUES: Record<PlanKey, number> = {
  solo: 47.90,
  maker: 67.00,
  studio: 197.00,
  agency: 497.00,
};

const ASAAS_API_URL = 'https://api.asaas.com/v3';

// ─────────────────────────────────────────────────────────────
// Helper: Calculate trial end date (7 days from now)
// ─────────────────────────────────────────────────────────────
function getTrialEndDate(): string {
  const today = new Date();
  const trialEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  // Format: YYYY-MM-DD
  return trialEnd.toISOString().split('T')[0];
}

// ─────────────────────────────────────────────────────────────
// Create Asaas Customer
// ─────────────────────────────────────────────────────────────
export async function createAsaasCustomer(
  name: string,
  email: string,
  cpfCnpj: string
): Promise<{ customerId: string }> {
  // Debug logs to check if key is loaded
  console.log('🔑 DEBUG: process.env.ASAAS_API_KEY exists:', !!process.env.ASAAS_API_KEY);
  console.log('🔑 DEBUG: Key value:', JSON.stringify(process.env.ASAAS_API_KEY?.substring(0, 50) + '...'));
  console.log('🔑 DEBUG: Full key length:', process.env.ASAAS_API_KEY?.length);
  console.log('🔑 DEBUG: Starts with $aact:', process.env.ASAAS_API_KEY?.startsWith('$aact'));

  const ASAAS_KEY = process.env.ASAAS_API_KEY || '';

  if (!ASAAS_KEY) {
    console.error('❌ ASAAS_API_KEY is not configured in environment variables');
    throw new Error('ASAAS_API_KEY is not configured');
  }

  try {
    const response = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_KEY,
      },
      body: JSON.stringify({
        name,
        email,
        cpfCnpj: cpfCnpj.replace(/\D/g, ''), // Remove mask
        notificationByEmail: true,
        notificationBySms: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Asaas customer creation error:', error);
      throw new Error(
        error.errors?.[0]?.description || 'Failed to create Asaas customer'
      );
    }

    const data = await response.json();
    return { customerId: data.id };
  } catch (error) {
    console.error('Error creating Asaas customer:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// Create Asaas Subscription with Trial
// ─────────────────────────────────────────────────────────────
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
  mobilePhone?: string;
}

export async function createAsaasSubscription(
  customerId: string,
  plan: PlanKey,
  creditCard: CreditCardData,
  creditCardHolderInfo: CreditCardHolderInfo
): Promise<{ subscriptionId: string }> {
  const ASAAS_KEY = process.env.ASAAS_API_KEY || '';

  if (!ASAAS_KEY) {
    console.error('❌ ASAAS_API_KEY is not configured in environment variables');
    throw new Error('ASAAS_API_KEY is not configured');
  }

  const value = PLAN_VALUES[plan];
  if (!value) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  const nextDueDate = getTrialEndDate(); // 7 days from now

  try {
    const response = await fetch(`${ASAAS_API_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_KEY,
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'CREDIT_CARD',
        value,
        nextDueDate,
        cycle: 'MONTHLY',
        description: `CreatorFlow - ${plan} plan`,
        maxPaymentAttempts: 3,
        creditCard: {
          holderName: creditCard.cardHolderName,
          number: creditCard.cardNumber.replace(/\s/g, ''),
          expiryMonth: creditCard.cardExpiryMonth,
          expiryYear: creditCard.cardExpiryYear,
          ccv: creditCard.cardCcv,
        },
        creditCardHolderInfo: {
          name: creditCardHolderInfo.name,
          email: creditCardHolderInfo.email,
          cpfCnpj: creditCardHolderInfo.cpfCnpj.replace(/\D/g, ''),
          postalCode: creditCardHolderInfo.postalCode.replace(/\D/g, ''),
          addressNumber: creditCardHolderInfo.addressNumber,
          ...(creditCardHolderInfo.mobilePhone ? { mobilePhone: creditCardHolderInfo.mobilePhone } : {}),
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Asaas subscription creation error:', error);
      throw new Error(
        error.errors?.[0]?.description || 'Failed to create subscription'
      );
    }

    const data = await response.json();
    return { subscriptionId: data.id };
  } catch (error) {
    console.error('Error creating Asaas subscription:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// Get Plan Value
// ─────────────────────────────────────────────────────────────
export function getPlanValue(plan: PlanKey): number {
  return PLAN_VALUES[plan] || 0;
}

// ─────────────────────────────────────────────────────────────
// Validate CPF (basic check)
// ─────────────────────────────────────────────────────────────
export function isValidCPF(cpf: string): boolean {
  const cleanCpf = cpf.replace(/\D/g, '');
  if (cleanCpf.length !== 11) return false;

  // Check if all digits are the same (invalid CPF)
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

  return true;
}
