import Link from 'next/link';
import { EmptyState } from '@/components/ui';
export default function Forbidden() {
  return <div className="login-wrap"><div className="card" style={{ width: 440 }}>
    <EmptyState icon="🔒" testId="SCR-012-EL-01" message="이 화면을 볼 권한이 없습니다." action={<Link className="btn btn-primary" href="/briefing" data-testid="SCR-012-EL-02">오늘의 브리핑으로</Link>} />
  </div></div>;
}
