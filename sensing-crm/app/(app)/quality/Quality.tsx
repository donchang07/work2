'use client';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { Badge, Button, Card, DataTable, EmptyState, ErrorBanner, PageHeader, Select, Skeleton, StatTile, Toast } from '@/components/ui';
import { LineChart } from '@/components/charts';
import { post, useApi } from '@/components/useApi';

type M = { completeness: number; accuracy: number; timeliness: number; consistency: number; uniqueness: number; overall: number };
type Issue = { id: number; issue_type: string; entity: string; entity_id: number; account_id: number | null; account_name: string | null; description: string };
type Q = { id: number; issue_type: string; raw_name: string; candidate_name: string; similarity: number | null };
type Data = { metrics: M; trend: (M & { computed_at: string })[]; issues: Issue[]; issueTotal: number; queue: Q[]; canMerge: boolean; accountName: string | null };
const TYPES: Record<string, string> = { missing_field: '필수 항목 누락', late_entry: '기록 지연', unresolved_name: '고객명 미해소', duplicate_account: '중복 고객' };
const DEFS: [keyof M, string, string][] = [
  ['overall', '종합', '5개 지표의 산술 평균'],
  ['completeness', '완전성', '활동의 필수 항목(니즈·다음 단계·고객 반응·경쟁사 언급·다음 접촉일) 채움 비율'],
  ['accuracy', '정확성', '사람이 확정·검증한 활동 비율'],
  ['timeliness', '적시성', '미팅 후 2일 이내 기록된 활동 비율'],
  ['consistency', '일관성', '공시·뉴스 신호 중 고객에 연결된 비율'],
  ['uniqueness', '유일성', '1 − 중복으로 보이는 고객 비율'],
];
const pct = (n: number) => `${Math.round(n * 100)}%`;
const day = (iso: string) => new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric' }).format(new Date(iso));

export default function Quality({ account }: { account: string }) {
  const [type, setType] = useState('');
  const { data, error, loading, reload } = useApi<Data>(`/api/quality?${new URLSearchParams({ ...(account ? { account } : {}), ...(type ? { type } : {}) })}`);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [actErr, setActErr] = useState<string | null>(null);
  const clear = useCallback(() => setToast(null), []);
  async function act(id: number, action: 'merge' | 'dismiss') {
    setBusy(`${action}:${id}`); setActErr(null);
    try { await post(`/api/quality/issues/${id}`, { action }); setToast(action === 'merge' ? '통합했습니다' : '다른 고객으로 표시했습니다'); await reload(); }
    catch (e) { setActErr((e as Error).message); } finally { setBusy(null); }
  }
  async function recompute() {
    setBusy('recompute');
    try { await post('/api/quality/recompute'); setToast('지표를 다시 계산했습니다'); await reload(); } catch (e) { setActErr((e as Error).message); } finally { setBusy(null); }
  }
  const href = (i: Issue) => i.entity === 'account' ? `/accounts/${i.entity_id}` : i.account_id ? `/accounts/${i.account_id}` : '/briefing';
  return (
    <>
      <PageHeader title="데이터 품질" sub={data?.accountName ? `${data.accountName} 고객 범위` : '자동화(A-1·A-2·A-5)가 만드는 CRM 데이터 품질'} actions={<Button variant="text" testId="SCR-007-EL-08" loading={busy === 'recompute'} onClick={recompute}>지표 재계산</Button>} />
      {(error || actErr) && <ErrorBanner testId="SCR-007-ERROR" message={actErr ?? error!} onRetry={reload} />}
      {loading && !data ? <Skeleton /> : data && <>
        <div className="tiles">
          {DEFS.map(([k, label, def]) => <div key={k} title={def} data-metric={k}>
            <StatTile testId="SCR-007-EL-01" label={`${label} ⓘ`} value={pct(data.metrics[k])} sub={<span className="caption">{def}</span>} />
          </div>)}
        </div>
        <Card title={`${data.accountName ? `${data.accountName} ` : ''}품질 추세 (최근 8개 스냅샷)`} style={{ marginBottom: 24 }}>
          {data.trend.length >= 2 ? <LineChart testId="SCR-007-EL-02" label={data.accountName ? `${data.accountName} 품질 추세` : '품질 지표 추세'} yDomain={[0, 100]} xKey="d" data={data.trend.map(t => ({ d: day(t.computed_at), 종합: Math.round(t.overall * 100), 완전성: Math.round(t.completeness * 100), 정확성: Math.round(t.accuracy * 100), 적시성: Math.round(t.timeliness * 100), 일관성: Math.round(t.consistency * 100) }))}
            series={['종합', '완전성', '정확성', '적시성', '일관성'].map(k => ({ key: k, label: k }))} /> : <p className="muted">추세를 그리려면 스냅샷이 2개 이상 필요합니다.</p>}
        </Card>
        <div className="two">
          <Card title={`품질 이슈 (${data.issueTotal}건)`}>
            <div style={{ maxWidth: 280, marginBottom: 12 }}>
              <Select label="이슈 유형" testId="SCR-007-EL-03" value={type} onChange={setType} placeholder="전체" options={Object.entries(TYPES).map(([v, l]) => ({ value: v, label: l }))} />
            </div>
            {data.issues.length === 0 ? <EmptyState testId="SCR-007-ISSUES-EMPTY" message="열린 이슈가 없습니다." /> :
              <div style={{ maxHeight: 520, overflow: 'auto' }}>
                <DataTable testId="SCR-007-EL-04" rowTestId="SCR-007-EL-04-ROW" rows={data.issues} rowKey={i => i.id} cols={[
                  { key: 't', header: '유형', render: i => <Badge tone={i.issue_type === 'missing_field' ? 'mid' : i.issue_type === 'late_entry' ? 'warning' : 'high'}>{TYPES[i.issue_type]}</Badge> },
                  { key: 'a', header: '대상', render: i => <Link href={href(i)}>{i.account_name ?? '미연결 신호'}</Link> },
                  { key: 'd', header: '설명', render: i => i.description },
                  { key: 's', header: '상태', render: () => '열림' },
                ]} /></div>}
          </Card>
          <Card title={`통합 대기열 (${data.queue.length})`} testId="SCR-007-EL-05" data-count={data.queue.length}>
            {data.queue.length === 0 ? <EmptyState testId="SCR-007-EL-09" message="처리할 통합 후보가 없습니다." /> :
              <div className="stack" style={{ gap: 12 }}>
                {data.queue.map(q => <div key={q.id} className="diff" data-testid="SCR-007-QUEUE-ITEM" data-issue-type={q.issue_type}>
                  <div className="row" style={{ justifyContent: 'space-between' }}><Badge tone={q.issue_type === 'duplicate_account' ? 'high' : 'mid'}>{TYPES[q.issue_type]}</Badge><span className="caption num">유사도 {q.similarity?.toFixed(2) ?? '—'}</span></div>
                  <p style={{ margin: '8px 0' }}>&ldquo;{q.raw_name}&rdquo; ↔ <strong>{q.candidate_name}</strong></p>
                  {data.canMerge && <div className="row">
                    <Button small testId="SCR-007-EL-06" loading={busy === `merge:${q.id}`} disabled={!!busy} onClick={() => act(q.id, 'merge')}>같은 고객으로 통합</Button>
                    <Button small variant="secondary" testId="SCR-007-EL-07" disabled={!!busy} onClick={() => act(q.id, 'dismiss')}>다른 고객</Button>
                  </div>}
                </div>)}
              </div>}
          </Card>
        </div>
      </>}
      {toast && <Toast testId="SCR-007-TOAST" message={toast} onDone={clear} />}
    </>
  );
}
