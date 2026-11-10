import Quality from './Quality';
export default async function Page({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  return <Quality account={(await searchParams).account ?? ''} />;
}
