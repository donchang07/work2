import { requireApiUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { body, fail, handle, ok } from '@/lib/api';
import { canAccessAccount, nowIso } from '@/lib/repo';
import { validateNote, type NoteInput } from '@/lib/notes';
import { extractNote } from '@/lib/ai';
export const POST = handle(async (req: Request) => {
  const u = await requireApiUser();
  const b = await body<NoteInput & { draftId?: number }>(req);
  const errs = validateNote(b);
  if (Object.keys(errs).length) return Response.json({ error: 'validation', fields: errs }, { status: 400 });
  const db = getDb();
  const accountId = Number(b.accountId);
  if (!canAccessAccount(db, u, accountId)) return fail(403, 'forbidden');
  const acc = db.prepare('SELECT name FROM accounts WHERE id=?').get(accountId) as { name: string };
  const r = await extractNote(b.note!.trim(), acc.name);
  if (b.draftId) db.prepare("DELETE FROM activities WHERE id=? AND author_user_id=? AND status='draft' AND confirmed_at IS NULL").run(b.draftId, u.id);
  const id = Number(db.prepare(`INSERT INTO activities(account_id, author_user_id, meeting_date, raw_note, ai_needs, ai_products, ai_competitors, ai_complaints, ai_next_step, ai_next_contact_date, ai_sentiment, ai_method, ai_confidence, status, verified, recorded_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?, 'draft', 0, ?)`).run(accountId, u.id, b.meetingDate, b.note!.trim(), r.needs, JSON.stringify(r.products), JSON.stringify(r.competitors), r.complaints, r.next_step, r.next_contact_date, r.sentiment, r.method, r.confidence, nowIso()).lastInsertRowid);
  return ok({ id, ai: { needs: r.needs, products: r.products, competitors: r.competitors, complaints: r.complaints, next_step: r.next_step, next_contact_date: r.next_contact_date, sentiment: r.sentiment }, method: r.method, confidence: r.confidence, failed: r.failed });
});
