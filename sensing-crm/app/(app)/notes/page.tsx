import { guardAccount } from '@/lib/guard';
import Notes from './Notes';
export default async function Page({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  const a = (await searchParams).account;
  await guardAccount(a ? Number(a) : null);
  return <Notes initialAccount={a ?? ''} />;
}
