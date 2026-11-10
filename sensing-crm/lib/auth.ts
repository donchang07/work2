import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDb } from './db';
import { newToken, sha256, verifyPassword } from './auth-core';
import { now } from './time';
import type { User } from './domain/types';

export const COOKIE = 'sc_session';
export const SESSION_MS = 8 * 60 * 60 * 1000;

export function login(email: string, password: string): { token: string; user: User } | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as (User & { password_hash: string }) | undefined;
  if (!row || !verifyPassword(password, row.password_hash)) return null;
  const token = newToken();
  db.prepare('INSERT INTO sessions(token_hash, user_id, expires_at) VALUES (?,?,?)').run(sha256(token), row.id, new Date(now().getTime() + SESSION_MS).toISOString());
  return { token, user: { id: row.id, email: row.email, name: row.name, role: row.role } };
}
export function logout(token: string | undefined) { if (token) getDb().prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token)); }

export type SessionState = { kind: 'none' } | { kind: 'expired' } | { kind: 'ok'; user: User };
export async function sessionState(): Promise<SessionState> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return { kind: 'none' };
  const db = getDb();
  const row = db.prepare('SELECT s.expires_at, u.id, u.email, u.name, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?').get(sha256(token)) as (User & { expires_at: string }) | undefined;
  if (!row) return { kind: 'expired' };
  if (row.expires_at <= now().toISOString()) { db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token)); return { kind: 'expired' }; }
  return { kind: 'ok', user: { id: row.id, email: row.email, name: row.name, role: row.role } };
}

/** 페이지 가드 (FR-003, FR-006) */
export async function requirePageUser(path: string, opts: { admin?: boolean } = {}): Promise<User> {
  const st = await sessionState();
  if (st.kind === 'none') redirect(`/login?next=${encodeURIComponent(path)}`);
  if (st.kind === 'expired') redirect(`/login?reason=expired&next=${encodeURIComponent(path)}`);
  if (opts.admin && st.user.role !== 'admin') redirect('/forbidden');
  return st.user;
}

export class HttpError extends Error { constructor(public status: number, public code: string) { super(code); } }
/** API 가드 */
export async function requireApiUser(opts: { admin?: boolean } = {}): Promise<User> {
  const st = await sessionState();
  if (st.kind !== 'ok') throw new HttpError(401, st.kind === 'expired' ? 'expired' : 'unauthenticated');
  if (opts.admin && st.user.role !== 'admin') throw new HttpError(403, 'forbidden');
  return st.user;
}
