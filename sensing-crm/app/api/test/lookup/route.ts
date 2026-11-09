import { getDb } from '@/lib/db';
import { handle, ok } from '@/lib/api';
import { testOnly } from '@/lib/testapi';
export const GET = handle(async (req: Request) => {
  const blocked = testOnly(); if (blocked) return blocked;
  const name = new URL(req.url).searchParams.get('name') ?? '';
  return ok(getDb().prepare('SELECT id, owner_user_id FROM accounts WHERE name=?').get(name) ?? {});
});
