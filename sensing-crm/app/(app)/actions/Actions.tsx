'use client';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { Badge, Button, Card, EmptyState, ErrorBanner, FieldError, PageHeader, Select, Skeleton, Tabs, Tag, Toast } from '@/components/ui';
import { post, useApi } from '@/components/useApi';

type Item = { id: number; account_id: number; account_name: string; action_type: string; action_label: string; product_family: string; channel: string; due_date: string; priority: number; basis_text: string; explanation: string; explanation_method: 'ai' | 'rule'; status: string; reject_reason: string | null; basis: { id: number; title: string }[] };
type Data = { counts: { new: number; adopted: number; closed: number }; items: Item[]; accountName: string | null };
const PRI: Record<number, string> = { 1: '최우선', 2: '높음', 3: '높음', 4: '보통', 5: '보통', 6: '낮음' };
const STATUS: Record<string, string> = { adopted: '채택', held: '보류', rejected: '거절' };

export default function Actions({ account }: { account: string }) {
  const [tab, setTab] = useState('new');
  const { data, error, loading, reload } = useApi<Data>(`/api/actions?status=${tab}${account ? `&account=${account}` : ''}`);
  const [rejecting, setRejecting] = useState<Record<number, string>>({});
  const [rowErr, setRowErr] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [actErr, setActErr] = useState<string | null>(null);
  const clear = useCallback(() => setToast(null), []);
  async function act(i: Item, action: 'adopt' | 'hold' | 'reject') {
    setRowErr(e => ({ ...e, [i.id]: '' })); setActErr(null);
    if (action === 'reject') {
      if (rejecting[i.id] === undefined) { setRejecting(r => ({ ...r, [i.id]: '' })); return; }
      if (!rejecting[i.id]) { setRowErr(e => ({ ...e, [i.id]: '거절 사유를 선택하세요' })); return; }
    }
    setBusy(i.id);
    try {
      await post(`/api/actions/${i.id}`, { action, reason: rejecting[i.id] });
      setToast(action === 'adopt' ? '채택했습니다' : action === 'hold' ? '보류했습니다' : '거절했습니다');
      setRejecting(r => { const x = { ...r }; delete x[i.id]; return x; });
      await reload();
    } catch (e) { setActErr((e as Error).message); } finally { setBusy(null); }
  }
  return (
    <>
      <PageHeader title="다음 행동 추천" sub={data?.accountName ? <span className="row">고객 필터 <Tag>{data.accountName}</Tag><Link href="/actions">필터 해제</Link></span> : '시장 신호·활동·위험 점수에서 만든 고객별 다음 행동 (O-2)'} />
      {(error || actErr) && <ErrorBanner testId="SCR-009-ERROR" message={actErr ?? error!} onRetry={reload} />}
      <Tabs testId="SCR-009-EL-01" value={tab} onChange={v => { setTab(v); setRejecting({}); setRowErr({}); }} tabs={[
        { value: 'new', label: '새 추천', count: data?.counts.new }, { value: 'adopted', label: '채택' }, { value: 'closed', label: '보류·거절' }]} />
      {loading && !data ? <Skeleton /> : data && (data.items.length === 0 ? <Card><EmptyState testId="SCR-009-EL-09" message={tab === 'new' ? '새 추천이 없습니다.' : '해당 추천이 없습니다.'} /></Card> :
        <div className="stack">
          {data.items.map(i => (
            <Card key={i.id} testId="SCR-009-EL-02" data-rec-id={i.id} data-action-type={i.action_type}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="row"><Badge tone={i.priority === 1 ? 'high' : i.priority <= 3 ? 'mid' : 'primary'}>{PRI[i.priority]}</Badge><Link href={`/accounts/${i.account_id}`}><strong>{i.account_name}</strong></Link>{STATUS[i.status] && <Badge>{STATUS[i.status]}{i.reject_reason ? ` · ${i.reject_reason}` : ''}</Badge>}</div>
                <Badge tone={i.explanation_method === 'ai' ? 'ai' : undefined} testId="SCR-009-EL-07">{i.explanation_method === 'ai' ? '설명: AI' : '설명: 규칙'}</Badge>
              </div>
              <h3 style={{ margin: '12px 0 6px' }}>{i.action_label}</h3>
              <div className="row caption" style={{ gap: 16 }}><span>제품군 {i.product_family}</span><span>채널 {i.channel}</span><span className="num">기한 {i.due_date}</span></div>
              <p style={{ margin: '10px 0' }}>{i.explanation}</p>
              <div className="caption">근거: {i.basis.length ? i.basis.map(b => <Link key={b.id} href={`/accounts/${i.account_id}`} style={{ marginRight: 8 }}>{b.title}</Link>) : i.basis_text}</div>
              {(i.status === 'new' || i.status === 'held') && <div className="row" style={{ marginTop: 14 }}>
                <Button small testId="SCR-009-EL-03" loading={busy === i.id} onClick={() => act(i, 'adopt')}>채택</Button>
                {i.status === 'new' && <Button small variant="secondary" testId="SCR-009-EL-04" disabled={busy === i.id} onClick={() => act(i, 'hold')}>보류</Button>}
                <Button small variant="text" testId="SCR-009-EL-05" disabled={busy === i.id} onClick={() => act(i, 'reject')}>거절</Button>
                {rejecting[i.id] !== undefined && <div style={{ width: 200 }}><Select hideLabel label="거절 사유" testId="SCR-009-EL-06" value={rejecting[i.id]} onChange={v => setRejecting(r => ({ ...r, [i.id]: v }))} placeholder="거절 사유 선택" options={['이미 진행 중', '시점 부적절', '근거 부정확', '기타'].map(x => ({ value: x, label: x }))} /></div>}
                {rowErr[i.id] && <FieldError testId="SCR-009-EL-10" message={rowErr[i.id]} />}
              </div>}
            </Card>))}
        </div>)}
      {toast && <Toast testId="SCR-009-EL-08" message={toast} onDone={clear} />}
    </>
  );
}
