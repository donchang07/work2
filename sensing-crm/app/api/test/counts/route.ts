import { getDb } from '@/lib/db';
import { handle, ok } from '@/lib/api';
import { testOnly } from '@/lib/testapi';
export const dynamic = 'force-dynamic';
export const GET = handle(async () => {
  const blocked = testOnly(); if (blocked) return blocked;
  const db = getDb(); const n = (t: string) => (db.prepare(`SELECT count(*) n FROM ${t}`).get() as { n: number }).n;
  return ok({ leads: n('leads'), activities: n('activities'), signals: n('signals') });
});
