'use client';
import { useState } from 'react';
import { Badge, Button, Card, DataTable, EmptyState, ErrorBanner, PageHeader, Skeleton } from '@/components/ui';
import { LineChart } from '@/components/charts';
import { post, useApi } from '@/components/useApi';

type P = { ratio: number; quality: number; recall: number; precision: number; nba_hit: number; highCount: number; tp: number; churners: number };
type Run = { id: number; run_at: string; run_by_name: string; seed: number; status: string; results: P[] | null };
const METRICS: [keyof P, string][] = [['quality', '종합 품질'], ['recall', '이탈 탐지 재현율'], ['precision', '정밀도'], ['nba_hit', '추천 적중률']];
const pct = (r: number) => `${Math.round(r * 100)}%`;
const t = (iso: string) => new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(iso));

export default function Lab() {
  const { data, error, loading, reload } = useApi<{ runs: Run[]; latest: Run | null }>('/api/lab');
  const [busy, setBusy] = useState(false);
  const [runErr, setRunErr] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  async function run() {
    setBusy(true); setRunErr(false);
    try { const r = await post<{ id: number }>('/api/lab/run'); setSelected(r.id); await reload(); } catch { setRunErr(true); await reload().catch(() => {}); } finally { setBusy(false); }
  }
  const shown = data ? (data.runs.find(r => r.id === selected && r.status === 'done') ?? data.latest) : null;
  const res = shown?.results ?? null;
  const first = res?.[0], last = res?.[res.length - 1];
  return (
    <>
      <PageHeader title="품질-성과 실험실" sub="같은 정답 데이터에서 자동화 비율만 바꿔 예측·추천 성과를 비교합니다" actions={<Button testId="SCR-010-EL-02" loading={busy} onClick={run}>{busy ? '5개 데이터셋 평가 중' : '실험 실행'}</Button>} />
      {(runErr) && <ErrorBanner testId="SCR-010-EL-07" message="실험을 실행하지 못했습니다. 다시 시도하세요." onRetry={run} />}
      {error && <ErrorBanner testId="SCR-010-ERROR" message={error} onRetry={reload} />}
      <Card testId="SCR-010-EL-01" style={{ marginBottom: 24 }}>
        <p style={{ margin: 0 }}>실험 설명: 정답 이탈 고객 6곳이 심어진 고객 30곳 데이터를, 수기 입력 수준(0%)부터 완전 자동화(100%)까지 5단계 품질로 다시 생성해 같은 규칙으로 평가합니다.</p>
        <p className="caption" style={{ margin: '8px 0 0' }}>열화: 필수 항목 누락 35%→5%, 경쟁사 언급 누락 50%→5%, 기록 지연 40%→5%, 고객명 미해소 30%→5%, 중복 고객 10%→1%, 확정 검토 누락 60%→10% (시드 42). 운영 데이터는 바뀌지 않습니다.</p>
      </Card>
      {loading && !data ? <Skeleton /> : !res ? <Card><EmptyState testId="SCR-010-EL-08" message="아직 실험 결과가 없습니다. [실험 실행]을 눌러 시작하세요." /></Card> : <>
        <Card testId="SCR-010-EL-05" className="callout" style={{ marginBottom: 24 }}>
          <strong style={{ fontSize: 18 }}>자동화 100%의 이탈 탐지 재현율 {pct(last!.recall)} vs 0%의 {pct(first!.recall)} (차이 {Math.round((last!.recall - first!.recall) * 100)}%p)</strong>
          <p className="caption" style={{ margin: '6px 0 0' }}>같은 규칙, 같은 정답. 달라진 것은 CRM 데이터 품질({pct(first!.quality)} → {pct(last!.quality)})뿐입니다. 고위험으로 잡힌 정답 이탈 고객: {first!.tp}곳 → {last!.tp}곳 / {last!.churners}곳.</p>
        </Card>
        <div className="two">
          <Card title="자동화 비율별 성과">
            <div className="table-wrap"><table className="dt" data-testid="SCR-010-EL-03">
              <thead><tr><th>지표</th>{res.map(p => <th key={p.ratio} className="r" data-ratio={p.ratio}>자동화 {Math.round(p.ratio * 100)}%</th>)}</tr></thead>
              <tbody>{METRICS.map(([k, l]) => <tr key={k} data-metric={k}><td>{l}</td>{res.map(p => <td key={p.ratio} className="r">{pct(p[k] as number)}</td>)}</tr>)}</tbody>
            </table></div>
          </Card>
          <Card title="품질과 성과의 관계">
            <LineChart testId="SCR-010-EL-04" label="자동화 비율별 품질과 예측·추천 성과" yDomain={[0, 100]} xKey="r" data={res.map(p => ({ r: `${Math.round(p.ratio * 100)}%`, '종합 품질': Math.round(p.quality * 100), '재현율': Math.round(p.recall * 100), '정밀도': Math.round(p.precision * 100), '추천 적중률': Math.round(p.nba_hit * 100) }))}
              series={['종합 품질', '재현율', '정밀도', '추천 적중률'].map(k => ({ key: k, label: k }))} height={280} />
          </Card>
        </div>
      </>}
      {data && data.runs.length > 0 && <Card title="실행 이력" style={{ marginTop: 24 }}>
        <DataTable testId="SCR-010-EL-06" rowTestId="SCR-010-EL-06-ROW" rows={data.runs} rowKey={r => r.id} onRowClick={r => r.status === 'done' && setSelected(r.id)} cols={[
          { key: 't', header: '실행 시각', render: r => <span className="num">{t(r.run_at)}</span> },
          { key: 'u', header: '실행자', render: r => r.run_by_name },
          { key: 's', header: '시드', align: 'r', render: r => r.seed },
          { key: 'st', header: '상태', render: r => <Badge tone={r.status === 'done' ? 'low' : r.status === 'failed' ? 'high' : 'primary'}>{r.status === 'done' ? '완료' : r.status === 'failed' ? '실패' : '실행 중'}</Badge> },
          { key: 'v', header: '', render: r => shown?.id === r.id ? <Badge tone="primary">표시 중</Badge> : null },
        ]} />
      </Card>}
    </>
  );
}
