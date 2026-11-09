import { EmptyState, PageHeader } from '@/components/ui';
import { guardAccount } from '@/lib/guard';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await guardAccount(Number((await params).id));
  return <><PageHeader title="준비 중" /><EmptyState message="이 화면은 다음 단계에서 구현됩니다." /></>;
}
