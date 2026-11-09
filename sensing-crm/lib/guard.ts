import { notFound, redirect } from 'next/navigation';
import { sessionState } from './auth';
import { getDb } from './db';
import { canAccessAccount } from './repo';

/** 고객 범위 가드 (FR-007): 범위 밖 → SCR-012, 없는 고객 → null */
export async function guardAccount(accountId: number | null): Promise<'ok' | 'missing'> {
  if (accountId === null || Number.isNaN(accountId)) return 'ok';
  const st = await sessionState();
  if (st.kind !== 'ok') redirect('/login?reason=expired');
  const db = getDb();
  const exists = db.prepare('SELECT 1 FROM accounts WHERE id=?').get(accountId);
  if (!exists) return 'missing';
  if (!canAccessAccount(db, st.user, accountId)) redirect('/forbidden');
  return 'ok';
}
export { notFound };
