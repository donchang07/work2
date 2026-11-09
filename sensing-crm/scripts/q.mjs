import Database from 'better-sqlite3';
const db = new Database(process.env.DATABASE_PATH || 'data/sensing.db', { readonly: true });
for (const q of process.argv.slice(2)) { console.log('>', q); console.table(db.prepare(q).all()); }
