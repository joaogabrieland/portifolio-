'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Briefcase, Mail, Phone, Camera, Check, Save } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAgency } from '@/components/AgencyContext';

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateCurrentUser } = useAgency();

  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [form, setForm] = useState({
    name: '',
    role: '',
    email: '',
    whatsapp: '',
  });

  useEffect(() => {
    setForm({
      name: localStorage.getItem('cf_name') || '',
      role: localStorage.getItem('cf_role') || '',
      email: localStorage.getItem('cf_email') || '',
      whatsapp: localStorage.getItem('cf_whatsapp') || '',
    });
    setAvatarUrl(localStorage.getItem('cf_avatar') || '');
  }, []);

  const initials = form.name
    ? form.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'CF';

  // ── File upload handler ───────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setAvatarUrl(base64);
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be re-selected if needed
    e.target.value = '';
  };

  const handleSave = () => {
    // TODO: Backend Dev - Conectar upload real aqui.
    // Quando o avatarUrl for um Base64, enviar para o storage (Supabase Storage / Firebase Storage):
    //   const { data } = await supabase.storage.from('avatars').upload(`${userId}.jpg`, decode(base64));
    //   const publicUrl = supabase.storage.from('avatars').getPublicUrl(data.path).data.publicUrl;
    //   await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', userId);
    // Então substituir avatarUrl pelo publicUrl antes de gravar no localStorage.
    localStorage.setItem('cf_name', form.name);
    localStorage.setItem('cf_role', form.role);
    localStorage.setItem('cf_whatsapp', form.whatsapp);
    if (avatarUrl) localStorage.setItem('cf_avatar', avatarUrl);

    // Propagate changes to global AgencyContext so the header and team list
    // update immediately without requiring a page reload.
    updateCurrentUser({ name: form.name, ...(avatarUrl ? { avatar: avatarUrl } : {}) });

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputCls =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all';
  const labelCls = 'text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block';

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#050505] text-white">
        {/* Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/10 blur-[120px] rounded-full" />

        <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">

          {/* Back */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-white mb-10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar ao Dashboard</span>
          </button>

          <div className="mb-10">
            <h1 className="text-2xl font-bold text-white mb-1">Minha Conta</h1>
            <p className="text-sm text-gray-500">Gerencie seu perfil e informações de contato.</p>
          </div>

          {/* Avatar block */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 mb-6">
            <label className={labelCls}>Foto do Perfil</label>
            <div className="flex items-center gap-5">

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />

              {/* Avatar + camera trigger */}
              <div className="relative flex-shrink-0">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-20 h-20 rounded-2xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-violet-900/40 border border-violet-800/40 flex items-center justify-center">
                    <span className="text-2xl font-bold text-violet-300">{initials}</span>
                  </div>
                )}
                {/* Camera button — clicks the hidden file input */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Carregar foto do dispositivo"
                  className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#111] border border-white/15 rounded-lg flex items-center justify-center hover:border-violet-500/50 hover:bg-violet-900/30 transition-all"
                >
                  <Camera className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>

              {/* URL / preview field */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                  Clique na câmera para carregar uma foto do seu dispositivo, ou cole uma URL abaixo.
                </p>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://exemplo.com/foto.jpg"
                  className={inputCls}
                />
                {avatarUrl.startsWith('data:') && (
                  <p className="text-[10px] text-emerald-500 mt-1.5 font-bold">
                    ✓ Foto carregada do dispositivo — salve para confirmar.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form block */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">

            <div>
              <label className={labelCls}>Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Ricardo Alves"
                  className={`${inputCls} pl-11`}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Cargo / Especialidade</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  placeholder="Ex: Diretor de Fotografia, Editor Sênior"
                  className={`${inputCls} pl-11`}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className={`${inputCls} pl-11 opacity-40 cursor-not-allowed`}
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-1.5">
                O email é gerenciado pelo sistema de autenticação e não pode ser alterado aqui.
              </p>
            </div>

            <div>
              <label className={labelCls}>WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
                  placeholder="55 11 99999-0000"
                  className={`${inputCls} pl-11`}
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-1.5">
                Formato: DDI + DDD + Número, apenas dígitos. Ex: 5511999990000
              </p>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className={`mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
              saved
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Alterações Salvas!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Alterações
              </>
            )}
          </button>

        </div>
      </div>
    </AuthGuard>
  );
}
