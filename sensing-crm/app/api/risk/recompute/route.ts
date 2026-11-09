import { requireApiUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { handle, ok } from '@/lib/api';
import { refreshDerived } from '@/lib/repo';
export const POST = handle(async () => { await requireApiUser(); await refreshDerived(getDb(), { snapshot: false }); return ok({ ok: true }); });
