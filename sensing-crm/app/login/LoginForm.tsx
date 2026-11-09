'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button, Card, ErrorBanner, PasswordField, TextField } from '@/components/ui';

export default function LoginForm() {
  const sp = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [errs, setErrs] = useState<{ email?: string; pw?: string }>({});
  const [authFail, setAuthFail] = useState(false);
  const [sysErr, setSysErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const expired = sp.get('reason') === 'expired';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v: typeof errs = {};
    if (!email.trim()) v.email = '이메일을 입력하세요';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) v.email = '올바른 이메일 형식이 아닙니다';
    if (!pw) v.pw = '비밀번호를 입력하세요';
    setErrs(v); setAuthFail(false); setSysErr(false);
    if (Object.keys(v).length) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: pw }) });
      if (res.status === 401) { setAuthFail(true); return; }
      if (!res.ok) { setSysErr(true); return; }
      const next = sp.get('next');
      router.replace(next && next.startsWith('/') && !next.startsWith('//') ? next : '/briefing');
      router.refresh();
    } catch { setSysErr(true); } finally { setLoading(false); }
  }
  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit} noValidate>
        <Card>
          <div className="stack">
            <div><div className="brand" style={{ fontSize: 24 }}>Sensing CRM</div><span className="badge warning" style={{ marginTop: 8 }}>교육용 데모 · 합성 데이터</span></div>
            {expired && <ErrorBanner tone="info" testId="SCR-001-EL-06" message="세션이 만료되었습니다. 다시 로그인해 주세요." />}
            {authFail && <ErrorBanner testId="SCR-001-EL-04" message="이메일 또는 비밀번호가 올바르지 않습니다." />}
            {sysErr && <ErrorBanner testId="SCR-001-ERROR" message="일시적인 오류입니다. 잠시 후 다시 시도하세요." />}
            <TextField label="이메일" type="email" autoComplete="username" value={email} onChange={setEmail} testId="SCR-001-EL-01" error={errs.email} errorTestId="SCR-001-EL-07" />
            <PasswordField label="비밀번호" autoComplete="current-password" value={pw} onChange={setPw} testId="SCR-001-EL-02" error={errs.pw} errorTestId="SCR-001-EL-07" />
            <Button type="submit" testId="SCR-001-EL-03" loading={loading}>로그인</Button>
            <p className="caption" data-testid="SCR-001-EL-05" style={{ margin: 0 }}>실습 계정은 강사 안내 자료를 확인하세요.</p>
          </div>
        </Card>
      </form>
    </div>
  );
}
