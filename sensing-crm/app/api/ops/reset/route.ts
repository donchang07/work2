import { requireApiUser } from '@/lib/auth';
import { fail, handle } from '@/lib/api';
export const POST = handle(async () => { await requireApiUser({ admin: true }); return fail(501, 'not_implemented'); });
