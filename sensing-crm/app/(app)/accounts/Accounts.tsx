'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge, Card, DataTable, EmptyState, ErrorBanner, gradeTone, PageHeader, ScoreBar, SearchField, Select, Skeleton } from '@/components/ui';
import { fmtEok, useApi } from '@/components/useApi';

type Item = { id: number; name: string; segment: string; owner: string; revenue12: number; score: number; grade: string; quality: number; aliases: string[] };
const SEGS = ['CDMO', '바이오텍', '제약', '대학·연구소', '반도체·배터리', '기타'];

export default function Accounts() {
  const [q, setQ] = useState('');
  const [dq, setDq] = useState('');
  const [seg, setSeg] = useState('');
  useEffect(() => { const t = setTimeout(() => setDq(q.trim()), 300); return () => clearTimeout(t); }, [q]);
  const { data, error, loading, reload } = useApi<{ items: Item[] }>(`/api/accounts?${new URLSearchParams({ q: dq, segment: seg })}`);
  const router = useRouter();
  const open = (i: Item) => router.push(`/accounts/${i.id}`);
  return (
    <>
      <PageHeader title="고객" sub="고객명·별칭으로 검색하고 고객 360으로 이동합니다" />
      {error && <ErrorBanner testId="SCR-005-ERROR" message={error} onRetry={reload} />}
      <div className="row" style={{ marginBottom: 16, alignItems: 'flex-end' }}>
        <div style={{ width: 320, maxWidth: '100%' }}><SearchField label="고객명·별칭 검색" testId="SCR-005-EL-01" value={q} maxLength={50} onChange={setQ} placeholder="예: SDBL, 송도" /></div>
        <div style={{ width: 220, maxWidth: '100%' }}><Select label="세그먼트" testId="SCR-005-EL-02" value={seg} onChange={setSeg} placeholder="전체" options={SEGS.map(s => ({ value: s, label: s }))} /></div>
      </div>
      {loading && !data ? <Skeleton /> : data && (data.items.length === 0 ? <Card><EmptyState testId="SCR-005-EL-04" message="검색 결과가 없습니다." /></Card> :
        <Card style={{ padding: 8 }}>
          <DataTable testId="SCR-005-EL-03" rowTestId="SCR-005-ROW" rows={data.items} rowKey={i => i.id} onRowClick={open}
            mobile={i => <div className="stack" style={{ gap: 6 }}><div className="row" style={{ justifyContent: 'space-between' }}><strong>{i.name}</strong><Badge>{i.segment}</Badge></div><span className="caption">12개월 {fmtEok(i.revenue12)} · 품질 {Math.round(i.quality * 100)}%</span><ScoreBar score={i.score} /></div>}
            cols={[
              { key: 'n', header: '고객명', render: i => <div><strong>{i.name}</strong><div className="caption">{i.aliases.slice(0, 2).join(' · ')}</div></div> },
              { key: 's', header: '세그먼트', render: i => <Badge>{i.segment}</Badge> },
              { key: 'o', header: '담당 KAM', render: i => i.owner },
              { key: 'r', header: '최근 12개월 주문액', align: 'r', render: i => fmtEok(i.revenue12) },
              { key: 'k', header: '이탈위험', render: i => <div className="row" style={{ flexWrap: 'nowrap' }}><ScoreBar score={i.score} /><Badge tone={gradeTone(i.grade)}>{i.grade}</Badge></div> },
              { key: 'q', header: '품질 점수', align: 'r', render: i => `${Math.round(i.quality * 100)}%` },
            ]} />
        </Card>)}
    </>
  );
}
