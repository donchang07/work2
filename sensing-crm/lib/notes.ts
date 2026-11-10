import { seoulDate, now } from './time';
export interface NoteInput { accountId?: number | string; meetingDate?: string; note?: string }
export function validateNote(i: NoteInput): Record<string, string> {
  const e: Record<string, string> = {};
  if (!i.accountId) e.accountId = '고객을 선택하세요';
  if (!i.meetingDate) e.meetingDate = '미팅일을 입력하세요';
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(i.meetingDate)) e.meetingDate = '날짜 형식이 올바르지 않습니다';
  else if (i.meetingDate > seoulDate(now())) e.meetingDate = '미래 날짜는 입력할 수 없습니다';
  const n = (i.note ?? '').trim().length;
  if (n < 10) e.note = '메모는 10자 이상 입력하세요';
  else if (n > 4000) e.note = '메모는 4,000자 이하로 입력하세요';
  return e;
}
export const NOTE_FIELDS = ['needs', 'products', 'competitors', 'complaints', 'next_step', 'next_contact_date', 'sentiment'] as const;
