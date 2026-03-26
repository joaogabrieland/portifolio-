/**
 * agency-storage.ts
 * Thin localStorage helpers for the mock agency state.
 * Replace with real DB calls (Supabase/Firebase) when backend is ready.
 */

const KEY = 'cf_agency_v1';

export interface AgencyUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  memberRole?: string; // functional role: roteirista, videomaker, etc.
  isOwner?: boolean;
  avatar?: string;     // Base64 data-URL or remote URL; set via profile page
  joinedAt: number;
}

interface PersistedState {
  teamMembers: AgencyUser[];
  currentUserId: string | null;
}

const EMPTY: PersistedState = { teamMembers: [], currentUserId: null };

export function loadAgencyState(): PersistedState {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as PersistedState;
  } catch { /* ignore */ }
  return EMPTY;
}

export function saveAgencyState(state: PersistedState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function clearCurrentUser(): void {
  if (typeof window === 'undefined') return;
  try {
    const state = loadAgencyState();
    saveAgencyState({ ...state, currentUserId: null });
  } catch { /* ignore */ }
}
