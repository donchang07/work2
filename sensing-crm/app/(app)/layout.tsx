import { headers } from 'next/headers';
import { requirePageUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';

export const dynamic = 'force-dynamic';
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const path = (await headers()).get('x-pathname') || '/briefing';
  const admin = path.startsWith('/lab') || path.startsWith('/admin');
  const user = await requirePageUser(path, { admin });
  return <AppShell user={user}>{children}</AppShell>;
}
