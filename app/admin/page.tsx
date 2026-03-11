'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, ChevronDown, ChevronUp, Shield, ArrowLeft } from 'lucide-react';
import { isAdminEmail } from '@/lib/admin-emails';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string | null;
  subscription_status: string | null;
  client_count: number;
  created_at: string;
}

const PLAN_BADGE: Record<string, string> = {
  solo: 'bg-zinc-700 text-zinc-300',
  maker: 'bg-blue-900/40 text-blue-400 border border-blue-800/50',
  studio: 'bg-purple-900/40 text-purple-400 border border-purple-800/50',
  agency: 'bg-amber-900/40 text-amber-400 border border-amber-800/50',
};

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50',
  canceled: 'bg-red-900/40 text-red-400 border border-red-800/50',
  inactive: 'bg-yellow-900/40 text-yellow-400 border border-yellow-800/50',
  pending_payment: 'bg-yellow-900/40 text-yellow-400 border border-yellow-800/50',
};

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', plan: 'solo' });
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('cf_token') || '' : '';
  const getHeaders = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

  useEffect(() => {
    const tk = getToken();
    if (!tk) { router.replace('/login'); return; }
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${tk}` } });
        if (!res.ok) { router.replace('/login'); return; }
        const data = await res.json();
        if (!data.user || !isAdminEmail(data.user.email)) { router.replace('/dashboard'); return; }
        setAuthorized(true);
        loadUsers();
      } catch { router.replace('/login'); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUsers = async (retry = true) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', { headers: getHeaders() });
      if (res.status === 403 && retry) {
        await new Promise(r => setTimeout(r, 500));
        return loadUsers(false);
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const createUser = async () => {
    if (!form.name || !form.email || !form.password) return;
    setCreating(true); setMsg('');
    try {
      const res = await fetch('/api/admin/users', { method: 'POST', headers: getHeaders(), body: JSON.stringify(form) });
      if (res.ok) { setMsg('Usuário criado!'); setForm({ name: '', email: '', password: '', plan: 'solo' }); loadUsers(); }
      else { const d = await res.json(); setMsg(d.error || 'Erro'); }
    } catch { setMsg('Erro de conexão'); }
    setCreating(false);
  };

  const updatePlan = async (userId: string, plan: string) => {
    await fetch(`/api/admin/users/${userId}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ plan }) });
    loadUsers();
  };

  const deactivate = async (userId: string) => {
    if (!confirm('Desativar este usuário?')) return;
    await fetch(`/api/admin/users/${userId}`, { method: 'DELETE', headers: getHeaders() });
    loadUsers();
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.subscription_status === 'active').length,
    canceled: users.filter(u => u.subscription_status === 'canceled').length,
    clients: users.reduce((sum, u) => sum + Number(u.client_count || 0), 0),
  };

  const INPUT = 'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-zinc-500';

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Verificando acesso...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <Shield className="w-6 h-6 text-violet-500" />
            <h1 className="text-2xl font-black text-white">Admin Panel</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Usuários', value: stats.total, color: 'text-white' },
            { label: 'Ativos', value: stats.active, color: 'text-emerald-400' },
            { label: 'Cancelados', value: stats.canceled, color: 'text-red-400' },
            { label: 'Total Clientes', value: stats.clients, color: 'text-violet-400' },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">{s.label}</p>
              <p className={`text-3xl font-black tabular-nums ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Create User */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl mb-8 overflow-hidden">
          <button onClick={() => setShowCreate(v => !v)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-bold text-white">Criar Novo Usuário</span>
            </div>
            {showCreate ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
          </button>
          {showCreate && (
            <div className="px-6 pb-6 pt-2 border-t border-zinc-800 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className={INPUT} placeholder="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <input className={INPUT} placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                <input className={INPUT} placeholder="Senha (min 8 chars)" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <select className={INPUT} value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}>
                  <option value="solo">Solo</option>
                  <option value="maker">Maker</option>
                  <option value="studio">Studio</option>
                  <option value="agency">Agency</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={createUser} disabled={creating} className="px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors">
                  {creating ? 'Criando...' : 'Criar Conta'}
                </button>
                {msg && <span className="text-sm font-bold text-zinc-400">{msg}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-500" />
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">Usuários ({users.length})</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-zinc-500 text-sm">Carregando...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm">Nenhum usuário encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left">
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Nome</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Email</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Plano</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Clientes</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Criado em</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{u.name}</td>
                      <td className="px-6 py-4 text-zinc-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={u.plan || 'solo'}
                          onChange={e => updatePlan(u.id, e.target.value)}
                          className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase cursor-pointer ${PLAN_BADGE[u.plan || 'solo'] || PLAN_BADGE.solo}`}
                        >
                          <option value="solo">Solo</option>
                          <option value="maker">Maker</option>
                          <option value="studio">Studio</option>
                          <option value="agency">Agency</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${STATUS_BADGE[u.subscription_status || 'inactive'] || STATUS_BADGE.inactive}`}>
                          {u.subscription_status || 'inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 tabular-nums">{u.client_count}</td>
                      <td className="px-6 py-4 text-zinc-500 text-xs">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {u.subscription_status !== 'canceled' && (
                          <button
                            onClick={() => deactivate(u.id)}
                            className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-red-900/30 text-red-400 border border-red-800/40 hover:bg-red-900/50 transition-colors"
                          >
                            Desativar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
