'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge, Button, Card, EmptyState, ErrorBanner, PageHeader, Select, Skeleton, StatTile } from '@/components/ui';
import { useApi } from '@/components/useApi';

type Card = { id: number; account_id: number | null; account_name: string | null; raw_org_name: string; signal_type: string; title: string; summary: string; summary_method: 'ai' | 'rule'; url: string | null; collected_at: string; hasRecs: boolean };
type Data = { dateLabel: string; tiles: { signals: number; highRisk: number; pendingLeads: number }; accounts: { id: number; name: string }[]; cards: Card[]; role?: string };
const time = (iso: string) => new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

export default function Briefing() {
  const [account, setAccount] = useState('');
  const { data, error, loading, reload } = useApi<Data>(`/api/briefing${account ? `?account=${account}` : ''}`);
  const me = useApi<{ user: { role: string } }>('/api/me');
  const router = useRouter();
  const isAdmin = me.data?.user.role === 'admin';
  return (
    <>
      <PageHeader title="오늘의 브리핑" sub={data?.dateLabel ?? ' '} testId="SCR-002-EL-01" />
      {error && <ErrorBanner testId="SCR-002-ERROR" message={error} onRetry={reload} />}
      {loading && !data ? <Skeleton count={3} /> : data && <>
        <div className="tiles">
          <StatTile testId="SCR-002-EL-02" label="오늘 신호" value={`${data.tiles.signals}건`} />
          <StatTile testId="SCR-002-EL-02" label="고위험 고객" value={`${data.tiles.highRisk}곳`} onClick={() => router.push('/risk')} />
          <StatTile testId="SCR-002-EL-02" label="검토 대기 리드" value={`${data.tiles.pendingLeads}건`} onClick={() => router.push('/leads')} />
        </div>
        <div style={{ maxWidth: 320, marginBottom: 16 }}>
          <Select label="고객" testId="SCR-002-EL-03" value={account} onChange={setAccount} placeholder={isAdmin ? '전체 고객' : '전체 담당 고객'} options={data.accounts.map(a => ({ value: String(a.id), label: a.name }))} />
        </div>
        {loading ? <Skeleton count={3} /> : data.cards.length === 0 ? (
          <Card><EmptyState testId="SCR-002-EL-08" message="오늘 새 신호가 없습니다." action={isAdmin && <Link className="btn btn-primary" href="/admin/ops" data-testid="SCR-002-EL-09">데이터 운영으로</Link>} /></Card>
        ) : (
          <div className="stack">
            {data.cards.map(c => (
              <Card key={c.id} testId="SCR-002-EL-04" className="feed-card" data-signal-id={c.id} data-account-id={c.account_id ?? ''}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div className="row"><strong>{c.account_name ?? `${c.raw_org_name} (고객 미연결)`}</strong><Badge tone={['경쟁사평가', '국산화'].includes(c.signal_type) ? 'high' : 'primary'}>{c.signal_type}</Badge></div>
                  <Badge tone={c.summary_method === 'ai' ? 'ai' : undefined} testId="SCR-002-EL-05">{c.summary_method === 'ai' ? 'AI 요약' : '규칙 요약'}</Badge>
                </div>
                <h3 style={{ marginTop: 10 }}>{c.title}</h3>
                <p className="summary">{c.summary}</p>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="caption">{c.url && <a href={c.url} target="_blank" rel="noreferrer">출처 보기</a>} · 수집 {time(c.collected_at)}</span>
                  <div className="row">
                    {c.hasRecs && <Link className="btn btn-text" href={`/actions?account=${c.account_id}`} data-testid="SCR-002-EL-07">관련 다음 행동</Link>}
                    {c.account_id && <Link className="btn btn-secondary btn-sm" href={`/accounts/${c.account_id}`} data-testid="SCR-002-EL-06">고객 360 보기</Link>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </>}
    </>
  );
}
