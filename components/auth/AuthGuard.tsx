'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/subscription-inactive'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/#');

    if (isPublic) {
      setChecked(true);
      return;
    }

    // ── DEV BYPASS: passe livre total em desenvolvimento ──────────────────
    if (process.env.NODE_ENV === 'development') {
      // Garante que as chaves necessárias para o dashboard existam
      if (!localStorage.getItem('cf_token')) {
        localStorage.setItem('cf_token', 'dev-token-bypass');
      }
      if (!localStorage.getItem('cf_name')) {
        localStorage.setItem('cf_name', 'Dev User');
      }
      if (!localStorage.getItem('cf_email')) {
        localStorage.setItem('cf_email', 'dev@creatorflow.local');
      }
      // Plano máximo para ter acesso a todos os recursos
      localStorage.setItem('cf_plan', 'agency');
      setChecked(true);
      return;
    }
    // ─────────────────────────────────────────────────────────────────────

    const token = localStorage.getItem('cf_token');
    if (!token) {
      router.replace('/login');
      return;
    }

    // Verify token + subscription with API
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          // Token invalid/expired — clear and redirect
          localStorage.removeItem('cf_token');
          localStorage.removeItem('cf_email');
          localStorage.removeItem('cf_name');
          localStorage.removeItem('cf_plan');
          router.replace('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;

        const adminEmails = [process.env.NEXT_PUBLIC_ADMIN_EMAIL, 'marcosvlogs12@gmail.com', 'teste@creatorflowia.com'].filter(Boolean);
        const isAdmin = adminEmails.includes(data.user?.email);

        if (!isAdmin && data.user?.subscriptionStatus !== 'active') {
          router.replace('/subscription-inactive');
          return;
        }

        // Update local user data
        localStorage.setItem('cf_email', data.user.email);
        localStorage.setItem('cf_name', data.user.name);
        localStorage.setItem('cf_plan', data.user.plan || '');
        setChecked(true);
      })
      .catch(() => {
        // Network error — allow access with existing token (offline-first)
        setChecked(true);
      });
  }, [pathname, router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
