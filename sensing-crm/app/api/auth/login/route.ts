import { cookies } from 'next/headers';
import { COOKIE, SESSION_MS, login } from '@/lib/auth';
import { body, fail, handle, ok } from '@/lib/api';

export const POST = handle(async (req: Request) => {
  const { email, password } = await body<{ email?: string; password?: string }>(req);
  if (!email || !password) return fail(400, 'validation');
  const r = login(email, password);
  if (!r) return fail(401, 'invalid_credentials');
  (await cookies()).set(COOKIE, r.token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: SESSION_MS / 1000 * 3 });
  return ok({ user: r.user });
});
