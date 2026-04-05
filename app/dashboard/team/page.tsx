'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, UserPlus, MessageCircle, Copy, Check, X, Link } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAgency } from '@/components/AgencyContext';

const COLOR_SETS = [
  { bgCls: 'bg-violet-900/40 border-violet-800/40', textCls: 'text-violet-300' },
  { bgCls: 'bg-emerald-900/40 border-emerald-800/40', textCls: 'text-emerald-300' },
  { bgCls: 'bg-blue-900/40 border-blue-800/40', textCls: 'text-blue-300' },
  { bgCls: 'bg-amber-900/40 border-amber-800/40', textCls: 'text-amber-300' },
];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

export default function TeamPage() {
  const router = useRouter();
  const { teamMembers: localTeamMembers } = useAgency();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'member' | 'admin'>('member');

  useEffect(() => {
    setIsOwner(localStorage.getItem('cf_role') === 'owner');
    // Fetch team members from server instead of localStorage
    const fetchTeamMembers = async () => {
      try {
        const token = localStorage.getItem('cf_token');
        const res = await fetch('/api/team/members', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTeamMembers(data.members || []);
        }
      } catch (err) {
        console.error('Failed to fetch team members:', err);
        // Fallback to localStorage
        setTeamMembers(localTeamMembers);
      }
    };
    fetchTeamMembers();
  }, [localTeamMembers]);

  async function handleInvite() {
    setLoading(true);
    try {
      const token = localStorage.getItem('cf_token');
      const roleQuery = selectedRole === 'admin' ? '?role=admin' : '';
      const res = await fetch(`/api/team/invite${roleQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Falha ao gerar convite');
      const data = await res.json();
      setInviteUrl(data.inviteUrl);
      setShowInviteModal(true);
    } catch (err) {
      console.error('Invite error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#050505] text-white">
        {/* Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-600/8 blur-[140px] rounded-full" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">

          {/* Back */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-white mb-10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar ao Dashboard</span>
          </button>

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white leading-tight">Equipe</h1>
                <p className="text-sm text-gray-500">{teamMembers.length} membros ativos</p>
              </div>
            </div>
            {isOwner && (
            <button
              onClick={() => setShowRoleDialog(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Gerando...' : 'Convidar Membro'}
            </button>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teamMembers.map((member, idx) => {
              const colors = COLOR_SETS[idx % COLOR_SETS.length];
              const initials = getInitials(member.name);
              const whatsapp = (member as { whatsapp?: string }).whatsapp ?? '';

              return (
                <div
                  key={member.id}
                  className="group bg-white/[0.03] border border-white/8 hover:border-white/15 rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300"
                >
                  {/* Top row: avatar + status badge */}
                  <div className="flex items-start justify-between">
                    {member.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-white/10 flex-shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-2xl border flex items-center justify-center flex-shrink-0 ${colors.bgCls}`}
                      >
                        <span className={`text-lg font-bold ${colors.textCls}`}>
                          {initials}
                        </span>
                      </div>
                    )}
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-900/20 border border-emerald-900/40 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Ativo
                    </span>
                  </div>

                  {/* Name + role */}
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{member.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {member.isOwner ? 'Proprietário' : (member as { teamRole?: string }).teamRole === 'admin' ? 'Admin' : 'Membro'}
                    </p>
                  </div>

                  {/* WhatsApp CTA */}
                  <a
                    href={whatsapp ? `https://wa.me/${whatsapp}` : '#'}
                    target={whatsapp ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-[#25D366]/10 hover:border-[#25D366]/30 text-gray-400 hover:text-[#25D366] text-xs font-bold transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Chamar no WhatsApp
                  </a>
                </div>
              );
            })}
          </div>

        </div>

        {/* Role Selection Dialog */}
        {showRoleDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-4">Qual será o role do novo membro?</h2>

              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-3 p-3 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
                       onClick={() => setSelectedRole('member')}>
                  <input type="radio" name="role" value="member" checked={selectedRole === 'member'} readOnly className="w-4 h-4" />
                  <div>
                    <p className="text-sm font-bold text-white">Membro</p>
                    <p className="text-xs text-gray-400">Acesso a clientes, projetos e ferramentas básicas</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
                       onClick={() => setSelectedRole('admin')}>
                  <input type="radio" name="role" value="admin" checked={selectedRole === 'admin'} readOnly className="w-4 h-4" />
                  <div>
                    <p className="text-sm font-bold text-white">Administrador</p>
                    <p className="text-xs text-gray-400">Acesso completo + Business Intelligence</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRoleDialog(false)}
                  className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowRoleDialog(false);
                    handleInvite();
                  }}
                  className="flex-1 px-4 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors"
                >
                  Gerar Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
              {/* Modal header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Link className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">Link de Convite</h2>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                Compartilhe este link para convidar um membro à sua equipe.
              </p>

              {/* URL + copy */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 truncate">
                  {inviteUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold transition-colors bg-white text-black hover:bg-gray-100"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
