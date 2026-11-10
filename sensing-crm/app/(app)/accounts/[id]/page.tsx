import { guardAccount } from '@/lib/guard';
import Account360 from './Account360';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  await guardAccount(id);
  return <Account360 id={id} />;
}
