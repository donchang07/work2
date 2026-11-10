const g = globalThis as unknown as { __clockOffsetMs?: number };
export function setClockOffset(ms: number) { g.__clockOffsetMs = ms; }
export function now(): Date { return new Date(Date.now() + (g.__clockOffsetMs ?? 0)); }
/** Asia/Seoul 기준 YYYY-MM-DD */
export function seoulDate(d: Date = now()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
export function addDays(ymd: string, days: number): string {
  const t = new Date(ymd + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + days); return t.toISOString().slice(0, 10);
}
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b.slice(0, 10) + 'T00:00:00Z') - Date.parse(a.slice(0, 10) + 'T00:00:00Z')) / 86400000);
}
export function monthOf(ymd: string, back = 0): string {
  const [y, m] = ymd.split('-').map(Number); const t = new Date(Date.UTC(y, m - 1 - back, 1)); return t.toISOString().slice(0, 7);
}
export function koreanDate(ymd: string): string {
  const d = new Date(ymd + 'T00:00:00Z');
  const w = ['일', '월', '화', '수', '목', '금', '토'][d.getUTCDay()];
  return `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${w})`;
}
/** Seoul 날짜 + 시각 → ISO (KST 09:00 기본) */
export function isoAt(ymd: string, hour = 9, minute = 0): string {
  return new Date(Date.parse(`${ymd}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+09:00`)).toISOString();
}
