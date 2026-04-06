'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { isAdminEmail } from '@/lib/admin-emails';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  // Show timeout message from AuthGuard redirect
  useEffect(() => {
    if (window.location.search.includes('error=timeout')) {
      setErrors({ general: 'Sessão expirada. Faça login novamente.' });
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  const validate = () => {
    const errs: typeof errors = {};
    if (!email) errs.email = 'Email obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email inválido';
    if (!password) errs.password = 'Senha obrigatória';
    else if (password.length < 8) errs.password = 'Mínimo 8 caracteres';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.error || 'Erro ao fazer login' });
        setLoading(false);
        return;
      }

      // Save JWT token and user data
      localStorage.setItem('cf_token', data.token);
      const user = data.user;
      if (user) {
        localStorage.setItem('cf_email', user.email || '');
        localStorage.setItem('cf_name', user.name || '');
        if (user.plan) localStorage.setItem('cf_plan', user.plan);
        localStorage.setItem('cf_role', user.role || 'owner');

        // Admin bypass — always go to dashboard
        if (isAdminEmail(user.email || '')) {
          router.push('/dashboard');
        } else if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trial') {
          router.push('/subscription-inactive');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/dashboard');
      }
    } catch {
      setErrors({ general: 'Erro de conexão. Tente novamente.' });
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Bem-vindo de volta" subtitle="Entre na sua conta para continuar criando">
      {errors.general && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <div>
            <p className="text-[13px] text-red-400">{errors.general}</p>
            {errors.general.includes('inativa') && (
              <Link href="/#precos" className="text-[12px] text-[#8B5CF6] hover:underline mt-1 inline-block">
                Ver planos disponíveis
              </Link>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#A0A0A0]">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
              placeholder="seu@email.com"
              autoComplete="email"
              className="w-full rounded-xl border border-white/[0.1] bg-[#1A1A1A] py-3 pl-11 pr-4 text-sm text-white placeholder:text-[#555] outline-none transition-all focus:border-[#8B5CF6]/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]"
            />
          </div>
          {errors.email && <p className="mt-1 text-[13px] text-red-400">{errors.email}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#A0A0A0]">Senha</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
              placeholder="••••••••"
              autoComplete="current-password"
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#C026D3] py-3 text-[15px] font-bold uppercase tracking-wider text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(139,92,246,0.3)] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[#A0A0A0]">
        Não tem uma conta?{' '}
        <Link href="/#precos" className="font-semibold text-[#8B5CF6] hover:underline">
          Ver planos
        </Link>
      </p>
    </AuthLayout>
  );
}
