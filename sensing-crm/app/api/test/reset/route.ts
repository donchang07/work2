import { getDb } from '@/lib/db';
import { seedDatabase, type SeedVariant } from '@/lib/seed';
import { setAiMode } from '@/lib/ai';
import { setClockOffset } from '@/lib/time';
import { body, handle, ok } from '@/lib/api';
import { testOnly } from '@/lib/testapi';
export const POST = handle(async (req: Request) => {
  const blocked = testOnly(); if (blocked) return blocked;
  const { variant = 'default' } = await body<{ variant?: SeedVariant }>(req);
  setClockOffset(0); setAiMode(undefined);
  const r = await seedDatabase(getDb(), variant);
  return ok(r);
});
