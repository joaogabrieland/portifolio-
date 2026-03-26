'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AGENTS } from '@/lib/constants';
import { AgentId, ChatSession, InstagramProfile, ShotList, BrandKit, HDD, Recording, StudioProfile, Client } from '@/types';
import { useIara } from '@/components/IaraContext';
import { useAgency } from '@/components/AgencyContext';
import { fetchClients, createClient, deleteClientAPI, migrateFromLocalStorage, fetchUserData, saveUserData } from '@/lib/clients-api';
import AgentView from '@/components/AgentView';
import ShotListManager from '@/components/ShotListManager';
import HubArquivos from '@/components/HubArquivos';
import ClientsHub from '@/components/ClientsHub';
import CreatorStockView from '@/components/CreatorStockView';
import ExecutiveAssistantView from '@/components/ExecutiveAssistantView';
import TutorialModal, { TutorialButton } from '@/components/TutorialModal';
import { isAdminEmail } from '@/lib/admin-emails';
import StudioProfileModal from '@/components/StudioProfileModal';
import AuthGuard from '@/components/auth/AuthGuard';
import { LayoutGrid, Sparkles, ChevronRight, Share2, Sun, Moon, ArrowLeft, Zap, BookOpen, Lock, Bug, MessageSquare, Send, X, Gift, Copy, Check, Twitter, MessageCircle, LogOut, Archive, AlertTriangle, Clapperboard, Users, BarChart3, BarChart2, PenTool, Briefcase, Library, FolderOpen, DollarSign, Image, Youtube, Instagram, Search, Calculator, User, Trash2, Shield, FilePen } from 'lucide-react';

const STORAGE_KEY = 'creator_flow_history_v2';
const PROFILES_KEY = 'creator_flow_ig_profiles';
const SHOT_LISTS_KEY = 'creator_flow_shot_lists';
const BRAND_KITS_KEY = 'creator_flow_brand_kits';
const THEME_KEY = 'creator_flow_theme';
const HDDS_KEY = 'creator_flow_hdds';
const RECORDINGS_KEY = 'creator_flow_recordings';
const STUDIO_KEY = 'creator_flow_studio_profile';
const CLIENTS_KEY = 'creator_flow_clients';

const INITIAL_STUDIO: StudioProfile = {
  name: '',
  type: '',
  equipment: { cameras: [], lenses: [], audio: [], lighting: [], others: [] },
};

