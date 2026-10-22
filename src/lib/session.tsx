import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { db } from './store';
import type { FullReport, SessionReport } from './types';

interface SessionCtx {
  sessions: SessionReport[];
  refresh: () => void;
  latestReport: FullReport | null;
  setLatestReport: (r: FullReport | null) => void;
  /** transient practice context mirrored between the wizard and header CTAs */
  preferredTrack: 'Technical' | 'HR';
  setPreferredTrack: (t: 'Technical' | 'HR') => void;
}

const Ctx = createContext<SessionCtx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<SessionReport[]>([]);
  const [latestReport, setLatestReport] = useState<FullReport | null>(null);
  const [preferredTrack, setPreferredTrack] = useState<'Technical' | 'HR'>('Technical');

  const refresh = useCallback(() => {
    db.seedIfEmpty();
    setSessions(db.getSessions());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('speakscore:db-changed', refresh);
    return () => window.removeEventListener('speakscore:db-changed', refresh);
  }, [refresh]);

  const value = useMemo(
    () => ({ sessions, refresh, latestReport, setLatestReport, preferredTrack, setPreferredTrack }),
    [sessions, refresh, latestReport, preferredTrack]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSessions() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSessions must be used inside <SessionProvider>');
  return ctx;
}
