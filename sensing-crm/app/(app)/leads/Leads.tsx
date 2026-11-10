'use client';
import { useCallback, useState } from 'react';
import { Badge, Button, Card, DataTable, EmptyState, ErrorBanner, FieldError, PageHeader, Select, Skeleton, Tabs, Toast } from '@/components/ui';
import { post, useApi } from '@/components/useApi';

type Lead = { id: number; org_name: string; source_type: 'clinical' | 'ntis'; match_status: 'auto' | 'candidate' | 'new'; match_score: number; matched_account_name: string | null; candidates: { id: number; name: string }[]; modality: string | null; stage: string | null; budget_krw: number | null; recommended_products: string[]; confidence: number; status: string; reject_reason: string | null; assignee_user_id: number; assignee_name: string };
type Data = { counts: { pending: number; accepted: number; rejected: number }; leads: Lead[]; kams: { id: number; name: string; role: string }[] };
const MATCH: Record<string, { label: string; tone: 'low' | 'mid' | 'primary' }> = { auto: { label: '자동', tone: 'low' }, candidate: { label: '후보', tone: 'mid' }, new: { label: '신규', tone: 'primary' } };

export default function Leads() {
  const [tab, setTab] = useState('pending');
  const { data, error, loading, reload } = useApi<Data>(`/api/leads?status=${tab}`);
  const [pick, setPick] = useState<Record<number, string>>({});
  const [rejecting, setRejecting] = useState<Record<number, string>>({});
  const [rowErr, setRowErr] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [actErr, setActErr] = useState<string | null>(null);
  const clear = useCallback(() => setToast(null), []);
  const isAdmin = (data?.kams.length ?? 0) > 0;

  async function act(l: Lead, action: 'accept' | 'reject') {
    setRowErr(e => ({ ...e, [l.id]: '' })); setActErr(null);
    if (action === 'accept' && l.match_status !== 'auto' && !pick[l.id]) { setRowErr(e => ({ ...e, [l.id]: '매칭할 고객을 선택하세요' })); return; }
    if (action === 'reject') {
      if (rejecting[l.id] === undefined) { setRejecting(r => ({ ...r, [l.id]: '' })); return; }
      if (!rejecting[l.id]) { setRowErr(e => ({ ...e, [l.id]: '거절 사유를 선택하세요' })); return; }
    }
    setBusy(l.id);
    try {
      await post(`/api/leads/${l.id}`, action === 'accept' ? { action, accountId: pick[l.id] === 'new' ? 'new' : pick[l.id] ? Number(pick[l.id]) : undefined } : { action, reason: rejecting[l.id] });
      setToast(action === 'accept' ? '리드를 수락했습니다' : '리드를 거절했습니다');
      await reload();
    } catch (e) { setActErr((e as Error).message); } finally { setBusy(null); }
  }
  async function assign(l: Lead, userId: string) {
    try { await post(`/api/leads/${l.id}`, { action: 'assign', userId: Number(userId) }); setToast('담당자를 변경했습니다'); await reload(); } catch (e) { setActErr((e as Error).message); }
  }
  const won = (n: number | null) => n ? `${(n / 1e8).toFixed(0)}억 원` : '—';
  return (
    <>
      <PageHeader title="리드 인박스" sub="임상시험 승인·국가 연구과제에서 만든 잠재 수요 리드 (A-2)" />
      {(error || actErr) && <ErrorBanner testId="SCR-003-ERROR" message={actErr ?? error!} onRetry={reload} />}
      <Tabs testId="SCR-003-EL-01" value={tab} onChange={v => { setTab(v); setRejecting({}); setRowErr({}); }} tabs={[
        { value: 'pending', label: '검토 대기', count: data?.counts.pending }, { value: 'accepted', label: '수락' }, { value: 'rejected', label: '거절' }]} />
      {loading && !data ? <Skeleton /> : data && (data.leads.length === 0 ? <Card><EmptyState testId="SCR-003-EL-09" message="검토할 리드가 없습니다." /></Card> :
        <Card style={{ padding: 8 }}>
          <DataTable testId="SCR-003-EL-02" rowTestId="SCR-003-ROW" rows={data.leads} rowKey={l => l.id} cols={[
            { key: 'src', header: '출처', render: l => <Badge tone={l.source_type === 'clinical' ? 'ai' : 'primary'}>{l.source_type === 'clinical' ? '식약처 임상' : '국가 과제'}</Badge> },
            { key: 'org', header: '기관명', render: l => <strong>{l.org_name}</strong> },
            { key: 'm', header: '매칭 고객', render: l => <div className="stack" style={{ gap: 6 }} data-match-status={l.match_status}>
              <div className="row"><Badge tone={MATCH[l.match_status].tone}>{MATCH[l.match_status].label}</Badge><span>{l.matched_account_name ?? (l.match_status === 'new' ? '신규 기관' : `유사도 ${l.match_score.toFixed(2)}`)}</span></div>
              {tab === 'pending' && l.match_status !== 'auto' && <Select hideLabel label={`${l.org_name} 매칭 고객`} testId="SCR-003-EL-06" value={pick[l.id] ?? ''} onChange={v => setPick(p => ({ ...p, [l.id]: v }))} placeholder="고객 선택" options={[...l.candidates.map(c => ({ value: String(c.id), label: c.name })), { value: 'new', label: '신규 고객으로 등록' }]} />}
            </div> },
            { key: 'mod', header: '모달리티', render: l => l.modality ?? '—' },
            { key: 'st', header: '단계', render: l => l.stage ?? '—' },
            { key: 'b', header: '예산 규모', align: 'r', render: l => won(l.budget_krw) },
            { key: 'p', header: '추천 제품군', render: l => <div className="row" style={{ gap: 4 }}>{l.recommended_products.map(p => <span key={p} className="tag">{p}</span>)}</div> },
            { key: 'c', header: '신뢰도', align: 'r', render: l => `${Math.round(l.confidence * 100)}%` },
            ...(isAdmin ? [{ key: 'as', header: '담당자', render: (l: Lead) => <Select hideLabel label={`${l.org_name} 담당자`} testId="SCR-003-EL-07" value={String(l.assignee_user_id)} onChange={v => assign(l, v)} options={data.kams.map(k => ({ value: String(k.id), label: k.name }))} /> }] : []),
            { key: 'act', header: tab === 'rejected' ? '거절 사유' : '', render: l => tab === 'rejected' ? l.reject_reason : tab === 'accepted' ? <Badge tone="low">수락됨</Badge> :
              <div className="stack" style={{ gap: 6, minWidth: 170 }}>
                <div className="row" style={{ flexWrap: 'nowrap' }}>
                  <Button small testId="SCR-003-EL-03" loading={busy === l.id} onClick={() => act(l, 'accept')}>수락</Button>
                  <Button small variant="secondary" testId="SCR-003-EL-04" disabled={busy === l.id} onClick={() => act(l, 'reject')}>거절</Button>
                </div>
                {rejecting[l.id] !== undefined && <Select hideLabel label={`${l.org_name} 거절 사유`} testId="SCR-003-EL-05" value={rejecting[l.id]} onChange={v => setRejecting(r => ({ ...r, [l.id]: v }))} placeholder="거절 사유 선택" options={['중복', '사업 범위 밖', '정보 부족'].map(x => ({ value: x, label: x }))} />}
                {rowErr[l.id] && <FieldError testId="SCR-003-EL-10" message={rowErr[l.id]} />}
              </div> },
          ]} />
        </Card>)}
      {toast && <Toast testId="SCR-003-EL-08" message={toast} onDone={clear} />}
    </>
  );
}
