import { buildSeedSessions } from './engine';
import type { SessionReport, QuestionAnalysis } from './types';

/* SpeakScore local database — browser-persisted (localStorage), mirroring
   the IndexedDB / PostgreSQL schema in server/schema.sql. */

const SESSIONS_KEY = 'speakscore_sessions_v1';
const ANSWERS_KEY = 'speakscore_answers_v1';
const SEED_KEY = 'speakscore_seeded_v1';

export interface StoredAnswer extends QuestionAnalysis {
  sessionId: string;
}

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}
function write<T>(key: string, rows: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(rows));
  } catch {
    /* storage full — ignore */
  }
}

export const db = {
  getSessions(): SessionReport[] {
    return read<SessionReport>(SESSIONS_KEY).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
  getAnswers(sessionId?: string): StoredAnswer[] {
    const all = read<StoredAnswer>(ANSWERS_KEY);
    return sessionId ? all.filter((a) => a.sessionId === sessionId) : all;
  },
  saveSession(session: SessionReport, answers: QuestionAnalysis[]) {
    const sessions = read<SessionReport>(SESSIONS_KEY);
    sessions.push(session);
    write(SESSIONS_KEY, sessions);
    const stored = read<StoredAnswer>(ANSWERS_KEY);
    answers.forEach((a) => stored.push({ ...a, sessionId: session.id }));
    write(ANSWERS_KEY, stored);
    window.dispatchEvent(new CustomEvent('speakscore:db-changed'));
  },
  deleteSession(id: string) {
    write(SESSIONS_KEY, read<SessionReport>(SESSIONS_KEY).filter((s) => s.id !== id));
    write(ANSWERS_KEY, read<StoredAnswer>(ANSWERS_KEY).filter((a) => a.sessionId !== id));
    window.dispatchEvent(new CustomEvent('speakscore:db-changed'));
  },
  seedIfEmpty() {
    if (localStorage.getItem(SEED_KEY)) return;
    const seeds = buildSeedSessions();
    write(SESSIONS_KEY, [...read<SessionReport>(SESSIONS_KEY), ...seeds]);
    localStorage.setItem(SEED_KEY, '1');
  },
  resetDemoData() {
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(ANSWERS_KEY);
    localStorage.removeItem(SEED_KEY);
    this.seedIfEmpty();
    window.dispatchEvent(new CustomEvent('speakscore:db-changed'));
  },
};
