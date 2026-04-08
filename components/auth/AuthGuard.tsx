'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAdminEmail } from '@/lib/admin-emails';

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/subscription-inactive'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 10-second safety timeout — prevents infinite loading screen
  useEffect(() => {
    if (checked) return;

    timeoutRef.current = setTimeout(() => {
      if (!checked) {
        localStorage.removeItem('cf_token');
        localStorage.removeItem('cf_email');
        localStorage.removeItem('cf_name');
        localStorage.removeItem('cf_plan');
        router.replace('/login?error=timeout');
      }
    }, 10000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [checked, router]);

  useEffect(() => {
    // /invite/* routes are public — new members don't have a token yet
    const isPublic = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/#') || pathname.startsWith('/invite/');

    if (isPublic) {
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
        // Rate limited or server error — fall back to localStorage
        if (res.status === 429 || res.status >= 500) {
          const cachedEmail = localStorage.getItem('cf_email');
          if (cachedEmail) {
            setChecked(true);
          } else {
            router.replace('/login');
          }
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
        // Role from server (owner/member) — admin emails always get 'owner'
        const serverRole = isAdminEmail(email) ? 'owner' : (data.user.role || 'owner');
        localStorage.setItem('cf_role', serverRole);

        // Admin bypass — NEVER check subscription for admin emails
        if (isAdminEmail(email)) {
          setChecked(true);
          return;
        }

        // Non-admin: check subscription — allow 'active' or 'trial'
        if (data.user.subscriptionStatus !== 'active' && data.user.subscriptionStatus !== 'trial') {
          if (data.user.subscriptionStatus === 'pending_payment') {
            router.replace('/signup?pending=true');
          } else {
            router.replace('/subscription-inactive');
          }
          return;
        }

        setChecked(true);
      })
      .catch(() => {
        // Network error — fall back to localStorage if available, else login
        const cachedEmail = localStorage.getItem('cf_email');
        if (cachedEmail) {
          setChecked(true);
        } else {
          router.replace('/login');
        }
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
