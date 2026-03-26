'use client';

/**
 * AgencyContext.tsx
 * Global state for the agency: who is logged in (currentUser) and the full
 * team roster (teamMembers). Persisted to localStorage via agency-storage.ts.
 *
 * TODO: Backend — replace loadAgencyState / saveAgencyState with
 * Supabase/Firebase real-time listeners when the backend is ready.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import {
  AgencyUser,
  loadAgencyState,
  saveAgencyState,
} from '@/lib/agency-storage';

// ─────────────────────────────────────────────
// Context type
// ─────────────────────────────────────────────
interface AgencyContextType {
  /** The user currently logged in. null during SSR / before hydration. */
  currentUser: AgencyUser | null;
  /** Full list of all agency members (admin + invited users). */
  teamMembers: AgencyUser[];
  /** Log in as an existing user (or create a new one). */
  setCurrentUser: (user: AgencyUser) => void;
  /** Add a brand-new member and log them in. Used by the invite signup page. */
  addTeamMember: (user: AgencyUser) => void;
  /** Update profile fields (name, avatar, etc.) for the current user. */
  updateCurrentUser: (updates: Partial<AgencyUser>) => void;
  /** Update a member's functional role (e.g. roteirista → designer). */
  updateMemberRole: (userId: string, memberRole: string) => void;
  /** Remove a member from the agency roster. */
  removeMember: (userId: string) => void;
  /** Sign out the current user (clears currentUserId from storage). */
  signOut: () => void;
}

// ─────────────────────────────────────────────
// Context + provider
// ─────────────────────────────────────────────
const AgencyContext = createContext<AgencyContextType>({
  currentUser: null,
  teamMembers: [],
  setCurrentUser: () => {},
  addTeamMember: () => {},
  updateCurrentUser: () => {},
  updateMemberRole: () => {},
  removeMember: () => {},
  signOut: () => {},
});

