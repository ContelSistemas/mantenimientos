import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'contel.db');
const DATA_PATH = path.join(__dirname, 'seed-data.json');

if (!fs.existsSync(DATA_PATH)) {
  console.error('seed-data.json not found at', DATA_PATH);
  process.exit(1);
}

const db = new Database(DB_PATH);
const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

const insertC = db.prepare('INSERT OR IGNORE INTO contracts (obra, nCliente, cliente, descripcion) VALUES (?, ?, ?, ?)');
const insertCat = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
const getCat = db.prepare('SELECT id FROM categories WHERE name = ?');
const upsertSvc = db.prepare(`
  INSERT INTO contract_services (contract_id, category_id, services_json)
  VALUES (?, ?, ?)
  ON CONFLICT(contract_id, category_id)
  DO UPDATE SET services_json=excluded.services_json
`);

const tx = db.transaction(() => {
  const countResult = db.prepare('SELECT COUNT(*) as count FROM contracts').get();
  if (countResult.count > 0) {
    return false; // Indicamos que no se ha hecho nada
  }

  for (const row of raw) {
    insertC.run(row.obra, row.nCliente, row.cliente, row.descripcion || null);
    const contract = db.prepare('SELECT id FROM contracts WHERE obra = ?').get(row.obra);
    for (const [cat, flags] of Object.entries(row.servicios || {})) {
      insertCat.run(cat);
      const catId = getCat.get(cat).id;
      upsertSvc.run(
        contract.id,
        catId,
        JSON.stringify(flags)
      );
    }
  }
  return true;
});

try {
  const seeded = tx();
  if (seeded) {
    console.log('Seed completed successfully.');
  } else {
    console.log('Database already contains data. Skipping seed.');
  }
} catch (e) {
  console.error('Seed failed:', e);
  process.exit(1);
}
