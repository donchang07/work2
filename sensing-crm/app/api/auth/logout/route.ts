import { cookies } from 'next/headers';
import { COOKIE, logout } from '@/lib/auth';
import { handle, ok } from '@/lib/api';
export const POST = handle(async () => {
  const jar = await cookies();
  logout(jar.get(COOKIE)?.value);
  jar.delete(COOKIE);
  return ok({ ok: true });
});
