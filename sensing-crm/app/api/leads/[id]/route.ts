import { requireApiUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { body, fail, handle, ok } from '@/lib/api';
import { nowIso, refreshDerived } from '@/lib/repo';
import { normalizeName } from '@/lib/domain/names';

const REASONS = ['중복', '사업 범위 밖', '정보 부족'];
export const POST = handle(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireApiUser();
  const id = Number((await ctx.params).id);
  const db = getDb();
  const lead = db.prepare('SELECT l.*, s.source_type FROM leads l JOIN signals s ON s.id=l.signal_id WHERE l.id=?').get(id) as { id: number; status: string; assignee_user_id: number; match_status: string; matched_account_id: number | null; candidate_ids: string; org_name: string; source_type: string; modality: string | null } | undefined;
  if (!lead) return fail(404, 'not_found');
  if (u.role !== 'admin' && lead.assignee_user_id !== u.id) return fail(403, 'forbidden');
  const b = await body<{ action: string; accountId?: number | 'new'; reason?: string; userId?: number }>(req);
  if (b.action === 'assign') {
    if (u.role !== 'admin') return fail(403, 'forbidden');
    if (!db.prepare('SELECT 1 FROM users WHERE id=?').get(b.userId)) return fail(400, 'bad_user');
    db.prepare('UPDATE leads SET assignee_user_id=? WHERE id=?').run(b.userId, id);
    return ok({ ok: true });
  }
  if (lead.status !== 'pending') return fail(409, 'already_decided');
  if (b.action === 'reject') {
    if (!b.reason || !REASONS.includes(b.reason)) return fail(400, 'need_reason', '거절 사유를 선택하세요');
    db.prepare("UPDATE leads SET status='rejected', reject_reason=?, decided_by=?, decided_at=? WHERE id=?").run(b.reason, u.id, nowIso(), id);
    return ok({ ok: true });
  }
  if (b.action === 'accept') {
    let accountId = lead.match_status === 'auto' && lead.matched_account_id ? lead.matched_account_id : null;
    if (b.accountId === 'new') {
      const seg = lead.modality === '소재·배터리' ? '반도체·배터리' : lead.source_type === 'ntis' ? '대학·연구소' : '바이오텍';
      accountId = Number(db.prepare("INSERT INTO accounts(name, segment, owner_user_id, status) VALUES (?,?,?, 'active')").run(lead.org_name, seg, u.id).lastInsertRowid);
    } else if (typeof b.accountId === 'number') {
      const acc = db.prepare("SELECT owner_user_id FROM accounts WHERE id=? AND status='active'").get(b.accountId) as { owner_user_id: number } | undefined;
      if (!acc) return fail(400, 'bad_account');
      accountId = b.accountId;
      if (normalizeName(lead.org_name)) db.prepare('INSERT OR IGNORE INTO account_aliases(account_id, alias, alias_norm) VALUES (?,?,?)').run(accountId, lead.org_name, normalizeName(lead.org_name));
    }
    if (!accountId) return fail(400, 'need_account', '매칭할 고객을 선택하세요');
    db.prepare("UPDATE leads SET status='accepted', matched_account_id=?, decided_by=?, decided_at=? WHERE id=?").run(accountId, u.id, nowIso(), id);
    db.prepare('UPDATE signals SET account_id=? WHERE id=(SELECT signal_id FROM leads WHERE id=?)').run(accountId, id);
    await refreshDerived(db);
    return ok({ ok: true, accountId });
  }
  return fail(400, 'bad_action');
});