export function AgencyProvider({ children }: { children: ReactNode }) {
  const [teamMembers, setTeamMembers] = useState<AgencyUser[]>([]);
  const [currentUser, setCurrentUserState] = useState<AgencyUser | null>(null);

  // Ref so updateCurrentUser can read the latest currentUser without stale closures
  // and without adding currentUser to its dependency array (which would recreate it on every render).
  const currentUserRef = useRef<AgencyUser | null>(null);
  currentUserRef.current = currentUser;

  // ── Hydrate from localStorage once on client ──────────────────────────────
  useEffect(() => {
    const stored = loadAgencyState();

    // Standard auth keys written by AuthGuard + invite bypass
    const cfEmail = localStorage.getItem('cf_email') || '';
    const cfName  = localStorage.getItem('cf_name')  || '';
    const cfRole  = localStorage.getItem('cf_role');

    // Always force admin for known demo/owner accounts, regardless of stored role
    const FORCED_ADMIN_EMAILS = ['teste@creatorflow.com', 'teste@creatorflowia.com', 'marcosvlogs12@gmail.com'];
    const role: 'admin' | 'user' = FORCED_ADMIN_EMAILS.includes(cfEmail.toLowerCase())
      ? 'admin'
      : cfRole === 'user' ? 'user' : 'admin';

    let members = stored.teamMembers;

    // Bootstrap: if we have an authenticated email that isn't in the roster yet,
    // add them as the owner (admin) so the list is never empty.
    if (cfEmail && !members.some(m => m.email === cfEmail)) {
      const owner: AgencyUser = {
        id: `owner_${cfEmail}`,
        name: cfName || 'Administrador',
        email: cfEmail,
        role,
        isOwner: role === 'admin',
        joinedAt: Date.now(),
      };
      members = [owner, ...members];
      saveAgencyState({ teamMembers: members, currentUserId: owner.id });
    }

    // Patch any existing member record that has the wrong role for forced-admin emails
    if (FORCED_ADMIN_EMAILS.includes(cfEmail.toLowerCase())) {
      members = members.map(m =>
        m.email.toLowerCase() === cfEmail.toLowerCase()
          ? { ...m, role: 'admin' as const, isOwner: true }
          : m
      );
      saveAgencyState({ teamMembers: members, currentUserId: stored.currentUserId });
    }

    setTeamMembers(members);

    // Find the currentUser: prefer stored.currentUserId, then match by email
    let current: AgencyUser | null = null;
    if (stored.currentUserId) {
      current = members.find(m => m.id === stored.currentUserId) ?? null;
    }
    if (!current && cfEmail) {
      current = members.find(m => m.email === cfEmail) ?? null;
    }

    setCurrentUserState(current);
  }, []);

  // ── Persist helper ────────────────────────────────────────────────────────
  const persist = useCallback((members: AgencyUser[], userId: string | null) => {
    saveAgencyState({ teamMembers: members, currentUserId: userId });
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const setCurrentUser = useCallback((user: AgencyUser) => {
    setCurrentUserState(user);
    setTeamMembers(prev => {
      const updated = prev.some(m => m.id === user.id) ? prev : [...prev, user];
      persist(updated, user.id);
      return updated;
    });
  }, [persist]);

  const addTeamMember = useCallback((user: AgencyUser) => {
    setTeamMembers(prev => {
      // Avoid duplicates by email
      const exists = prev.some(m => m.email === user.email);
      const updated = exists ? prev : [...prev, user];
      persist(updated, user.id);
      return updated;
    });
    setCurrentUserState(user);
    // Sync standard auth keys so AuthGuard / dashboard reads work
    localStorage.setItem('cf_email', user.email);
    localStorage.setItem('cf_name', user.name);
    localStorage.setItem('cf_role', user.role);
  }, [persist]);

  const updateCurrentUser = useCallback((updates: Partial<AgencyUser>) => {
    // Read current value via ref to avoid stale closure and never nest setState calls.
    const prev = currentUserRef.current;
    if (!prev) return;
    const updated = { ...prev, ...updates };

    // Update both slices of state independently — React 18 batches these into one render.
    setCurrentUserState(updated);
    setTeamMembers(members => {
      const next = members.map(m => m.id === updated.id ? updated : m);
      persist(next, updated.id);
      return next;
    });

    // Sync standard auth keys
    if (updates.name) localStorage.setItem('cf_name', updates.name);
    if (updates.avatar) localStorage.setItem('cf_avatar', updates.avatar);
  }, [persist]);

  const updateMemberRole = useCallback((userId: string, memberRole: string) => {
    setTeamMembers(prev => {
      const updated = prev.map(m => m.id === userId ? { ...m, memberRole } : m);
      persist(updated, currentUser?.id ?? null);
      return updated;
    });
  }, [persist, currentUser]);

  const removeMember = useCallback((userId: string) => {
    setTeamMembers(prev => {
      const updated = prev.filter(m => m.id !== userId);
      persist(updated, currentUser?.id ?? null);
      return updated;
    });
  }, [persist, currentUser]);

  const signOut = useCallback(() => {
    setCurrentUserState(null);
    setTeamMembers(prev => {
      persist(prev, null);
      return prev;
    });
    // Clear standard auth keys
    ['cf_token', 'cf_email', 'cf_name', 'cf_plan', 'cf_role'].forEach(k =>
      localStorage.removeItem(k)
    );
  }, [persist]);

  const value = useMemo(() => ({
    currentUser,
    teamMembers,
    setCurrentUser,
    addTeamMember,
    updateCurrentUser,
    updateMemberRole,
    removeMember,
    signOut,
  }), [currentUser, teamMembers, setCurrentUser, addTeamMember, updateCurrentUser, updateMemberRole, removeMember, signOut]);

  return (
    <AgencyContext.Provider value={value}>
      {children}
    </AgencyContext.Provider>
  );
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────
export function useAgency() {
  return useContext(AgencyContext);
}
