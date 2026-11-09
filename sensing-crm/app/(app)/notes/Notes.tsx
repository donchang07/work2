'use client';
import { useCallback, useMemo, useState } from 'react';
import { Badge, Button, Card, DataTable, DateField, DiffField, ErrorBanner, Modal, PageHeader, Select, Skeleton, TextArea, Toast } from '@/components/ui';
import { post, useApi } from '@/components/useApi';

type Recent = { id: number; meeting_date: string; account_name: string; needs: string | null; ai_needs: string | null; status: 'draft' | 'confirmed'; corrected_field_count: number; confirmed_at: string | null };
type Data = { accounts: { id: number; name: string }[]; recent: Recent[]; today: string };
type Ai = { needs: string | null; products: string[]; competitors: string[]; complaints: string | null; next_step: string | null; next_contact_date: string | null; sentiment: string };
type Form = { needs: string; products: string; competitors: string; complaints: string; next_step: string; next_contact_date: string; sentiment: string };
const toForm = (a: Ai): Form => ({ needs: a.needs ?? '', products: a.products.join(', '), competitors: a.competitors.join(', '), complaints: a.complaints ?? '', next_step: a.next_step ?? '', next_contact_date: a.next_contact_date ?? '', sentiment: a.sentiment ?? '' });
const list = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean);

