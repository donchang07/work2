import { setAiMode, type AiMode } from '@/lib/ai';
import { setClockOffset } from '@/lib/time';
import { body, handle, ok } from '@/lib/api';
import { testOnly } from '@/lib/testapi';
export const POST = handle(async (req: Request) => {
  const blocked = testOnly(); if (blocked) return blocked;
  const { aiMode, nowOffsetMs } = await body<{ aiMode?: AiMode; nowOffsetMs?: number }>(req);
  if (aiMode) setAiMode(aiMode);
  if (nowOffsetMs !== undefined) setClockOffset(nowOffsetMs);
  return ok({ ok: true });
});
