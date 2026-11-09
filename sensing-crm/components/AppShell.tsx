'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/domain/types';
import { Badge, IconButton } from './ui';

const NAV = [
  { id: 'NAV-01', href: '/briefing', label: '오늘의 브리핑', match: '/briefing' },
  { id: 'NAV-02', href: '/leads', label: '리드 인박스', match: '/leads', badge: true },
  { id: 'NAV-03', href: '/notes', label: '미팅 노트', match: '/notes' },
  { id: 'NAV-04', href: '/accounts', label: '고객', match: '/accounts' },
  { id: 'NAV-05', href: '/risk', label: '위험 고객', match: '/risk' },
  { id: 'NAV-06', href: '/actions', label: '다음 행동', match: '/actions' },
  { id: 'NAV-07', href: '/quality', label: '데이터 품질', match: '/quality' },
];
const ADMIN_NAV = [
  { id: 'NAV-08', href: '/lab', label: '품질-성과 실험실', match: '/lab' },
  { id: 'NAV-09', href: '/admin/ops', label: '데이터 운영', match: '/admin/ops' },
];

export default function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [pending, setPending] = useState<number | null>(null);
  useEffect(() => { setOpen(false); fetch('/api/me').then(r => r.ok ? r.json() : null).then(j => j && setPending(j.pendingLeads)).catch(() => {}); }, [path]);
  const items = user.role === 'admin' ? [...NAV, ...ADMIN_NAV] : NAV;
  const link = (n: typeof NAV[number] & { badge?: boolean }, mobile = false) => (
    <Link key={n.id} href={n.href} data-testid={mobile ? `${n.id}-M` : n.id} aria-current={path.startsWith(n.match) ? 'page' : undefined}>
      <span>{n.label}</span>{n.badge && pending !== null && pending > 0 && <Badge tone="primary">{pending}</Badge>}
    </Link>);
  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.replace('/login'); router.refresh(); }
  return (
    <>
      <header className="topnav">
        <IconButton label="메뉴 열기" className="hamburger" testId="NAV-11" aria-expanded={open} onClick={() => setOpen(o => !o)}>☰</IconButton>
        <span className="brand">Sensing CRM</span>
        <span className="badge warning" data-testid="NAV-12">교육용 데모 · 합성 데이터</span>
        <span className="spacer" />
        <div style={{ position: 'relative' }}>
          <button type="button" className="btn btn-secondary btn-sm" data-testid="NAV-10" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(m => !m)}>
            {user.name} <Badge tone={user.role === 'admin' ? 'ai' : 'primary'}>{user.role === 'admin' ? '관리자' : 'KAM'}</Badge>
          </button>
          {menu && <div role="menu" className="card" style={{ position: 'absolute', right: 0, top: 44, padding: 8, minWidth: 180, zIndex: 40 }}>
            <div className="caption" style={{ padding: '6px 8px' }}>{user.email}</div>
            <button role="menuitem" type="button" className="btn btn-text" data-testid="NAV-10-LOGOUT" onClick={logout}>로그아웃</button>
          </div>}
        </div>
      </header>
      <nav className={`sheet${open ? ' open' : ''}`} aria-label="모바일 메뉴" data-testid="NAV-SHEET">{items.map(n => link(n, true))}</nav>
      <div className="shell">
        <nav className="sidenav" aria-label="주 메뉴">
          {NAV.map(n => link(n))}
          {user.role === 'admin' && <><div className="caption sep">관리자</div>{ADMIN_NAV.map(n => link(n))}</>}
        </nav>
        <main className="main" id="main">{children}</main>
      </div>
    </>
  );
}