export default function Notes({ initialAccount }: { initialAccount: string }) {
  const { data, error, loading, reload } = useApi<Data>('/api/notes');
  const [accountId, setAccountId] = useState(initialAccount);
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ id: number; ai: Ai; method: string; failed: boolean } | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [sysErr, setSysErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const clear = useCallback(() => setToast(null), []);

  const errs = useMemo(() => {
    const e: Record<string, string> = {};
    if (!accountId) e.account = '고객을 선택하세요';
    if (!date) e.date = '미팅일을 입력하세요'; else if (data && date > data.today) e.date = '미래 날짜는 입력할 수 없습니다';
    if (note.trim().length < 10) e.note = '메모는 10자 이상 입력하세요'; else if (note.trim().length > 4000) e.note = '메모는 4,000자 이하로 입력하세요';
    return e;
  }, [accountId, date, note, data]);
  const valid = Object.keys(errs).length === 0;
  const show = (k: string) => (touched ? errs[k] : undefined);
  const touch = <T,>(fn: (v: T) => void) => (v: T) => { setTouched(true); fn(v); };

  async function structure() {
    setBusy('structure'); setSysErr(null);
    try {
      const r = await post<{ id: number; ai: Ai; method: string; failed: boolean }>('/api/notes/structure', { accountId: Number(accountId), meetingDate: date, note, draftId: draft?.id });
      setDraft(r); setForm(toForm(r.ai)); setFormErr({});
    } catch (e) { setSysErr((e as Error).message); } finally { setBusy(null); }
  }
  function reset() { setAccountId(''); setDate(''); setNote(''); setTouched(false); setDraft(null); setForm(null); setFormErr({}); }
  async function save() {
    if (!draft || !form) return;
    const fe: Record<string, string> = {};
    if (!form.needs.trim()) fe.needs = '필수 항목입니다';
    if (!form.next_step.trim()) fe.next_step = '필수 항목입니다';
    if (!form.sentiment) fe.sentiment = '필수 항목입니다';
    setFormErr(fe); if (Object.keys(fe).length) return;
    setBusy('save'); setSysErr(null);
    try {
      await post(`/api/notes/${draft.id}/confirm`, { ...form, products: list(form.products), competitors: list(form.competitors) });
      setToast('활동을 확정 저장했습니다'); reset(); await reload();
    } catch { setSysErr('저장하지 못했습니다. 잠시 후 다시 시도하세요.'); } finally { setBusy(null); }
  }
  async function discard() {
    setConfirmCancel(false);
    if (draft) await post(`/api/notes/${draft.id}/discard`).catch(() => {});
    reset(); await reload();
  }
  async function unconfirm(id: number) {
    try { await post(`/api/notes/${id}/unconfirm`); setToast('확정을 취소했습니다'); await reload(); } catch (e) { setSysErr((e as Error).message); }
  }
  const hasInput = !!(accountId || date || note || draft);
  const within24h = (r: Recent) => r.status === 'confirmed' && r.confirmed_at && Date.now() - Date.parse(r.confirmed_at) < 24 * 3600 * 1000;
  const set = (k: keyof Form) => (v: string) => setForm(f => f && { ...f, [k]: v });

  return (
    <>
      <PageHeader title="미팅 노트" sub="메모를 붙여 넣으면 AI가 구조화하고, 확인 후 확정 저장합니다 (A-5)" />
      {(error || sysErr) && <ErrorBanner testId="SCR-004-ERROR" message={sysErr ?? error!} onRetry={sysErr ? undefined : reload} />}
      {loading && !data ? <Skeleton /> : data && <>
        <div className="two">
          <Card title="메모 입력">
            <div className="stack">
              <Select label="고객" testId="SCR-004-EL-01" value={accountId} onChange={touch(setAccountId)} placeholder="고객 선택" options={data.accounts.map(a => ({ value: String(a.id), label: a.name }))} error={show('account')} errorTestId="SCR-004-EL-13" disabled={!!draft} />
              <DateField label="미팅일" testId="SCR-004-EL-02" value={date} max={data.today} onChange={touch(setDate)} error={show('date')} errorTestId="SCR-004-EL-13" disabled={!!draft} />
              <TextArea label="미팅 메모" testId="SCR-004-EL-03" value={note} onChange={touch(setNote)} error={show('note')} errorTestId="SCR-004-EL-13" maxLength={4000}
                placeholder="예: 공정개발팀 김 팀장 미팅, 신규 라인 배지 검토…" />
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="caption num">{note.trim().length.toLocaleString()} / 4,000자</span>
                <div className="row">
                  {hasInput && <Button variant="secondary" testId="SCR-004-EL-08" onClick={() => setConfirmCancel(true)}>취소</Button>}
                  <Button testId="SCR-004-EL-04" disabled={!valid} loading={busy === 'structure'} onClick={structure}>AI로 구조화</Button>
                </div>
              </div>
            </div>
          </Card>
          <Card title={<span className="row" style={{ justifyContent: 'space-between' }}><span>구조화 결과</span>{draft && <Badge tone={draft.method === 'claude' ? 'ai' : undefined} testId="SCR-004-EL-05">{draft.method === 'claude' ? '추출: Claude' : '추출: 규칙 기반'}</Badge>}</span>}>
            {draft?.failed && <ErrorBanner tone="warning" testId="SCR-004-EL-11" message="AI 구조화에 실패해 규칙 기반 결과로 대체했습니다. 내용을 확인해 주세요." />}
            {busy === 'structure' ? <Skeleton height={56} count={4} /> : !form ? <p className="muted" data-testid="SCR-004-RESULT-EMPTY">메모를 입력하고 AI로 구조화하세요</p> : (
              <div className="stack" style={{ gap: 12 }}>
                <DiffField testId="SCR-004-EL-06" label="니즈" required aiValue={draft!.ai.needs ?? ''} value={form.needs} onChange={set('needs')} error={formErr.needs} />
                <DiffField testId="SCR-004-EL-06" label="관심 제품군" aiValue={draft!.ai.products.join(', ')} value={form.products} onChange={set('products')} />
                <DiffField testId="SCR-004-EL-06" label="경쟁사 언급" aiValue={draft!.ai.competitors.join(', ')} value={form.competitors} onChange={set('competitors')} />
                <DiffField testId="SCR-004-EL-06" label="불만" aiValue={draft!.ai.complaints ?? ''} value={form.complaints} onChange={set('complaints')} />
                <DiffField testId="SCR-004-EL-06" label="다음 단계" required aiValue={draft!.ai.next_step ?? ''} value={form.next_step} onChange={set('next_step')} error={formErr.next_step} />
                <DiffField testId="SCR-004-EL-06" label="다음 접촉 예정일" type="date" aiValue={draft!.ai.next_contact_date ?? ''} value={form.next_contact_date} onChange={set('next_contact_date')} />
                <DiffField testId="SCR-004-EL-06" label="고객 반응" required type="select" options={['긍정', '중립', '부정']} aiValue={draft!.ai.sentiment ?? ''} value={form.sentiment} onChange={set('sentiment')} error={formErr.sentiment} />
                {Object.keys(formErr).length > 0 && <span className="field-error" data-testid="SCR-004-EL-13">필수 항목입니다</span>}
                <div className="row" style={{ justifyContent: 'flex-end' }}><Button testId="SCR-004-EL-07" loading={busy === 'save'} onClick={save}>확정 저장</Button></div>
              </div>)}
          </Card>
        </div>
        <Card title="최근 기록" style={{ marginTop: 24 }}>
          {data.recent.length === 0 ? <p className="muted" data-testid="SCR-004-EL-09">아직 기록이 없습니다.</p> :
            <DataTable testId="SCR-004-EL-09" rowTestId="SCR-004-EL-09-ROW" rows={data.recent} rowKey={r => r.id} cols={[
              { key: 'd', header: '미팅일', render: r => <span className="num">{r.meeting_date}</span> },
              { key: 'a', header: '고객', render: r => r.account_name },
              { key: 'n', header: '니즈 요약', render: r => (r.needs ?? r.ai_needs ?? '—').slice(0, 40) },
              { key: 's', header: '상태', render: r => <Badge tone={r.status === 'confirmed' ? 'low' : 'mid'}>{r.status === 'confirmed' ? '확정' : '초안'}</Badge> },
              { key: 'c', header: '수정 필드 수', align: 'r', render: r => <span data-testid="SCR-004-CORRECTED">{r.corrected_field_count}</span> },
              { key: 'x', header: '', render: r => within24h(r) ? <Button variant="text" small testId="SCR-004-EL-10" onClick={() => unconfirm(r.id)}>확정 취소</Button> : null },
            ]} />}
        </Card>
      </>}
      {confirmCancel && <Modal testId="SCR-004-EL-12" title="작성 취소" onClose={() => setConfirmCancel(false)} actions={<>
        <Button variant="secondary" testId="SCR-004-EL-12-KEEP" onClick={() => setConfirmCancel(false)}>계속 작성</Button>
        <Button variant="destructive" testId="SCR-004-EL-12-DISCARD" onClick={discard}>버리기</Button></>}>
        <p>작성 중인 내용을 버릴까요?</p></Modal>}
      {toast && <Toast testId="SCR-004-EL-14" message={toast} onDone={clear} />}
    </>
  );
}
