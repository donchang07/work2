'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Badge, Button, Card, DataTable, EmptyState, ErrorBanner, gradeTone, Modal, PageHeader, ScoreBar, SegmentedControl, Skeleton, Tag, Toast } from '@/components/ui';
import { post, useApi } from '@/components/useApi';

type F = { key: string; label: string; raw: number; rawText: string; normalized: number; weight: number; contribution: number };
type Item = { account_id: number; name: string; score: number; grade: string; computed_at: string; factors: F[]; top: F[]; quality: number };
type Data = { items: Item[]; counts: Record<string, number> };
const t = (iso: string) => new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

export default function Risk() {
  const [grade, setGrade] = useState('');
  const { data, error, loading, reload } = useApi<Data>(`/api/risk${grade ? `?grade=${encodeURIComponent(grade)}` : ''}`);
  const [modal, setModal] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [actErr, setActErr] = useState<string | null>(null);
  const router = useRouter();
  const clear = useCallback(() => setToast(null), []);
  async function recompute() {
    setBusy(true); setActErr(null);
    try { await post('/api/risk/recompute'); setToast('점수를 다시 계산했습니다'); await reload(); } catch (e) { setActErr((e as Error).message); } finally { setBusy(false); }
  }
  const warn = (i: Item) => i.quality < 0.7 && <Badge tone="warning" testId="SCR-008-EL-05" title="입력 데이터가 부족해 점수가 낮게 나올 수 있습니다">데이터 품질 경고</Badge>;
  return (
    <>
      <PageHeader title="위험 고객" sub="이탈위험 점수(P-2) — 주문 감소·접촉 공백·경쟁사 언급·불만·위협 신호의 가중 합" actions={<Button variant="secondary" testId="SCR-008-EL-06" loading={busy} onClick={recompute}>점수 재계산</Button>} />
      {(error || actErr) && <ErrorBanner testId="SCR-008-ERROR" message={actErr ?? error!} onRetry={reload} />}
      <div style={{ marginBottom: 16 }}>
        <SegmentedControl label="등급 필터" testId="SCR-008-EL-02" value={grade} onChange={setGrade} options={[{ value: '', label: '전체' }, { value: '고', label: `고${data ? ` ${data.counts['고']}` : ''}` }, { value: '중', label: `중${data ? ` ${data.counts['중']}` : ''}` }, { value: '저', label: `저${data ? ` ${data.counts['저']}` : ''}` }]} />
      </div>
      {loading && !data ? <Skeleton /> : data && (data.items.length === 0 ? <Card><EmptyState testId="SCR-008-EL-07" message="해당 등급의 고객이 없습니다." /></Card> :
        <Card style={{ padding: 8 }}>
          <DataTable testId="SCR-008-EL-01" rowTestId="SCR-008-ROW" rows={data.items} rowKey={i => i.account_id} onRowClick={i => router.push(`/accounts/${i.account_id}`)}
            mobile={i => <div className="stack" style={{ gap: 8 }}><div className="row" style={{ justifyContent: 'space-between' }}><strong>{i.name}</strong><Badge tone={gradeTone(i.grade)}>{i.grade}</Badge></div><ScoreBar score={i.score} />{warn(i)}</div>}
            cols={[
              { key: 'n', header: '고객', render: i => <div className="row"><strong>{i.name}</strong>{warn(i)}</div> },
              { key: 's', header: '점수', render: i => <ScoreBar score={i.score} /> },
              { key: 'g', header: '등급', render: i => <span data-grade={i.grade}><Badge tone={gradeTone(i.grade)}>{i.grade}</Badge></span> },
              { key: 'r', header: '근거', render: i => <div className="row" style={{ gap: 4 }}>{i.top.map(f => <Tag key={f.key}>{f.label} {f.rawText}</Tag>)}</div> },
              { key: 'm', header: '', render: i => <Button variant="text" small testId="SCR-008-EL-03" onClick={e => { e.stopPropagation(); setModal(i); }}>근거 보기</Button> },
              { key: 't', header: '산출 시각', render: i => <span className="caption">{t(i.computed_at)}</span> },
            ]} />
        </Card>)}
      {modal && <Modal testId="SCR-008-EL-04" title={`${modal.name} — 이탈위험 ${modal.score}점 (${modal.grade})`} onClose={() => setModal(null)} actions={<Button testId="SCR-008-EL-04-CLOSE" onClick={() => setModal(null)}>닫기</Button>}>
        <table className="dt"><thead><tr><th>요인</th><th className="r">원값</th><th className="r">정규화</th><th className="r">가중치</th><th className="r">기여</th></tr></thead>
          <tbody>{modal.factors.map(f => <tr key={f.key} data-testid="SCR-008-FACTOR"><td>{f.label}</td><td className="r">{f.rawText}</td><td className="r">{f.normalized.toFixed(2)}</td><td className="r">{f.weight}</td><td className="r">{f.contribution}</td></tr>)}</tbody></table>
        <p className="caption" style={{ marginTop: 12 }}>점수 = Σ(정규화 값 × 가중치). 주문 감소는 50% 감소에서, 접촉 공백은 90일에서, 경쟁사 언급은 3회에서, 불만·부정은 2건에서, 위협 신호는 2건에서 최대(1.0)가 됩니다. 확정된 활동만 반영합니다. 등급: 고 ≥ 60, 중 35~59, 저 &lt; 35.</p>
      </Modal>}
      {toast && <Toast testId="SCR-008-TOAST" message={toast} onDone={clear} />}
    </>
  );
}
