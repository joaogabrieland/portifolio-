'use client';

import Link from 'next/link';
import { AlertTriangle, CreditCard, Mail, LogIn } from 'lucide-react';

export default function SubscriptionInactivePage() {
  const handleLogout = () => {
    localStorage.removeItem('cf_token');
    localStorage.removeItem('cf_email');
    localStorage.removeItem('cf_name');
    localStorage.removeItem('cf_plan');
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
          <AlertTriangle className="h-8 w-8 text-yellow-400" />
        </div>

        <h1 className="font-display text-2xl font-bold text-white mb-2">
          Sua assinatura está inativa
        </h1>
        <p className="text-[#A0A0A0] mb-8">
          Para continuar usando o CreatorFlow, renove seu plano.
        </p>

        <div className="space-y-3">
          <Link
            href="/#precos"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#C026D3] py-3 text-[15px] font-bold uppercase tracking-wider text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(139,92,246,0.3)]"
          >
            <CreditCard className="h-4 w-4" />
            Ver Planos
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-medium text-[#A0A0A0] transition-all hover:border-white/20 hover:text-white"
          >
            <LogIn className="h-4 w-4" />
            Fazer Login com outra conta
          </button>

          <a
            href="mailto:contato@creatorflowia.com"
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm text-[#666] hover:text-[#8B5CF6] transition-colors"
          >
            <Mail className="h-4 w-4" />
            Precisa de ajuda? Entre em contato
          </a>
        </div>
      </div>
    </div>
  );
}