// --- SUPPORT MODAL COMPONENT ---
const SupportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [type, setType] = useState<'bug' | 'suggestion'>('bug');
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSend = () => {
        if (!message.trim()) return;

        const subject = `[CreatorFlow Feedback] - ${type === 'bug' ? 'Relato de Bug 🐛' : 'Sugestão de Melhoria 💡'}`;
        const body = `Olá equipe CreatorFlow,%0D%0A%0D%0AEstou enviando o seguinte feedback:%0D%0A%0D%0ATipo: ${type === 'bug' ? 'Bug/Erro' : 'Sugestão'}%0D%0ADescrição:%0D%0A${encodeURIComponent(message)}%0D%0A%0D%0AAtenciosamente,%0D%0AUm Criador de Conteúdo.`;
        
        window.open(`mailto:suporte@creatorflow.com?subject=${subject}&body=${body}`, '_blank');
        onClose();
        setMessage('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 w-full max-w-lg p-6 rounded-3xl shadow-2xl border border-zinc-800 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-500" />
                        Ajude-nos a melhorar
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 block">O que você deseja fazer?</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setType('bug')}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold text-sm transition-all ${type === 'bug' ? 'border-red-500 bg-red-900/20 text-red-400' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
                            >
                                <Bug className="w-4 h-4" /> Relatar Bug
                            </button>
                            <button
                                onClick={() => setType('suggestion')}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold text-sm transition-all ${type === 'suggestion' ? 'border-emerald-500 bg-emerald-900/20 text-emerald-400' : 'border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
                            >
                                <Sparkles className="w-4 h-4" /> Dar Sugestão
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">
                            {type === 'bug' ? 'Descreva o problema' : 'Descreva sua ideia'}
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={type === 'bug' ? "Ex: O botão de salvar não funcionou quando eu..." : "Ex: Seria incrível se tivesse um agente para..."}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 h-32 resize-none text-sm"
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-white text-zinc-900 rounded-xl font-bold shadow-lg hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                        <Send className="w-4 h-4" /> Enviar Feedback
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- REFERRAL MODAL COMPONENT ---
const ReferralModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);
    const referralLink = "creatorflow.ai/ref/user-x8z"; // Mock link

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = (platform: 'whatsapp' | 'twitter') => {
        const text = encodeURIComponent(`🚀 Estou usando o CreatorFlow AI para criar meus conteúdos. Cadastre-se com meu link e ganhe 1 mês grátis: https://${referralLink}`);
        if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${text}`, '_blank');
        } else {
            window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 w-full max-w-md p-8 rounded-3xl shadow-2xl border border-zinc-800 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                {/* Decorative background blur */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex justify-end absolute top-4 right-4">
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="text-center mb-8 relative z-10">
                    <div className="w-16 h-16 bg-amber-900/30 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm border border-amber-800">
                        🤝
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                        Convide amigos,<br/>ganhe acesso Pro 🚀
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Para cada amigo que se cadastrar com seu link, vocês dois ganham <strong className="text-amber-400">1 mês de acesso premium extra.</strong>
                    </p>
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 text-sm font-mono text-zinc-400 truncate bg-transparent outline-none select-all">
                            {referralLink}
                        </div>
                        <button
                            onClick={handleCopy}
                            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${copied ? 'bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg' : 'bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700'}`}
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleShare('whatsapp')} className="flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:brightness-95 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/20">
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                        </button>
                        <button onClick={() => handleShare('twitter')} className="flex items-center justify-center gap-2 py-3 px-4 bg-white text-black rounded-xl font-bold text-sm transition-all shadow-lg">
                            <Twitter className="w-4 h-4" />
                            Postar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function DashboardPage() {
  const router = useRouter();
  const { open: openIara, setClients: setIaraClients } = useIara();
  const [activeAgentId, setActiveAgentId] = useState<AgentId | null>(null);
  const [isLightingHubOpen, setIsLightingHubOpen] = useState(false);
  const [isProductionHubOpen, setIsProductionHubOpen] = useState(false);
  const [isEditingHubOpen, setIsEditingHubOpen] = useState(false);
  const [isArquivosHubOpen, setIsArquivosHubOpen] = useState(false);
  const [isClientesHubOpen, setIsClientesHubOpen] = useState(false);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
  const [studioProfile, setStudioProfile] = useState<StudioProfile>(INITIAL_STUDIO);
  const [isAssistenteExecutivoOpen, setIsAssistenteExecutivoOpen] = useState(false);
  const [isCreatorStockOpen, setIsCreatorStockOpen] = useState(false);

  // Feedback Modal State
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Referral Modal State
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  // Tutorial Modal State
  const [isDashboardTutorialOpen, setIsDashboardTutorialOpen] = useState(false);
  const [isCriacaoTutorialOpen,   setIsCriacaoTutorialOpen]   = useState(false);

  // Payment success toast
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  // Share link copied toast
  const [showLinkCopied, setShowLinkCopied] = useState(false);

  // Portal token for share button (client portal link)
  const [dashboardPortalToken, setDashboardPortalToken] = useState('');

  // Client deleted toast
  const [deletedClientName, setDeletedClientName] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('success') === 'true') {
      setShowPaymentSuccess(true);
      window.history.replaceState({}, '', '/dashboard');
      setTimeout(() => setShowPaymentSuccess(false), 6000);
    }

    // Open agent from URL param (e.g. /dashboard?agent=storyboard_generator)
    const agentParam = params.get('agent');
    if (agentParam && Object.values(AgentId).includes(agentParam as AgentId)) {
      setActiveAgentId(agentParam as AgentId);

      // Auto-send pending script from localStorage (e.g. "Transformar em Storyboard" flow)
      if (params.get('autoSend') === '1') {
        const pendingScript = localStorage.getItem('pendingStoryboardScript');
        if (pendingScript) {
          setNavigationContext({ prompt: `Aqui está meu roteiro para transformar em Storyboard cinematográfico 9:16:\n\n${pendingScript}` });
          localStorage.removeItem('pendingStoryboardScript');
        }
      }

      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  // Navigation context for cross-agent workflows
  const [navigationContext, setNavigationContext] = useState<{ prompt: string } | null>(null);
  
  const [sessions, setSessions] = useState<Record<string, ChatSession[]>>({});
  const [instagramProfiles, setInstagramProfiles] = useState<InstagramProfile[]>([]);
  const [shotLists, setShotLists] = useState<ShotList[]>([]);
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [hdds, setHdds] = useState<HDD[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [agentQuery, setAgentQuery] = useState('');
  const [usageData, setUsageData] = useState<{ plan: string; features: Record<string, { used: number; limit: number; remaining: number; percentage: number }> } | null>(null);
  const [userPlan, setUserPlan] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // RBAC — sourced from AgencyContext (global, persisted).
  // Default: admin (true) — so the owner never loses access before hydration.
  const { currentUser, signOut: agencySignOut } = useAgency();
  const isAdmin = currentUser ? currentUser.role !== 'user' : true;

  const dashboardInitRef = useRef(false);
  useEffect(() => {
    if (dashboardInitRef.current) return;
    dashboardInitRef.current = true;
    const plan = localStorage.getItem('cf_plan') || '';
    setUserPlan(plan);
    setUserName(localStorage.getItem('cf_name') || '');
    setUserEmail(localStorage.getItem('cf_email') || '');
    const token = localStorage.getItem('cf_token');
    if (token) {
      fetch('/api/usage', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setUsageData(data); })
        .catch(() => { /* ignore */ });
      // User data (email, name, plan) is already fetched by AuthGuard via /api/auth/me
      // and stored in localStorage. No duplicate call needed here — just read from storage above.

      // Fetch portal token for the share button (client portal link)
      fetch('/api/team/invite', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.inviteUrl) {
            const t = data.inviteUrl.split('/invite/')[1];
            if (t) setDashboardPortalToken(t);
          }
        })
        .catch(() => { /* ignore */ });
    }
  }, []);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const dataLoadedRef = useRef(false);
  useEffect(() => {
    if (dataLoadedRef.current) return;
    dataLoadedRef.current = true;
    const savedSessions = localStorage.getItem(STORAGE_KEY);
    const savedProfiles = localStorage.getItem(PROFILES_KEY);
    const savedShotLists = localStorage.getItem(SHOT_LISTS_KEY);
    const savedBrandKits = localStorage.getItem(BRAND_KITS_KEY);
    const savedHdds = localStorage.getItem(HDDS_KEY);
    const savedRecordings = localStorage.getItem(RECORDINGS_KEY);

    if (savedSessions) {
      try { setSessions(JSON.parse(savedSessions)); } catch (e) { console.error(e); }
    }
    if (savedProfiles) {
      try { setInstagramProfiles(JSON.parse(savedProfiles)); } catch (e) { console.error(e); }
    }
    if (savedShotLists) {
      try { setShotLists(JSON.parse(savedShotLists)); } catch (e) { console.error(e); }
    }
    if (savedBrandKits) {
      try { setBrandKits(JSON.parse(savedBrandKits)); } catch (e) { console.error(e); }
    }
    if (savedHdds) {
      try {
        const parsed = JSON.parse(savedHdds);
        const now = Date.now();
        const RETENTION = 15 * 24 * 60 * 60 * 1000;
        setHdds(parsed.filter((h: { isArchived?: boolean; archivedAt?: string }) =>
          !h.isArchived || !h.archivedAt || now - new Date(h.archivedAt).getTime() <= RETENTION
        ));
      } catch (e) { console.error(e); }
    }
    if (savedRecordings) {
      try { setRecordings(JSON.parse(savedRecordings)); } catch (e) { console.error(e); }
    }

    // Prefer API data over localStorage — API is source of truth for cross-view sync
    if (localStorage.getItem('cf_token')) {
      fetchUserData<HDD[]>('hdds').then(apiHdds => {
        if (Array.isArray(apiHdds) && apiHdds.length > 0) setHdds(apiHdds);
      }).catch(() => { /* keep localStorage data */ });
      fetchUserData<Recording[]>('recordings').then(apiRec => {
        if (Array.isArray(apiRec) && apiRec.length > 0) setRecordings(apiRec);
      }).catch(() => { /* keep localStorage data */ });
    }
    const savedStudio = localStorage.getItem(STUDIO_KEY);
    if (savedStudio) {
      try {
        const parsed = JSON.parse(savedStudio);
        // Backward compat: ensure `others` field exists for existing profiles
        if (parsed.equipment && !parsed.equipment.others) {
          parsed.equipment.others = [];
        }
        setStudioProfile(parsed);
      } catch (e) { console.error(e); }
    }

    // Load clients from API (DB) instead of localStorage
    const plan = localStorage.getItem('cf_plan') || '';
    if (plan && plan !== 'solo') {
      const localClients = localStorage.getItem(CLIENTS_KEY);

      // First, try to migrate localStorage data if not yet migrated
      if (!localStorage.getItem('cf_clients_migrated') && localClients) {
        try {
          const parsed: Client[] = JSON.parse(localClients);
          if (parsed.length > 0) {
            const DATA_TYPES = ['kanban', 'agenda', 'roteiros', 'entregas', 'meetings', 'invoices', 'metrics', 'saved_ideas'] as const;
            const migrationPayload = parsed.map(c => {
              const subData: Record<string, unknown> = {};
              for (const dt of DATA_TYPES) {
                const key = dt === 'saved_ideas' ? `creator_flow_saved_ideas_${c.id}` : `creator_flow_${dt}_${c.id}`;
                const raw = localStorage.getItem(key);
                if (raw) {
                  try { subData[dt] = JSON.parse(raw); } catch { /* skip */ }
                }
              }
              return { ...c, subData };
            });
            migrateFromLocalStorage(migrationPayload)
              .then(() => localStorage.setItem('cf_clients_migrated', 'true'))
              .catch(err => console.error('Migration error:', err));
          } else {
            localStorage.setItem('cf_clients_migrated', 'true');
          }
        } catch { /* skip migration */ }
      }

      // Load from API
      fetchClients()
        .then(apiClients => setClients(apiClients))
        .catch(err => {
          console.error('Failed to load clients from API:', err);
          // Fallback to localStorage
          const local = localStorage.getItem(CLIENTS_KEY);
          if (local) {
            try { setClients(JSON.parse(local)); } catch { /* ignore */ }
          }
        });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(instagramProfiles));
  }, [instagramProfiles]);

  useEffect(() => {
    localStorage.setItem(SHOT_LISTS_KEY, JSON.stringify(shotLists));
  }, [shotLists]);

  useEffect(() => {
    localStorage.setItem(BRAND_KITS_KEY, JSON.stringify(brandKits));
  }, [brandKits]);

  useEffect(() => {
    localStorage.setItem(HDDS_KEY, JSON.stringify(hdds));
  }, [hdds]);

  useEffect(() => {
    localStorage.setItem(RECORDINGS_KEY, JSON.stringify(recordings));
  }, [recordings]);

  useEffect(() => {
    localStorage.setItem(STUDIO_KEY, JSON.stringify(studioProfile));
  }, [studioProfile]);

  // Sync clients to IaraContext so IaraDrawer can list them in multi-step flow
  // setIaraClients is a stable useState setter — intentionally omitted from deps
  useEffect(() => {
    setIaraClients(clients);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients]);

  // Clients are persisted via API — no localStorage sync needed

  const handleSaveSession = (agentId: string, updatedSession: ChatSession) => {
    setSessions(prev => {
        const agentSessions = prev[agentId] || [];
        const existingIndex = agentSessions.findIndex(s => s.id === updatedSession.id);
        let newAgentSessions;
        if (existingIndex >= 0) {
            newAgentSessions = [...agentSessions];
            newAgentSessions[existingIndex] = updatedSession;
        } else {
            newAgentSessions = [updatedSession, ...agentSessions];
        }
        return { ...prev, [agentId]: newAgentSessions };
    });
  };

  const handleDeleteSession = (agentId: string, sessionId: string) => {
      setSessions(prev => ({
          ...prev,
          [agentId]: (prev[agentId] || []).filter(s => s.id !== sessionId)
      }));
  };

  const handleSaveIGProfile = (profile: InstagramProfile) => {
      setInstagramProfiles(prev => [profile, ...prev]);
  };

  const handleDeleteIGProfile = (profileId: string) => {
      setInstagramProfiles(prev => prev.filter(p => p.id !== profileId));
      // Cleanup sessions associated with this profile
      setSessions(prev => {
          const igSessions = prev[AgentId.INSTAGRAM_CAPTIONS] || [];
          return {
              ...prev,
              [AgentId.INSTAGRAM_CAPTIONS]: igSessions.filter(s => s.profileId !== profileId)
          };
      });
  };

  const handleSaveShotList = (list: ShotList) => {
    setShotLists(prev => {
        const index = prev.findIndex(l => l.id === list.id);
        if (index >= 0) {
            const newList = [...prev];
            newList[index] = list;
            return newList;
        }
        return [list, ...prev];
    });
  };

  const handleDeleteShotList = (id: string) => {
      setShotLists(prev => prev.filter(l => l.id !== id));
  };

  // Brand Kit Handlers
  const handleSaveBrandKit = (kit: BrandKit) => {
    setBrandKits(prev => {
        const index = prev.findIndex(k => k.id === kit.id);
        if (index >= 0) {
            const newList = [...prev];
            newList[index] = kit;
            return newList;
        }
        return [kit, ...prev];
    });
  };

  const handleDeleteBrandKit = (id: string) => {
      setBrandKits(prev => prev.filter(k => k.id !== id));
  };

  const handleSaveHDD = (hdd: HDD) => {
    setHdds(prev => {
      const updated = [hdd, ...prev];
      saveUserData('hdds', updated).catch(e => console.error('[HubArquivos] saveUserData hdds:', e));
      return updated;
    });
  };

  const handleDeleteHDD = (id: string) => {
    setHdds(prev => {
      const updated = prev.map(h => h.id === id ? { ...h, isArchived: true, archivedAt: new Date().toISOString() } : h);
      saveUserData('hdds', updated).catch(e => console.error('[HubArquivos] saveUserData hdds:', e));
      return updated;
    });
  };

  const handleRestoreHDD = (id: string) => {
    setHdds(prev => {
      const updated = prev.map(h => h.id === id ? { ...h, isArchived: false, archivedAt: undefined } : h);
      saveUserData('hdds', updated).catch(e => console.error('[HubArquivos] saveUserData hdds:', e));
      return updated;
    });
  };

  const handleSaveRecording = (recording: Recording) => {
    setRecordings(prev => {
      const exists = prev.some(r => r.id === recording.id);
      const updated = exists ? prev.map(r => r.id === recording.id ? recording : r) : [recording, ...prev];
      saveUserData('recordings', updated).catch(e => console.error('[HubArquivos] saveUserData recordings:', e));
      return updated;
    });
  };

  const handleDeleteRecording = (id: string) => {
    setRecordings(prev => {
      const updated = prev.filter(r => r.id !== id);
      saveUserData('recordings', updated).catch(e => console.error('[HubArquivos] saveUserData recordings:', e));
      return updated;
    });
  };

  // Reload clients from API (source of truth)
  const isFetchingClientsRef = useRef(false);
  const reloadClients = useCallback(async () => {
    if (isFetchingClientsRef.current) return; // prevent concurrent calls
    isFetchingClientsRef.current = true;
    try {
      const apiClients = await fetchClients();
      setClients(apiClients);
    } catch (err) {
      console.error('Failed to reload clients:', err);
    } finally {
      isFetchingClientsRef.current = false;
    }
  }, []);

  // Poll clients every 30s to keep multi-user sessions in sync
  useEffect(() => {
    const plan = localStorage.getItem('cf_plan') || '';
    if (!plan || plan === 'solo') return;

    const interval = setInterval(reloadClients, 30000);
    return () => clearInterval(interval);
  }, [reloadClients]);

  const handleSaveClient = async (client: Client) => {
    // Optimistic update
    setClients(prev => [client, ...prev]);
    try {
      await createClient({
        brandName: client.brandName,
        niche: client.niche,
        subniche: client.subniche,
        idealClient: client.idealClient,
        mainPains: client.mainPains,
        mainDesires: client.mainDesires,
        voiceTone: client.voiceTone,
        visualStyle: client.visualStyle,
        defaultCta: client.defaultCta,
      });
      // Reload from server to get the canonical state (solves multi-user conflicts)
      await reloadClients();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Falha ao salvar cliente:', msg);
      alert(`Não foi possível salvar o cliente.\n\n${msg}\n\nVerifique os logs do servidor.`);
      // Revert optimistic update
      setClients(prev => prev.filter(c => c.id !== client.id));
    }
  };

  const handleDeleteClient = async (id: string) => {
    const backup = clients;
    const name = clients.find(c => c.id === id)?.brandName ?? 'Cliente';
    // Optimistic update
    setClients(prev => prev.filter(c => c.id !== id));
    try {
      await deleteClientAPI(id);
      // Reload from server to stay in sync
      await reloadClients();
      setDeletedClientName(name);
      setTimeout(() => setDeletedClientName(null), 4000);
    } catch (err) {
      console.error('Failed to delete client:', err);
      // Revert on failure
      setClients(backup);
    }
  };

  // Dá baixa em uma pendência: mantém a gravação, apenas limpa os campos de alerta.
  // O card some do Dashboard automaticamente pois pendingRecordings filtra hasPendingTakes === true.
  const handleResolveAlert = (id: string) => {
    setRecordings(prev =>
      prev.map(r =>
        r.id === id ? { ...r, hasPendingTakes: false, pendingTakesDescription: undefined } : r
      )
    );
  };

  const handleShare = async () => {
    try {
      const link = dashboardPortalToken
        ? `${window.location.origin}/cliente/${dashboardPortalToken}`
        : window.location.href;
      await navigator.clipboard.writeText(link);
      setShowLinkCopied(true);
      setTimeout(() => setShowLinkCopied(false), 2500);
    } catch {
      // fallback silencioso
    }
  };

  const handleAgentClick = (id: AgentId) => {
      if (id === AgentId.LIGHTING_ASSISTANT) setIsLightingHubOpen(true);
      else if (id === AgentId.EXECUTIVE_PRODUCER) setIsProductionHubOpen(true);
      else if (id === AgentId.EDITING_WORKFLOW) setIsEditingHubOpen(true);
      else if (id === AgentId.SFX_ASSISTANT) setActiveAgentId(AgentId.SFX_LIBRARY);
      else setActiveAgentId(id);
  };

  const handleBack = () => {
      setNavigationContext(null);
      if (activeAgentId) {
          // Lighting sub-agents → Lighting Hub
          if ([AgentId.LIGHTING_GENERATOR, AgentId.LIGHTING_STYLES].includes(activeAgentId)) {
             setActiveAgentId(null);
             setIsLightingHubOpen(true);
             return;
          }
          // Editing sub-agents → Editing Hub
          if ([AgentId.EDITING_SHORTCUTS, AgentId.EDITING_IDEA, AgentId.EDITING_TECHNIQUES].includes(activeAgentId)) {
             setActiveAgentId(null);
             setIsEditingHubOpen(true);
             return;
          }
          // Central de Criação direct agents → Central de Criação
          if ([AgentId.SCRIPT_GENERATOR, AgentId.SHOT_LIST, AgentId.MEDIA_ASSISTANT, AgentId.STORYBOARD_GENERATOR].includes(activeAgentId)) {
             setActiveAgentId(null);
             setIsProductionHubOpen(true);
             return;
          }
          // Gerador de Proposta → back to CRM
          if (activeAgentId === AgentId.BUDGET_SHEET) {
             setActiveAgentId(null);
             setIsClientesHubOpen(true);
             return;
          }
          setActiveAgentId(null);
      } else if (isLightingHubOpen) {
          // Lighting Hub → back to Central de Criação
          setIsLightingHubOpen(false);
          setIsProductionHubOpen(true);
      } else if (isEditingHubOpen) {
          // Editing Hub → back to Central de Criação
          setIsEditingHubOpen(false);
          setIsProductionHubOpen(true);
      } else if (isProductionHubOpen) setIsProductionHubOpen(false);
      else if (isAssistenteExecutivoOpen) setIsAssistenteExecutivoOpen(false);
      else if (isCreatorStockOpen) setIsCreatorStockOpen(false);
      else if (isArquivosHubOpen) setIsArquivosHubOpen(false);
      else if (isClientesHubOpen) setIsClientesHubOpen(false);
  };

  const handleNavigateToAgent = (id: AgentId, prompt: string) => {
    setNavigationContext({ prompt });
    setIsProductionHubOpen(false);
    setIsEditingHubOpen(false);
    setIsLightingHubOpen(false);
    setIsAssistenteExecutivoOpen(false);
    setIsCreatorStockOpen(false);
    setActiveAgentId(id);
  };

  const activeAgent = activeAgentId ? AGENTS[activeAgentId] : null;
  const totalSessions = Object.values(sessions).reduce((acc, list) => acc + list.length, 0);

  const extraAgentIds = [
    AgentId.IMAGE_GENERATOR,
    AgentId.VIDEO_PROMPTS,
    AgentId.YOUTUBE_SEO,
    AgentId.INSTAGRAM_CAPTIONS,
  ];

  const quickActionIds = [
    AgentId.SCRIPT_GENERATOR,
    AgentId.SHOT_LIST,
    AgentId.INSTAGRAM_CAPTIONS,
  ];

  const normalizedQuery = agentQuery.trim().toLowerCase();
  const filterByQuery = (id: AgentId) => {
    if (!normalizedQuery) return true;
    const agent = AGENTS[id];
    return (
      agent.title.toLowerCase().includes(normalizedQuery) ||
      agent.description.toLowerCase().includes(normalizedQuery)
    );
  };
  const visibleExtraAgentIds = extraAgentIds.filter(filterByQuery);
  const stats = [
    { label: 'Conversas', value: totalSessions },
    { label: 'Perfis IG', value: instagramProfiles.length },
    { label: 'Shotlists', value: shotLists.length },
    { label: 'Brand Kits', value: brandKits.length },
  ];

  // Gravações com takes pendentes — alimenta a seção de Alertas de Produção
  const pendingRecordings = recordings.filter(r => r.hasPendingTakes === true);

  const fmtAlertDate = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  const handleSubAgentClick = (id: AgentId) => {
      const agent = AGENTS[id];
      if (agent.isLocked && !agent.externalUrl) {
          alert("Disponível no Premium.");
          return;
      }
      if (agent.externalUrl) {
          window.open(agent.externalUrl, '_blank');
          return;
      }
      if (isProductionHubOpen) setIsProductionHubOpen(false);
      if (isEditingHubOpen) setIsEditingHubOpen(false);
      if (isLightingHubOpen) setIsLightingHubOpen(false);
      if (isAssistenteExecutivoOpen) setIsAssistenteExecutivoOpen(false);
      if (isCreatorStockOpen) setIsCreatorStockOpen(false);
      setActiveAgentId(id);
  }

  return (
    <AuthGuard>
    <div className="min-h-screen w-full bg-zinc-950 font-body selection:bg-indigo-500/30 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-48 right-0 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-48 h-[520px] w-[520px] rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[420px] w-[420px] rounded-full bg-amber-400/10 blur-3xl" />
      </div>
      {/* Payment success toast */}
      {showPaymentSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 backdrop-blur-lg px-6 py-4 shadow-2xl">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-white">Pagamento confirmado!</p>
              <p className="text-sm text-green-300">Bem-vindo ao CreatorFlow!</p>
            </div>
            <button onClick={() => setShowPaymentSuccess(false)} className="ml-4 text-white/40 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {/* Link copied toast */}
      {showLinkCopied && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 backdrop-blur-lg px-6 py-3 shadow-2xl">
            <Check className="h-4 w-4 text-violet-400" />
            <p className="text-sm font-medium text-white">Link copiado!</p>
          </div>
        </div>
      )}
      {/* Client deleted toast */}
      {deletedClientName && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-zinc-900/95 backdrop-blur-lg px-6 py-3 shadow-2xl">
            <Trash2 className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-sm font-medium text-white">
              <span className="font-black">{deletedClientName}</span> foi excluído permanentemente.
            </p>
          </div>
        </div>
      )}
      <SupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />
      <ReferralModal isOpen={isReferralModalOpen} onClose={() => setIsReferralModalOpen(false)} />
      {/* TODO: Inserir link do tutorial gravado */}
      <TutorialModal
        isOpen={isDashboardTutorialOpen}
        onClose={() => setIsDashboardTutorialOpen(false)}
        title="Tutorial — Dashboard CreatorFlow"
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      />
      <TutorialModal
        isOpen={isCriacaoTutorialOpen}
        onClose={() => setIsCriacaoTutorialOpen(false)}
        title="Tutorial — Central de Criação"
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      />
      <StudioProfileModal
        isOpen={isStudioModalOpen}
        profile={studioProfile}
        onSave={setStudioProfile}
        onClose={() => setIsStudioModalOpen(false)}
      />
      
      {activeAgentId === AgentId.SHOT_LIST ? (
        <ShotListManager 
            shotLists={shotLists}
            onSaveList={handleSaveShotList}
            onDeleteList={handleDeleteShotList}
            onBack={handleBack}
        />
      ) : activeAgent ? (
        <AgentView
          agent={activeAgent}
          onBack={handleBack}
          sessions={sessions[activeAgent.id] || []}
          onSaveSession={(session) => handleSaveSession(activeAgent.id, session)}
          onDeleteSession={(sessionId) => handleDeleteSession(activeAgent.id, sessionId)}
          instagramProfiles={instagramProfiles}
          onSaveIGProfile={handleSaveIGProfile}
          onDeleteIGProfile={handleDeleteIGProfile}
          onSaveShotList={handleSaveShotList} 
          brandKits={brandKits} // Passed prop
          onSaveBrandKit={handleSaveBrandKit} // Passed prop
          onDeleteBrandKit={handleDeleteBrandKit} // Passed prop
          navigationContext={navigationContext}
          onNavigateToAgent={handleNavigateToAgent}
          clients={clients}
          studioProfile={studioProfile}
        />
      ) : isProductionHubOpen ? (
          <main className="min-h-screen bg-zinc-950 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button onClick={handleBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-100 mb-8 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar ao Dashboard</span>
            </button>
            <div className="mb-12 flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Central de Criação</h1>
                  <p className="text-zinc-400">Ferramentas criativas para planejar e executar seus vídeos.</p>
                </div>
                <TutorialButton onClick={() => setIsCriacaoTutorialOpen(true)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[AgentId.SCRIPT_GENERATOR, AgentId.SHOT_LIST, AgentId.MEDIA_ASSISTANT, AgentId.STORYBOARD_GENERATOR].map(id => {
                    const agent = AGENTS[id];
                    const Icon = agent.icon;
                    return (
                        <button key={id} onClick={() => handleSubAgentClick(id)} className="flex flex-col p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500 transition-all duration-300 text-left group shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01]">
                            <div className={`p-4 rounded-xl bg-zinc-800 w-fit mb-4 ${agent.color}`}>
                                <Icon className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">{agent.title}</h2>
                            <p className="text-zinc-400 leading-relaxed mb-4 text-sm flex-1">{agent.description}</p>
                            <span className={`mt-auto font-medium flex items-center gap-2 text-sm ${agent.color.replace('text-', 'text-opacity-80 text-')}`}>
                                Acessar <ChevronRight className="w-4 h-4" />
                            </span>
                        </button>
                    )
                })}
                {/* Assistente de Iluminação — opens Lighting Hub */}
                <button
                    onClick={() => { setIsProductionHubOpen(false); setIsLightingHubOpen(true); }}
                    className="flex flex-col p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500 transition-all duration-300 text-left group shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01]"
                >
                    <div className="p-4 rounded-xl bg-zinc-800 w-fit mb-4 text-yellow-400">
                        <Zap className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Assistente de Iluminação</h2>
                    <p className="text-zinc-400 leading-relaxed mb-4 text-sm flex-1">Diagramas de luz personalizados e estilos cinematográficos clássicos para o seu set.</p>
                    <span className="mt-auto text-yellow-400 font-medium flex items-center gap-2 text-sm">
                        Acessar <ChevronRight className="w-4 h-4" />
                    </span>
                </button>
                {/* Workflow de Edição — opens Editing Hub */}
                <button
                    onClick={() => { setIsProductionHubOpen(false); setIsEditingHubOpen(true); }}
                    className="flex flex-col p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500 transition-all duration-300 text-left group shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01]"
                >
                    <div className="p-4 rounded-xl bg-zinc-800 w-fit mb-4 text-blue-400">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Workflow de Edição</h2>
                    <p className="text-zinc-400 leading-relaxed mb-4 text-sm flex-1">Atalhos de teclado, técnicas famosas e como recriar efeitos visuais cinematográficos.</p>
                    <span className="mt-auto text-blue-400 font-medium flex items-center gap-2 text-sm">
                        Acessar <ChevronRight className="w-4 h-4" />
                    </span>
                </button>
            </div>
          </main>
      ) : isEditingHubOpen ? (
         <main className="min-h-screen bg-zinc-950 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button onClick={handleBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-100 mb-8 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar à Central de Criação</span>
            </button>
            <div className="mb-12">
                <h1 className="text-3xl font-bold text-white mb-2">Workflow de Edição</h1>
                <p className="text-zinc-400">Otimize seu fluxo de pós-produção e desbloqueie sua criatividade.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[AgentId.EDITING_SHORTCUTS, AgentId.EDITING_IDEA, AgentId.EDITING_TECHNIQUES].map(id => {
                    const agent = AGENTS[id];
                    const Icon = agent.icon;
                    const isDisabled = id === AgentId.EDITING_TECHNIQUES;
                    return (
                        <button key={id} onClick={isDisabled ? undefined : () => handleSubAgentClick(id)} disabled={isDisabled} className={`relative flex flex-col p-6 bg-zinc-900 border border-zinc-800 rounded-2xl transition-all duration-300 text-left shadow-lg ${isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01]'}`}>
                            {isDisabled && (
                                <span className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full bg-zinc-600/40 text-zinc-400 border border-zinc-600/40 uppercase tracking-widest">Em Breve</span>
                            )}
                            <div className={`p-4 rounded-xl bg-zinc-800 w-fit mb-4 ${agent.color}`}>
                                <Icon className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">{agent.title}</h2>
                            <p className="text-zinc-400 leading-relaxed mb-4 text-sm flex-1">{agent.description}</p>
                            <span className={`mt-auto font-medium flex items-center gap-2 text-sm ${agent.color.replace('text-', 'text-opacity-80 text-')}`}>
                                Abrir Ferramenta <ChevronRight className="w-4 h-4" />
                            </span>
                        </button>
                    )
                })}
            </div>
         </main>
      ) : isClientesHubOpen ? (
        <ClientsHub
          clients={clients}
          onSaveClient={handleSaveClient}
          onDeleteClient={handleDeleteClient}
          onBack={handleBack}
          onNavigateToArquivos={() => { setIsClientesHubOpen(false); setIsArquivosHubOpen(true); }}
          onOpenBudgetSheet={() => { setIsClientesHubOpen(false); setActiveAgentId(AgentId.BUDGET_SHEET); }}
          onLinkCopied={() => { setShowLinkCopied(true); setTimeout(() => setShowLinkCopied(false), 2500); }}
          isAdmin={isAdmin}
        />
     ) : isArquivosHubOpen ? (
        <HubArquivos
          hdds={hdds}
          recordings={recordings}
          studioProfile={studioProfile}
          clients={clients}
          onSaveHDD={handleSaveHDD}
          onDeleteHDD={handleDeleteHDD}
          onRestoreHDD={handleRestoreHDD}
          onSaveRecording={handleSaveRecording}
          onDeleteRecording={handleDeleteRecording}
          onBack={handleBack}
        />
     ) : isAssistenteExecutivoOpen ? (
          <ExecutiveAssistantView onBack={() => setIsAssistenteExecutivoOpen(false)} />
     ) : isCreatorStockOpen ? (
          <CreatorStockView onBack={() => setIsCreatorStockOpen(false)} />
     ) : isLightingHubOpen ? (
          <main className="min-h-screen bg-zinc-950 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button onClick={handleBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-100 mb-8 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar à Central de Criação</span>
            </button>
            <div className="mb-12">
                <h1 className="text-3xl font-bold text-white mb-2">Assistente de Iluminação</h1>
                <p className="text-zinc-400">Escolha como você quer trabalhar a luz do seu vídeo hoje.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => { setIsLightingHubOpen(false); setActiveAgentId(AgentId.LIGHTING_GENERATOR); }} className="flex flex-col p-8 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-yellow-500 transition-all duration-300 text-left group shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01]">
                    <div className="p-4 rounded-xl bg-yellow-500/10 text-yellow-400 w-fit mb-6"><Zap className="w-10 h-10" /></div>
                    <h2 className="text-2xl font-bold text-white mb-3">Gerador de Iluminação</h2>
                    <p className="text-zinc-400 leading-relaxed mb-6">Envie uma foto do seu cenário e equipamentos. A IA analisará o ambiente e criará um diagrama de luz personalizado.</p>
                    <span className="mt-auto text-yellow-400 font-medium flex items-center gap-2">Criar Setup <ChevronRight className="w-4 h-4" /></span>
                </button>
                <div className="relative flex flex-col p-8 bg-zinc-900 border border-zinc-800 rounded-2xl text-left shadow-lg opacity-60 cursor-not-allowed pointer-events-none">
                    <span className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full bg-zinc-600/40 text-zinc-400 border border-zinc-600/40 uppercase tracking-widest">Em Breve</span>
                    <div className="p-4 rounded-xl bg-orange-500/10 text-orange-400 w-fit mb-6"><BookOpen className="w-10 h-10" /></div>
                    <h2 className="text-2xl font-bold text-white mb-3">Iluminações Famosas</h2>
                    <p className="text-zinc-400 leading-relaxed mb-6">Explore uma galeria interativa com estilos cinematográficos clássicos. Aprenda a recriar looks icônicos.</p>
                    <span className="mt-auto text-orange-400 font-medium flex items-center gap-2">Explorar Estilos <ChevronRight className="w-4 h-4" /></span>
                </div>
            </div>
          </main>
      ) : (
        <main className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden">
          {/* Inter Tight font */}
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');`}</style>

          {/* Purple radial glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

          {/* ── Header ── */}
          <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
            {/* Left: logo + avatar + name */}
            <div className="flex items-center gap-3">
              <a href="/dashboard" className="cursor-pointer transition-opacity hover:opacity-80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Creator Flow" className="h-8 md:h-10 w-auto object-contain drop-shadow-md" />
              </a>
              {currentUser?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.avatar}
                  alt="Avatar"
                  className="w-9 h-9 rounded-full object-cover border border-gray-600 flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-200 select-none">
                    {userName ? userName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() : 'CF'}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-gray-300 hidden sm:block">{userName || 'Criador'}</span>
            </div>
            {/* Right: actions */}
            <div className="flex items-center gap-2">
              {userEmail && isAdminEmail(userEmail) && (
                <button
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border-2 border-violet-500/60 bg-violet-600/20 text-violet-300 text-xs font-black uppercase tracking-wide hover:bg-violet-600/30 hover:border-violet-400/70 transition-all shadow-[0_0_12px_rgba(139,92,246,0.15)]"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              )}
              <button
                onClick={() => setIsStudioModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-800/50 bg-violet-900/20 text-violet-300 text-xs font-bold hover:bg-violet-900/30 transition-all"
              >
                <Clapperboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Meu Estúdio</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-gray-300 text-xs font-bold hover:bg-white/10 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compartilhar</span>
              </button>
              <button
                onClick={() => setIsReferralModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-900/50 bg-amber-900/10 text-amber-400 text-xs font-bold hover:bg-amber-900/20 transition-all"
              >
                <Gift className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Indique e Ganhe</span>
              </button>
              <TutorialButton onClick={() => setIsDashboardTutorialOpen(true)} />
              <button
                onClick={() => { agencySignOut(); router.push('/login'); }}
                className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-900/10 transition-all"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* ── Main content ── */}
          <div className="relative z-10 flex flex-col items-center max-w-6xl mx-auto px-6 pt-16 pb-24 w-full">

            {/* Hero */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="CreatorFlow" className="h-16 mb-8 object-contain" />
            <h1
              className="text-2xl md:text-3xl font-medium text-gray-100 mb-8 text-center max-w-xl"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              Seu painel criativo para planejar, produzir e publicar.
            </h1>

            <div className="flex flex-row gap-3 mb-16">
              {userPlan === 'solo' ? (
                <div className="relative">
                  <div className="bg-white/30 text-black/40 px-6 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed select-none">
                    Hub de clientes
                  </div>
                  <div className="absolute -top-2 -right-2 flex items-center gap-1 rounded-full bg-gray-800 border border-gray-700 px-2 py-0.5 shadow">
                    <Lock className="w-2.5 h-2.5 text-gray-300" />
                    <span className="text-[9px] font-bold text-gray-300">Maker+</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsClientesHubOpen(true)}
                  className="bg-white text-black hover:bg-gray-200 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Hub de clientes
                </button>
              )}
              <button
                onClick={() => setIsProductionHubOpen(true)}
                className="bg-transparent border border-white/20 hover:bg-white/5 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Abrir central de criação
              </button>
            </div>

            {/* IARA — Destaque */}
            <button
              onClick={openIara}
              className="w-full group relative bg-gradient-to-r from-violet-900/20 via-purple-900/10 to-transparent border border-violet-900/50 hover:border-violet-600/50 rounded-2xl p-5 flex items-center gap-5 text-left transition-all duration-300 mb-8 overflow-hidden"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 rounded-xl bg-violet-900/40 border border-violet-800/40 flex-shrink-0 group-hover:bg-violet-900/60 transition-colors">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-bold text-white">IARA</span>
                  <span className="text-[9px] font-black bg-violet-500/20 border border-violet-500/30 text-violet-300 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    AI
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Agente autônoma. Agende gravações e execute tarefas com linguagem natural.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors ml-auto flex-shrink-0" />
            </button>

            {/* Módulos Principais */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

              {/* Central de Criação */}
              <button
                onClick={() => setIsProductionHubOpen(true)}
                className="group bg-gradient-to-b from-emerald-900/20 to-transparent border border-emerald-900/50 hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col items-start text-left transition-all duration-300 hover:bg-emerald-900/10"
              >
                <div className="p-2.5 rounded-xl bg-emerald-900/30 border border-emerald-800/50 mb-4">
                  <PenTool className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Central de Criação</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">Roteiros, storyboards, ideias e todo o seu arsenal criativo em um só lugar.</p>
                <span className="mt-auto flex items-center gap-1.5 text-emerald-400 text-xs font-bold group-hover:gap-2.5 transition-all">
                  Acessar <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </button>

              {/* Assistente Executivo */}
              {userPlan === 'solo' ? (
                <div className="relative bg-gradient-to-b from-blue-900/20 to-transparent border border-blue-900/50 rounded-2xl p-6 flex flex-col items-start text-left opacity-60 cursor-not-allowed">
                  <div className="absolute -top-2 -right-2 flex items-center gap-1 rounded-full bg-gray-800 border border-gray-700 px-2 py-0.5 shadow z-10">
                    <Lock className="w-2.5 h-2.5 text-gray-300" />
                    <span className="text-[9px] font-bold text-gray-300">Maker+</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-900/30 border border-blue-800/50 mb-4">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">Assistente Executivo</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">Gerencie clientes, contratos, financeiro e toda a operação do seu negócio criativo.</p>
                  <span className="mt-auto flex items-center gap-1.5 text-blue-400/50 text-xs font-bold">
                    Acessar <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setIsAssistenteExecutivoOpen(true)}
                  className="group bg-gradient-to-b from-blue-900/20 to-transparent border border-blue-900/50 hover:border-blue-500/50 rounded-2xl p-6 flex flex-col items-start text-left transition-all duration-300 hover:bg-blue-900/10"
                >
                  <div className="p-2.5 rounded-xl bg-blue-900/30 border border-blue-800/50 mb-4">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">Assistente Executivo</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">Gerencie clientes, contratos, financeiro e toda a operação do seu negócio criativo.</p>
                  <span className="mt-auto flex items-center gap-1.5 text-blue-400 text-xs font-bold group-hover:gap-2.5 transition-all">
                    Acessar <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              )}

              {/* Creator Stock */}
              <div className="relative bg-gradient-to-b from-purple-900/20 to-transparent border border-purple-900/50 rounded-2xl p-6 flex flex-col items-start text-left opacity-60 cursor-not-allowed pointer-events-none">
                <span className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full bg-zinc-600/40 text-zinc-400 border border-zinc-600/40 uppercase tracking-widest">
                  Em Breve
                </span>
                <div className="p-2.5 rounded-xl bg-purple-900/30 border border-purple-800/50 mb-4">
                  <Library className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">Creator Stock</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">Banco de referências visuais, sons e elementos para turbinar sua produção.</p>
                <span className="mt-auto flex items-center gap-1.5 text-purple-400 text-xs font-bold">
                  Acessar <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="w-full max-w-3xl mx-auto my-10 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                value={agentQuery}
                onChange={(e) => setAgentQuery(e.target.value)}
                placeholder="Buscar agentes, tarefas ou ferramentas..."
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-400 placeholder-gray-600 focus:border-purple-500/50 outline-none transition-colors"
              />
            </div>

            {/* Gestão & CRM */}
            <div className="w-full mb-12">
              <h2 className="text-xs font-bold tracking-wider text-gray-500 mb-4 uppercase">Gestão & CRM</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setIsArquivosHubOpen(true)}
                  className="group bg-[#0a0a0a] border border-white/5 hover:border-white/20 rounded-2xl p-5 flex items-start gap-4 text-left transition-all duration-300"
                >
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 group-hover:bg-white/10 transition-colors">
                    <FolderOpen className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white mb-1">Hub de Arquivos</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">Gerencie HDs e registre ingests como Backup.</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/dashboard/pricing')}
                  className="group bg-[#0a0a0a] border border-white/5 hover:border-violet-900/50 rounded-2xl p-5 flex items-start gap-4 text-left transition-all duration-300"
                >
                  <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-900/40 flex-shrink-0 group-hover:bg-violet-500/15 transition-colors">
                    <Calculator className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white mb-1">Assistente de Precificação</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">Calcule orçamentos e defina sua margem de lucro em poucos passos.</p>
                  </div>
                </button>
                <div className="relative bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 flex items-start gap-4 opacity-60 pointer-events-none">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-white">Auxiliar Financeiro</h3>
                      <span className="bg-white/10 text-[10px] px-2 py-1 rounded text-gray-400">Em breve</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">Controle de receitas, despesas e precificação.</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/gerador-contratos"
                  className="group bg-[#0a0a0a] border border-purple-500/20 hover:border-purple-500/40 rounded-2xl p-5 flex items-start gap-4 text-left transition-all duration-300 hover:bg-purple-500/5"
                >
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex-shrink-0 group-hover:bg-purple-500/15 transition-colors">
                    <FilePen className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-white">Gerador de Contratos</h3>
                      <span className="bg-purple-500/15 border border-purple-500/30 text-[10px] px-2 py-1 rounded text-purple-300">Novo ✨</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">Crie contratos jurídicos blindados em formato de quiz em poucos cliques.</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Equipe & Conta */}
            <div className="w-full mb-12">
              <h2 className="text-xs font-bold tracking-wider text-gray-500 mb-4 uppercase">Equipe & Conta</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/dashboard/team')}
                  className="group bg-[#0a0a0a] border border-white/5 hover:border-emerald-900/50 rounded-2xl p-5 flex items-start gap-4 text-left transition-all duration-300"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-900/40 flex-shrink-0 group-hover:bg-emerald-500/15 transition-colors">
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white mb-1">Diretório da Equipe</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">Visualize e contate os membros da sua equipe via WhatsApp.</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/dashboard/profile')}
                  className="group bg-[#0a0a0a] border border-white/5 hover:border-white/15 rounded-2xl p-5 flex items-start gap-4 text-left transition-all duration-300"
                >
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 group-hover:bg-white/10 transition-colors">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white mb-1">Minha Conta</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">Edite seu perfil, cargo e informações de contato.</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Ferramentas Extras */}
            <div className="w-full mb-12">
              <h2 className="text-xs font-bold tracking-wider text-gray-500 mb-4 uppercase">Ferramentas Extras</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => handleAgentClick(AgentId.IMAGE_GENERATOR)}
                  className="group flex items-center gap-3 p-4 bg-[#0a0a0a] border border-white/5 hover:border-white/20 rounded-xl text-left transition-all duration-200"
                >
                  <div className="p-2 rounded-lg bg-purple-500/10 flex-shrink-0">
                    <Image className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors truncate">Prompt para Imagem</span>
                </button>
                <button
                  onClick={() => handleAgentClick(AgentId.VIDEO_PROMPTS)}
                  className="group flex items-center gap-3 p-4 bg-[#0a0a0a] border border-white/5 hover:border-white/20 rounded-xl text-left transition-all duration-200"
                >
                  <div className="p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors truncate">Prompt para Videos</span>
                </button>
                <button
                  onClick={() => handleAgentClick(AgentId.YOUTUBE_SEO)}
                  className="group flex items-center gap-3 p-4 bg-[#0a0a0a] border border-white/5 hover:border-white/20 rounded-xl text-left transition-all duration-200"
                >
                  <div className="p-2 rounded-lg bg-red-500/10 flex-shrink-0">
                    <Youtube className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors truncate">YouTube SEO</span>
                </button>
                <button
                  onClick={() => handleAgentClick(AgentId.INSTAGRAM_CAPTIONS)}
                  className="group flex items-center gap-3 p-4 bg-[#0a0a0a] border border-white/5 hover:border-white/20 rounded-xl text-left transition-all duration-200"
                >
                  <div className="p-2 rounded-lg bg-pink-500/10 flex-shrink-0">
                    <Instagram className="w-4 h-4 text-pink-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors truncate">Legendas Instagram</span>
                </button>
              </div>
            </div>

          {/* Usage Panel */}
            {usageData && (
              <div className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
                  <BarChart2 className="w-4 h-4" />
                  Uso do Plano ({usageData.plan === 'solo' ? 'Start' : usageData.plan === 'maker' ? 'Maker' : usageData.plan === 'studio' ? 'Studio' : 'Agency'})
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(usageData.features).map(([key, data]) => {
                    const labels: Record<string, string> = { script_generator: 'Roteiros', proposals: 'Propostas', image_analysis: 'Imagens', storyboard: 'Storyboards' };
                    const pct = (data as { used: number; limit: number; percentage: number }).percentage;
                    const used = (data as { used: number; limit: number; percentage: number }).used;
                    const limit = (data as { used: number; limit: number; percentage: number }).limit;
                    const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
                    const textColor = pct >= 90 ? 'text-red-400' : pct >= 70 ? 'text-amber-400' : 'text-emerald-400';
                    return (
                      <div key={key} className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{labels[key] || key}</span>
                          <span className={`text-[10px] font-bold ${textColor}`}>{pct}%</span>
                        </div>
                        <p className="text-lg font-bold text-white mb-2">
                          {used.toLocaleString('pt-BR')} <span className="text-xs font-normal text-gray-500">/ {limit.toLocaleString('pt-BR')}</span>
                        </p>
                        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                          <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Report Bug — rodapé */}
            <div className="w-full flex justify-center mt-8 pb-8">
              <button
                onClick={() => setIsSupportModalOpen(true)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-full text-xs font-medium text-gray-400 hover:text-gray-200 transition-all shadow-lg"
              >
                🐞 Reportar bug ou sugerir melhoria
              </button>
            </div>
          </div>

        </main>
      )}
    </div>
    </AuthGuard>
  );
}