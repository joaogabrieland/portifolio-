'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import PasswordStrength from '@/components/auth/PasswordStrength';

const PLAN_INFO: Record<string, { name: string; price: string; features: string[] }> = {
  solo: {
    name: 'Start',
    price: 'R$ 49,90/mês',
    features: ['1 membro', '100 roteiros/mês', '10 propostas/mês', '5 storyboards/mês'],
  },
  maker: {
    name: 'Maker',
    price: 'R$ 67,90/mês',
    features: ['CRM ilimitado', '10GB armazenamento', '100 roteiros/mês', '10 storyboards/mês'],
  },
  studio: {
    name: 'Studio',
    price: 'R$ 197,90/mês',
    features: ['5 membros', '50GB armazenamento', '5.000 roteiros/mês', '40 storyboards/mês'],
  },
  agency: {
    name: 'Agency',
    price: 'R$ 497,90/mês',
    features: ['50 membros', '200GB armazenamento', '5.000 roteiros/mês', '120 storyboards/mês'],
  },
};

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('');
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    const search = window.location.search;
    const planMatch = search.match(/[?&]plan=([^&]+)/);
    if (planMatch && PLAN_INFO[planMatch[1]]) {
      setPlan(planMatch[1]);
    }
    if (search.includes('canceled=true')) {
      setCanceled(true);
    }
  }, []);

  // Format CPF with mask: XXX.XXX.XXX-XX
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  // Validate CPF (basic check)
  const isValidCPF = (cpfValue: string): boolean => {
    const cleanCpf = cpfValue.replace(/\D/g, '');
    if (cleanCpf.length !== 11) return false;
    // Check if all digits are the same (invalid CPF)
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
    return true;
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Nome obrigatório';
    if (!email) errs.email = 'Email obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email inválido';
    if (!password) errs.password = 'Senha obrigatória';
    else if (password.length < 8) errs.password = 'Mínimo 8 caracteres';
    if (confirmPassword !== password) errs.confirmPassword = 'Senhas não coincidem';
    if (!cpf || !isValidCPF(cpf)) errs.cpf = 'CPF inválido';
    if (!accepted) errs.accepted = 'Aceite os termos para continuar';
    if (!plan) errs.general = 'Selecione um plano';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, cpfCnpj: cpf, plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.error || 'Erro ao criar conta' });
        setLoading(false);
        return;
      }

      // Redirect to payment page with necessary data
      if (data.requiresPayment) {
        const params = new URLSearchParams({
          userId: data.userId,
          customerId: data.customerId,
          plan: data.plan,
          value: data.value.toString(),
          email: data.email,
          name: data.name,
        });
        router.push(`/pagamento?${params.toString()}`);
      }
    } catch {
      setErrors({ general: 'Erro de conexão. Tente novamente.' });
      setLoading(false);
    }
  };

  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password;
  const passwordsMismatch = confirmPassword.length > 0 && confirmPassword !== password;
  const isValid = name.trim() && email && password.length >= 8 && confirmPassword === password && cpf && isValidCPF(cpf) && accepted && plan;
  const selectedPlan = plan ? PLAN_INFO[plan] : null;

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle={selectedPlan ? `Plano ${selectedPlan.name} — ${selectedPlan.price}` : 'Escolha um plano para começar'}
    >
      {canceled && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0" />
          <p className="text-[13px] text-yellow-400">Pagamento cancelado. Tente novamente.</p>
        </div>
      )}

      {errors.general && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-[13px] text-red-400">{errors.general}</p>
        </div>
      )}

      {selectedPlan && (
        <div className="mb-6 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-white">Plano {selectedPlan.name}</p>
              <p className="text-xs text-[#A0A0A0]">{selectedPlan.price}</p>
            </div>
            <Link href="/#precos" className="text-xs text-[#8B5CF6] hover:underline">
              Trocar plano
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedPlan.features.map((f) => (
              <span key={f} className="inline-flex items-center gap-1 rounded-full bg-[#8B5CF6]/10 px-2.5 py-1 text-[11px] text-[#A78BFA]">
                <Check className="h-3 w-3" />
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {!plan && (
        <div className="mb-6">
          <p className="text-sm text-[#A0A0A0] mb-3">Selecione seu plano:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(PLAN_INFO).map(([key, info]) => (
              <button
                key={key}
                type="button"
                onClick={() => { setPlan(key); setErrors((p) => ({ ...p, general: '' })); }}
                className={`rounded-lg border p-3 text-left transition-all ${
                  plan === key
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                    : 'border-white/10 bg-[#1A1A1A] hover:border-white/20'
                }`}
              >
                <p className="text-sm font-semibold text-white">{info.name}</p>
                <p className="text-xs text-[#A0A0A0]">{info.price}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#A0A0A0]">Nome completo</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
              placeholder="Seu nome"
              autoComplete="name"
              className="w-full rounded-xl border border-white/[0.1] bg-[#1A1A1A] py-3 pl-11 pr-4 text-sm text-white placeholder:text-[#555] outline-none transition-all focus:border-[#8B5CF6]/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]"
            />
          </div>
          {errors.name && <p className="mt-1 text-[13px] text-red-400">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#A0A0A0]">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
              placeholder="seu@email.com"
              autoComplete="email"
              className="w-full rounded-xl border border-white/[0.1] bg-[#1A1A1A] py-3 pl-11 pr-4 text-sm text-white placeholder:text-[#555] outline-none transition-all focus:border-[#8B5CF6]/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]"
            />
          </div>
          {errors.email && <p className="mt-1 text-[13px] text-red-400">{errors.email}</p>}
        </div>

        {/* CPF */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#A0A0A0]">CPF</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
            <input
              type="text"
              value={cpf}
              onChange={(e) => { setCpf(formatCPF(e.target.value)); setErrors((p) => ({ ...p, cpf: '' })); }}
              placeholder="000.000.000-00"
              maxLength={14}
              className="w-full rounded-xl border border-white/[0.1] bg-[#1A1A1A] py-3 pl-11 pr-4 text-sm text-white placeholder:text-[#555] outline-none transition-all focus:border-[#8B5CF6]/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]"
            />
          </div>
          {errors.cpf && <p className="mt-1 text-[13px] text-red-400">{errors.cpf}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#A0A0A0]">Senha</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              className="w-full rounded-xl border border-white/[0.1] bg-[#1A1A1A] py-3 pl-11 pr-12 text-sm text-white placeholder:text-[#555] outline-none transition-all focus:border-[#8B5CF6]/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-[13px] text-red-400">{errors.password}</p>}
          <PasswordStrength password={password} />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#A0A0A0]">Confirmar senha</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
              placeholder="Repita a senha"
              autoComplete="new-password"
              className={`w-full rounded-xl border bg-[#1A1A1A] py-3 pl-11 pr-12 text-sm text-white placeholder:text-[#555] outline-none transition-all focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] ${
                passwordsMatch ? 'border-green-500/50 focus:border-green-500/60' : passwordsMismatch ? 'border-red-500/50 focus:border-red-500/60' : 'border-white/[0.1] focus:border-[#8B5CF6]/60'
              }`}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {passwordsMatch && <Check className="h-4 w-4 text-green-400" />}
              {passwordsMismatch && <X className="h-4 w-4 text-red-400" />}
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-[#666666] hover:text-white transition-colors"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-[13px] text-red-400">{errors.confirmPassword}</p>}
        </div>

        {/* Terms checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => { setAccepted(e.target.checked); setErrors((p) => ({ ...p, accepted: '' })); }}
              className="peer sr-only"
            />
            <div className="h-5 w-5 rounded-md border border-white/20 bg-[#1A1A1A] transition-all peer-checked:border-[#8B5CF6] peer-checked:bg-gradient-to-br peer-checked:from-[#7C3AED] peer-checked:to-[#C026D3] group-hover:border-white/30">
              {accepted && <Check className="h-5 w-5 p-0.5 text-white" />}
            </div>
          </div>
          <span className="text-[13px] leading-relaxed text-[#A0A0A0]">
            Li e aceito os{' '}
            <span className="text-[#8B5CF6]">Termos de Uso</span>
            {' '}e{' '}
            <span className="text-[#8B5CF6]">Política de Privacidade</span>
          </span>
        </label>
        {errors.accepted && <p className="text-[13px] text-red-400 -mt-2">{errors.accepted}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#C026D3] py-3 text-[15px] font-bold uppercase tracking-wider text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(139,92,246,0.3)] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Criando conta...
            </>
          ) : (
            'Criar conta - Próxima: Dados do cartão'
          )}
        </button>
      </form>

      {/* Bottom link */}
      <p className="mt-8 text-center text-sm text-[#A0A0A0]">
        Já tem uma conta?{' '}
        <Link href="/login" className="font-semibold text-[#8B5CF6] hover:underline">
          Fazer login
        </Link>
      </p>
    </AuthLayout>
  );
}
