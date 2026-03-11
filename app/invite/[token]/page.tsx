'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [producerName, setProducerName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Signup form state
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/invite/${token}`);
        if (!res.ok) {
          setError('Convite não encontrado ou expirado.');
          return;
        }
        const data = await res.json();
        setProducerName(data.name);
        if (data.email) setInviteEmail(data.email);
      } catch {
        setError('Erro ao carregar convite.');
      } finally {
        setLoading(false);
      }
    }
    fetchInvite();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Digite seu nome.');
      return;
    }
    if (password.length < 6) {
      setFormError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/invite/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Erro ao criar conta.');
        return;
      }

      // Store auth data and redirect to dashboard
      if (data.token) {
        localStorage.setItem('cf_token', data.token);
        localStorage.setItem('cf_email', data.email || inviteEmail);
        localStorage.setItem('cf_name', name.trim());
        localStorage.setItem('cf_plan', data.plan || '');
        router.push('/dashboard');
      } else {
        // Fallback: redirect to login
        router.push('/login');
      }
    } catch {
      setFormError('Erro de rede. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-900/20 border border-red-800/40 flex items-center justify-center mb-5">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Link inválido</h1>
          <p className="text-sm text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      {/* Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-violet-600/8 blur-[140px] rounded-full" />

      <div className="relative z-10 w-full max-w-md">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-violet-900/30 border border-violet-800/40 flex items-center justify-center mb-6">
          <Users className="w-7 h-7 text-violet-400" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Crie sua conta</h1>
          <p className="text-zinc-400 text-sm">
            <span className="text-white font-semibold">{producerName}</span> convidou você para acessar
          </p>
          <p className="text-zinc-400 text-sm">a equipe no CreatorFlow.</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (read-only, from invite) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={inviteEmail}
              readOnly
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-500 focus:outline-none cursor-not-allowed"
            />
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-zinc-600"
              autoFocus
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {formError && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/10 border border-red-800/30 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {formError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Criar Conta e Entrar
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer note */}
        <p className="text-[11px] text-zinc-600 mt-8 text-center">
          Powered by CreatorFlow AI
        </p>
      </div>
    </div>
  );
}
