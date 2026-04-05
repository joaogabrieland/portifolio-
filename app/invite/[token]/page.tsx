'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [producerName, setProducerName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');

  // Signup form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [name, setName]               = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [formError, setFormError]     = useState('');

  useEffect(() => {
    // Get role from URL query string
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role');
      if (roleParam === 'admin') {
        setInviteRole('admin');
      }
    }

    fetch(`/api/team/invite/validate?token=${token}`)
      .then(res => res.ok ? res.json() : Promise.reject(new Error('invalid')))
      .then(data => {
        setProducerName(data.agencyName || 'CreatorFlow');
        setInviteEmail(data.email || '');
        setLoading(false);
      })
      .catch(() => {
        setError('Convite não encontrado ou expirado.');
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      setFormError('Digite um e-mail válido.');
      return;
    }
    if (!name.trim()) {
      setFormError('Digite seu nome.');
      return;
    }
    if (password.length < 8) {
      setFormError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/invite/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: inviteEmail.trim(),
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || 'Erro ao criar conta. Tente novamente.');
        setSubmitting(false);
        return;
      }

      const data = await res.json();

      // Store the real JWT token returned by the server
      localStorage.setItem('cf_token', data.token);
      localStorage.setItem('cf_email', data.user.email);
      localStorage.setItem('cf_name', data.user.name);
      localStorage.setItem('cf_plan', data.user.plan || 'solo');
      localStorage.setItem('cf_role', inviteRole);

      router.push('/dashboard');
    } catch {
      setFormError('Erro de conexão. Tente novamente.');
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
          <p className="text-zinc-400 text-sm mb-4">a equipe no CreatorFlow.</p>

          {/* Role Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
            inviteRole === 'admin'
              ? 'bg-violet-900/30 border border-violet-800/40 text-violet-300'
              : 'bg-emerald-900/30 border border-emerald-800/40 text-emerald-300'
          }`}>
            {inviteRole === 'admin' ? '👑 Você será Administrador' : '👤 Você será Membro'}
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="Seu e-mail"
              required
              autoFocus
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-zinc-600"
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
                placeholder="Mínimo 8 caracteres"
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
