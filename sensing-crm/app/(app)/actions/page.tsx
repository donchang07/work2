import { guardAccount } from '@/lib/guard';
import Actions from './Actions';
export default async function Page({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  const a = (await searchParams).account;
  await guardAccount(a ? Number(a) : null);
  return <Actions account={a ?? ''} />;
}
