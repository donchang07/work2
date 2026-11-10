'use client';
import Link from 'next/link';
import { Badge, Card, EmptyState, ErrorBanner, gradeTone, PageHeader, Skeleton, StatTile, Tag, Timeline } from '@/components/ui';
import { BarChart } from '@/components/charts';
import { apiFetch, fmtEok } from '@/components/useApi';
import { useCallback, useEffect, useState } from 'react';

type F = { key: string; label: string; rawText: string; contribution: number };
type D = { account: { id: number; name: string; segment: string; owner: string; aliases: string[] }; tiles: { recent3: number; prior3: number; changePct: number | null; lastContactDays: number | null; score: number; grade: string };
  monthly: { month: string; amount: number }[]; hasOrders: boolean; timeline: { key: string; date: string; kind: string; type: string; text: string }[]; reasons: F[];
  rec: { action_label: string; product_family: string; channel: string; due_date: string; explanation: string } | null; recCount: number; quality: number; openIssues: number };

export default function Account360({ id }: { id: number }) {
  const [data, setData] = useState<D | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'error' | 'missing'>('loading');
  const load = useCallback(async () => {
    setState('loading');
    try { setData(await apiFetch<D>(`/api/accounts/${id}`)); setState('ok'); }
    catch (e) { const s = (e as { status?: number }).status; if (['expired', 'forbidden'].includes((e as Error).message)) return; setState(s === 404 ? 'missing' : 'error'); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);
  if (state === 'missing') return <Card><EmptyState testId="SCR-006-MISSING" message="고객을 찾을 수 없습니다." action={<Link className="btn btn-primary" href="/accounts">고객 목록</Link>} /></Card>;
  if (state === 'error') return <ErrorBanner testId="SCR-006-ERROR" message="일시적인 오류입니다. 잠시 후 다시 시도하세요." onRetry={load} />;
  if (!data) return <Skeleton count={4} />;
  const { account: a, tiles: t } = data;
  return (
    <>
      <div className="page-header">
        <div data-testid="SCR-006-EL-01">
          <h1>{a.name}</h1>
          <div className="row" style={{ marginTop: 8 }}><Badge tone="primary">{a.segment}</Badge>{a.aliases.map(x => <Tag key={x}>{x}</Tag>)}<span className="caption">담당 {a.owner}</span></div>
        </div>
        <Link className="btn btn-primary" href={`/notes?account=${a.id}`} data-testid="SCR-006-EL-08">미팅 노트 작성</Link>
      </div>
      <div className="tiles">
        <StatTile testId="SCR-006-EL-02" label="최근 3개월 주문액" value={fmtEok(t.recent3)} />
        <StatTile testId="SCR-006-EL-02" label="직전 3개월 대비" value={t.changePct === null ? '—' : `${t.changePct > 0 ? '▲' : t.changePct < 0 ? '▼' : ''} ${Math.abs(t.changePct)}%`} subTone={t.changePct !== null && t.changePct < 0 ? 'down' : 'up'} sub={`직전 ${fmtEok(t.prior3)}`} />
        <StatTile testId="SCR-006-EL-02" label="마지막 접촉 경과" value={t.lastContactDays === null ? '기록 없음' : `${t.lastContactDays}일`} />
        <StatTile testId="SCR-006-EL-02" label="이탈위험 점수" value={<span className="row">{t.score}<Badge tone={gradeTone(t.grade)}>{t.grade}</Badge></span>} />
      </div>
      <div className="two">
        <div className="stack">
          <Card title="월별 주문액 (최근 12개월, 억 원)">
            {data.hasOrders ? <BarChart testId="SCR-006-EL-03" label="월별 주문액" xKey="m" unit="억" data={data.monthly.map(m => ({ m: m.month.slice(2).replace('-', '.'), 주문액: Math.round(m.amount / 1e6) / 100 }))} series={[{ key: '주문액', label: '주문액' }]} />
              : <EmptyState testId="SCR-006-EL-09" message="주문 이력이 없습니다." />}
          </Card>
          <Card title="신호·활동 타임라인">
            {data.timeline.length ? <Timeline testId="SCR-006-EL-04" items={data.timeline.map(x => ({ key: x.key, date: x.date, icon: x.kind === 'signal' ? '📡' : '🗒️', text: <span><Badge tone={x.kind === 'signal' ? 'primary' : undefined}>{x.type}</Badge> {x.text}</span> }))} />
              : <EmptyState testId="SCR-006-EL-09" message="기록된 활동이 없습니다." />}
          </Card>
        </div>
        <div className="stack">
          <Card testId="SCR-006-EL-05" title="위험 근거 상위 3개">
            {data.reasons.length ? <ul style={{ margin: 0, paddingLeft: 18 }}>{data.reasons.map(r => <li key={r.key}>{r.label} {r.rawText} <span className="caption">(+{r.contribution}점)</span></li>)}</ul> : <p className="muted">위험 요인이 없습니다.</p>}
            <Link href="/risk" className="btn btn-text" style={{ paddingLeft: 0 }}>위험 목록</Link>
          </Card>
          <Card testId="SCR-006-EL-06" title="다음 행동 1순위">
            {data.rec ? <><strong>{data.rec.action_label}</strong><p className="caption" style={{ margin: '6px 0' }}>{data.rec.product_family} · {data.rec.channel} · 기한 {data.rec.due_date}</p><p style={{ margin: 0 }}>{data.rec.explanation}</p></> : <p className="muted">새 추천이 없습니다.</p>}
            <Link href={`/actions?account=${a.id}`} className="btn btn-text" style={{ paddingLeft: 0 }} data-testid="SCR-006-EL-06-ALL">추천 전체 보기 ({data.recCount})</Link>
          </Card>
          <Card testId="SCR-006-EL-07" title="이 고객 데이터 품질">
            <div className="stat"><div className="value">{Math.round(data.quality * 100)}%</div><div className="sub muted">열린 이슈 {data.openIssues}건</div></div>
            <Link href={`/quality?account=${a.id}`} className="btn btn-text" style={{ paddingLeft: 0 }} data-testid="SCR-006-EL-07-LINK">품질 이슈 보기</Link>
          </Card>
        </div>
      </div>
    </>
  );
}
