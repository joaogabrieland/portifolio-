'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';

type FormData = {
  cardHolderName: string;
  cardNumber: string;
  cardExpiryMonth: string;
  cardExpiryYear: string;
  cardCcv: string;
  cep: string;
  addressNumber: string;
  cpf: string;
};

export default function PagamentoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Get data from URL params
  const customerId = searchParams.get('customerId');
  const plan = searchParams.get('plan');
  const value = searchParams.get('value');
  const userId = searchParams.get('userId');
  const email = searchParams.get('email');
  const name = searchParams.get('name');

  const [formData, setFormData] = useState<FormData>({
    cardHolderName: name || '',
    cardNumber: '',
    cardExpiryMonth: '',
    cardExpiryYear: '',
    cardCcv: '',
    cep: '',
    addressNumber: '',
    cpf: '',
  });

  // Redirect if missing params
  useEffect(() => {
    if (!customerId || !plan || !value || !userId) {
      router.push('/signup');
    }
  }, [customerId, plan, value, userId, router]);

  // Format credit card number with spaces
  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim();
  };

  // Format CPF
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  // Format CEP
  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let formattedValue = value;
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'cep') {
      formattedValue = formatCEP(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Nome do titular é obrigatório';
    }

    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
    if (cardNumberClean.length !== 16) {
      newErrors.cardNumber = 'Número do cartão deve ter 16 dígitos';
    }

    if (!formData.cardExpiryMonth || !formData.cardExpiryYear) {
      newErrors.cardExpiry = 'Data de validade é obrigatória';
    }

    if (formData.cardCcv.length !== 3) {
      newErrors.cardCcv = 'CCV deve ter 3 dígitos';
    }

    const cepClean = formData.cep.replace(/\D/g, '');
    if (cepClean.length !== 8) {
      newErrors.cep = 'CEP deve ter 8 dígitos';
    }

    if (!formData.addressNumber.trim()) {
      newErrors.addressNumber = 'Número do endereço é obrigatório';
    }

    const cpfClean = formData.cpf.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      newErrors.cpf = 'CPF deve ter 11 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/asaas/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          userId,
          plan,
          creditCard: {
            cardNumber: formData.cardNumber,
            cardExpiryMonth: formData.cardExpiryMonth,
            cardExpiryYear: formData.cardExpiryYear,
            cardCcv: formData.cardCcv,
            cardHolderName: formData.cardHolderName,
          },
          creditCardHolderInfo: {
            name: formData.cardHolderName,
            email: email || '',
            cpfCnpj: formData.cpf.replace(/\D/g, ''),
            postalCode: formData.cep.replace(/\D/g, ''),
            addressNumber: formData.addressNumber,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Erro ao processar pagamento' });
        setLoading(false);
        return;
      }

      // Show success and redirect
      setSuccess(true);
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      setErrors({ general: 'Erro de conexão. Tente novamente.' });
      setLoading(false);
    }
  };

  if (!customerId || !plan || !value) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {success ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Pagamento Processado!</h2>
            <p className="text-zinc-400 mb-6">
              Sua conta foi criada com sucesso. Você será redirecionado para fazer login em alguns segundos...
            </p>
            <p className="text-sm text-zinc-500">
              Seu plano {plan} será ativado após confirmação do pagamento.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Ativar minha conta</h1>
              <p className="text-zinc-400">
                Plano <span className="text-emerald-500 font-semibold">{plan.toUpperCase()}</span> - 7 dias grátis
              </p>
            </div>

            {errors.general && (
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Card Holder Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Nome no cartão
                </label>
                <input
                  type="text"
                  name="cardHolderName"
                  value={formData.cardHolderName}
                  onChange={handleInputChange}
                  placeholder="JOÃO SILVA"
                  className={`w-full bg-zinc-900 border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 ${
                    errors.cardHolderName ? 'border-red-600' : 'border-zinc-700'
                  }`}
                />
                {errors.cardHolderName && (
                  <p className="text-red-400 text-xs mt-1">{errors.cardHolderName}</p>
                )}
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Número do cartão
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className={`w-full bg-zinc-900 border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 ${
                    errors.cardNumber ? 'border-red-600' : 'border-zinc-700'
                  }`}
                />
                {errors.cardNumber && (
                  <p className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>
                )}
              </div>

              {/* Expiry and CCV */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Mês</label>
                  <input
                    type="text"
                    name="cardExpiryMonth"
                    value={formData.cardExpiryMonth}
                    onChange={handleInputChange}
                    placeholder="MM"
                    maxLength={2}
                    className={`w-full bg-zinc-900 border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 ${
                      errors.cardExpiry ? 'border-red-600' : 'border-zinc-700'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Ano</label>
                  <input
                    type="text"
                    name="cardExpiryYear"
                    value={formData.cardExpiryYear}
                    onChange={handleInputChange}
                    placeholder="YY"
                    maxLength={2}
                    className={`w-full bg-zinc-900 border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 ${
                      errors.cardExpiry ? 'border-red-600' : 'border-zinc-700'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">CCV</label>
                  <input
                    type="text"
                    name="cardCcv"
                    value={formData.cardCcv}
                    onChange={handleInputChange}
                    placeholder="000"
                    maxLength={3}
                    className={`w-full bg-zinc-900 border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 ${
                      errors.cardCcv ? 'border-red-600' : 'border-zinc-700'
                    }`}
                  />
                  {errors.cardCcv && (
                    <p className="text-red-400 text-xs mt-1">{errors.cardCcv}</p>
                  )}
                </div>
              </div>

              {/* CEP */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">CEP</label>
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  placeholder="00000-000"
                  maxLength={9}
                  className={`w-full bg-zinc-900 border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 ${
                    errors.cep ? 'border-red-600' : 'border-zinc-700'
                  }`}
                />
                {errors.cep && (
                  <p className="text-red-400 text-xs mt-1">{errors.cep}</p>
                )}
              </div>

              {/* Address Number */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Número do endereço
                </label>
                <input
                  type="text"
                  name="addressNumber"
                  value={formData.addressNumber}
                  onChange={handleInputChange}
                  placeholder="123"
                  className={`w-full bg-zinc-900 border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 ${
                    errors.addressNumber ? 'border-red-600' : 'border-zinc-700'
                  }`}
                />
                {errors.addressNumber && (
                  <p className="text-red-400 text-xs mt-1">{errors.addressNumber}</p>
                )}
              </div>

              {/* CPF */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">CPF</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={`w-full bg-zinc-900 border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 ${
                    errors.cpf ? 'border-red-600' : 'border-zinc-700'
                  }`}
                />
                {errors.cpf && (
                  <p className="text-red-400 text-xs mt-1">{errors.cpf}</p>
                )}
              </div>

              {/* Security notice */}
              <div className="flex gap-2 text-xs text-zinc-400 bg-zinc-900 p-3 rounded-lg">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <p>Seus dados são encriptados e processados com segurança pelo Asaas</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold py-4 rounded-xl mt-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                {loading ? 'Processando...' : 'Ativar minha conta - 7 dias grátis'}
              </button>

              <p className="text-xs text-zinc-500 text-center">
                Após o período de teste, você será cobrado automaticamente.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
