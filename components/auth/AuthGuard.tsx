'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/subscription-inactive'];
const ADMIN_EMAILS = ['marcosvlogs12@gmail.com', 'teste@creatorflowia.com'];

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

    // ── DEV BYPASS ──
    if (process.env.NODE_ENV === 'development') {
      if (!localStorage.getItem('cf_token')) localStorage.setItem('cf_token', 'dev-token-bypass');
      if (!localStorage.getItem('cf_name')) localStorage.setItem('cf_name', 'Dev User');
      if (!localStorage.getItem('cf_email')) localStorage.setItem('cf_email', 'dev@creatorflow.local');
      localStorage.setItem('cf_plan', 'agency');
      setChecked(true);
      return;
    }

    const token = localStorage.getItem('cf_token');
    if (!token) {
      router.replace('/login');
      return;
    }

    // Fetch user data — do NOT redirect until this resolves
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
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
        if (!data || !data.user) return;

        const email = data.user.email || '';

        // Update local user data immediately
        localStorage.setItem('cf_email', email);
        localStorage.setItem('cf_name', data.user.name || '');
        localStorage.setItem('cf_plan', data.user.plan || '');

        // Admin bypass — NEVER check subscription for admin emails
        if (ADMIN_EMAILS.includes(email)) {
          setChecked(true);
          return;
        }

        // Non-admin: check subscription
        if (data.user.subscriptionStatus !== 'active') {
          router.replace('/subscription-inactive');
          return;
        }

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
