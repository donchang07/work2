import { requireApiUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { body, fail, handle, ok } from '@/lib/api';
import { nowIso, refreshDerived, rowToActivity } from '@/lib/repo';
type F = { needs?: string; products?: string[]; competitors?: string[]; complaints?: string; next_step?: string; next_contact_date?: string; sentiment?: string };
const s = (v?: string | null) => (v ?? '').trim() || null;
const arr = (v?: string[] | null) => JSON.stringify([...(v ?? [])].map(x => x.trim()).filter(Boolean).sort());
export const POST = handle(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireApiUser();
  const id = Number((await ctx.params).id);
  const db = getDb();
  const row = db.prepare('SELECT * FROM activities WHERE id=?').get(id) as Record<string, unknown> | undefined;
  if (!row) return fail(404, 'not_found');
  if (row.author_user_id !== u.id) return fail(403, 'forbidden');
  const a = rowToActivity(row);
  const f = await body<F>(req);
  const errs: Record<string, string> = {};
  if (!s(f.needs)) errs.needs = '필수 항목입니다';
  if (!s(f.next_step)) errs.next_step = '필수 항목입니다';
  if (!['긍정', '중립', '부정'].includes(f.sentiment ?? '')) errs.sentiment = '필수 항목입니다';
  if (f.next_contact_date && !/^\d{4}-\d{2}-\d{2}$/.test(f.next_contact_date)) errs.next_contact_date = '날짜 형식이 올바르지 않습니다';
  if (Object.keys(errs).length) return Response.json({ error: 'validation', fields: errs }, { status: 400 });
  const pairs: [string | null, string | null][] = [
    [s(a.ai_needs), s(f.needs)], [arr(a.ai_products), arr(f.products)], [arr(a.ai_competitors), arr(f.competitors)], [s(a.ai_complaints), s(f.complaints)],
    [s(a.ai_next_step), s(f.next_step)], [s(a.ai_next_contact_date), s(f.next_contact_date)], [s(a.ai_sentiment), s(f.sentiment)],
  ];
  const corrected = a.ai_method ? pairs.filter(([x, y]) => x !== y).length : 0;
  db.prepare(`UPDATE activities SET needs=?, products=?, competitors=?, complaints=?, next_step=?, next_contact_date=?, sentiment=?, status='confirmed', corrected_field_count=?, verified=1, confirmed_at=? WHERE id=?`)
    .run(s(f.needs), JSON.stringify(f.products ?? []), JSON.stringify(f.competitors ?? []), s(f.complaints), s(f.next_step), s(f.next_contact_date), f.sentiment, corrected, nowIso(), id);
  await refreshDerived(db);
  return ok({ ok: true, corrected });
});
