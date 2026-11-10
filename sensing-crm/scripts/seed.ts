import { openDb } from '../lib/db';
import { seedDatabase } from '../lib/seed';
import fs from 'node:fs';

for (const f of ['.env.local', '.env']) {
  if (!fs.existsSync(f)) continue;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && m[2] && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const t0 = Date.now();
const db = openDb();
seedDatabase(db, (process.argv[2] as 'default' | 'empty-today') || 'default').then(r => {
  console.log(`seeded ${process.env.DATABASE_PATH || 'data/sensing.db'}: today=${r.today} accounts=${r.accounts} signals=${r.signals} (${Date.now() - t0}ms)`);
  db.close();
});
