import { EmptyState, PageHeader } from '@/components/ui';
import { guardAccount } from '@/lib/guard';
export default async function Page({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  const a = (await searchParams).account; await guardAccount(a ? Number(a) : null);
  return <><PageHeader title="준비 중" /><EmptyState message="이 화면은 다음 단계에서 구현됩니다." /></>;
}
