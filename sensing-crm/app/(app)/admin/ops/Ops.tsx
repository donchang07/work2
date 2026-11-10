'use client';
import { useCallback, useState } from 'react';
import { Badge, Button, Card, DataTable, ErrorBanner, Modal, PageHeader, Skeleton, Toast } from '@/components/ui';
import { post, useApi } from '@/components/useApi';

type Log = { id: number; job: string; started_at: string; finished_at: string | null; status: string; count: number; skipped: number; message: string; run_by_name: string };
type Data = { pendingFeed: number; convertible: number; aiStatus: string; logs: Log[] };
const JOB: Record<string, string> = { collect_signals: '신호 수집(A-1)', convert_leads: '리드 변환(A-2)', reset: '데모 초기화' };
const t = (iso: string | null) => iso ? new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(iso)) : '—';

export default function Ops() {
  const { data, error, loading, reload } = useApi<Data>('/api/ops');
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const clearToast = useCallback(() => setToast(null), []);
  async function run(job: 'collect' | 'convert' | 'reset') {
    setBusy(job); setErr(null); setConfirm(false);
    try {
      const r = await post<{ count?: number; skipped?: number }>(`/api/ops/${job}`);
      setToast(job === 'collect' ? `신호 ${r.count}건을 수집했습니다(중복 ${r.skipped}건 제외)` : job === 'convert' ? `리드 ${r.count}건을 만들었습니다` : '초기화했습니다');
      await reload();
    } catch (e) { setErr((e as Error).message); await reload(); } finally { setBusy(null); }
  }
  const aiTone = data?.aiStatus.includes('연결됨') ? 'low' : data?.aiStatus.includes('모의') ? 'ai' : undefined;
  return (
    <>
      <PageHeader title="데이터 운영" sub="A-1 신호 수집 · A-2 리드 변환 · 데모 초기화" actions={data && <Badge tone={aiTone} testId="SCR-011-EL-06">{data.aiStatus}</Badge>} />
      {(error || err) && <ErrorBanner testId="SCR-011-ERROR" message={err ?? error!} onRetry={reload} />}
      {loading && !data ? <Skeleton /> : data && <>
        <div className="tiles" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
          <Card title="신호 수집 (A-1)"><p className="caption">공시·뉴스·임상·과제 피드에서 새 신호를 가져와 고객에 연결합니다.</p>
            {data.pendingFeed === 0 && <p className="caption" data-testid="SCR-011-EMPTY-FEED">새로 수집할 신호가 없습니다</p>}
            <Button testId="SCR-011-EL-01" loading={busy === 'collect'} disabled={!!busy || data.pendingFeed === 0} onClick={() => run('collect')}>신호 수집 실행 (A-1) · 미수집 {data.pendingFeed}건</Button></Card>
          <Card title="리드 변환 (A-2)"><p className="caption">임상 승인·국가 과제 신호를 리드로 바꿉니다.</p>
            <Button testId="SCR-011-EL-02" loading={busy === 'convert'} disabled={!!busy || data.convertible === 0} onClick={() => run('convert')}>리드 변환 실행 (A-2) · 대상 {data.convertible}건</Button></Card>
          <Card title="데모 초기화"><p className="caption">모든 입력·처리 결과를 시드 상태로 되돌립니다.</p>
            <Button variant="destructive" testId="SCR-011-EL-03" loading={busy === 'reset'} disabled={!!busy} onClick={() => setConfirm(true)}>데모 데이터 초기화</Button></Card>
        </div>
        <Card title="실행 로그">
          {data.logs.length === 0 ? <p className="caption" data-testid="SCR-011-EL-05">실행 기록이 없습니다.</p> :
            <DataTable testId="SCR-011-EL-05" rowTestId="SCR-011-EL-05-ROW" rows={data.logs} rowKey={r => r.id} cols={[
              { key: 'job', header: '작업', render: r => JOB[r.job] ?? r.job },
              { key: 's', header: '시작', render: r => t(r.started_at) },
              { key: 'e', header: '종료', render: r => t(r.finished_at) },
              { key: 'st', header: '결과', render: r => <Badge tone={r.status === 'done' ? 'low' : r.status === 'failed' ? 'high' : 'primary'}>{r.status === 'done' ? '완료' : r.status === 'failed' ? '실패' : '실행 중'}</Badge> },
              { key: 'c', header: '처리 건수', align: 'r', render: r => r.count },
              { key: 'm', header: '메시지', render: r => r.message },
            ]} />}
        </Card>
      </>}
      {confirm && <Modal testId="SCR-011-EL-04" title="데모 데이터 초기화" onClose={() => setConfirm(false)} actions={<>
        <Button variant="secondary" testId="SCR-011-EL-04-CANCEL" onClick={() => setConfirm(false)}>취소</Button>
        <Button variant="destructive" testId="SCR-011-EL-04-CONFIRM" onClick={() => run('reset')}>초기화</Button></>}>
        <p>모든 입력·처리 결과가 시드 상태로 돌아갑니다. 계속할까요?</p></Modal>}
      {toast && <Toast testId="SCR-011-EL-07" message={toast} onDone={clearToast} />}
    </>
  );
}
