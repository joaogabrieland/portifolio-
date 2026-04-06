import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail, sendTrialActivatedEmail } from '@/lib/email';

/**
 * TEMPORARY TEST ROUTE - Delete after testing
 * GET /api/test-email?type=welcome|trial&email=test@example.com
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'welcome';
    const email = searchParams.get('email') || 'test@creatorflowia.com';
    const plan = searchParams.get('plan') || 'studio';

    // Test data
    const testName = 'Teste CreatorFlow';

    let result: boolean;

    if (type === 'trial') {
      console.log(`📧 Testing sendTrialActivatedEmail to ${email}...`);
      result = await sendTrialActivatedEmail(testName, email);
    } else {
      console.log(`📧 Testing sendWelcomeEmail to ${email} with plan ${plan}...`);
      result = await sendWelcomeEmail(testName, email, plan);
    }

    if (result) {
      return NextResponse.json(
        {
          success: true,
          message: `Email de teste enviado com sucesso para ${email}`,
          type,
          email,
          plan,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `Erro ao enviar email de teste. Verifique os logs.`,
          type,
          email,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Test email route error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao testar email',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
