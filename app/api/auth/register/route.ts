import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { createAsaasCustomer, getPlanValue, isValidCPF, PlanKey } from '@/lib/asaas';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, cpfCnpj, plan } = await req.json();

    // Validation
    if (!name || !email || !password || !cpfCnpj || !plan) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Senha deve ter no mínimo 8 caracteres' },
        { status: 400 }
      );
    }

    if (!isValidCPF(cpfCnpj)) {
      return NextResponse.json(
        { error: 'CPF inválido' },
        { status: 400 }
      );
    }

    const validPlans = ['solo', 'maker', 'studio', 'agency'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [
      email.toLowerCase(),
    ]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user in database
    const userResult = await query(
      `INSERT INTO users (name, email, password_hash, cpf_cnpj, role)
       VALUES ($1, $2, $3, $4, 'owner') RETURNING id`,
      [name, email.toLowerCase(), passwordHash, cpfCnpj]
    );
    const userId = userResult.rows[0].id;

    // Create Asaas customer
    let asaasCustomerId: string;
    try {
      const { customerId } = await createAsaasCustomer(name, email.toLowerCase(), cpfCnpj);
      asaasCustomerId = customerId;
    } catch (asaasError) {
      console.error('Error creating Asaas customer:', asaasError);
      // Delete user if Asaas fails
      await query('DELETE FROM users WHERE id = $1', [userId]);
      return NextResponse.json(
        { error: 'Erro ao processar pagamento. Tente novamente.' },
        { status: 500 }
      );
    }

    // Create subscription record (status: pending_payment)
    await query(
      `INSERT INTO subscriptions (user_id, plan, status, asaas_customer_id)
       VALUES ($1, $2, 'pending_payment', $3)`,
      [userId, plan, asaasCustomerId]
    );

    const planValue = getPlanValue(plan as PlanKey);

    return NextResponse.json({
      requiresPayment: true,
      userId,
      customerId: asaasCustomerId,
      plan,
      value: planValue,
      email: email.toLowerCase(),
      name,
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    );
  }
}
