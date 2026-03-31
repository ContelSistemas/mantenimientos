import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import morgan from 'morgan';
import { z } from 'zod';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'contel.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

// Ensure schema (Dynamic Refactor)
const schema = `
CREATE TABLE IF NOT EXISTS contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  obra TEXT NOT NULL,
  empresa TEXT NOT NULL DEFAULT 'CI',
  nCliente TEXT NOT NULL,
  cliente TEXT NOT NULL,
  descripcion TEXT
);
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS contract_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  services_json TEXT NOT NULL,
  UNIQUE(contract_id, category_id)
);
`;
db.exec(schema);

// Migration: Remove UNIQUE from obra and add empresa column if not exists
try {
  const tableInfo = db.prepare("PRAGMA table_info(contracts)").all();
  const hasEmpresa = tableInfo.some(c => c.name === 'empresa');
  
  // Check if obra is unique
  const indexInfo = db.prepare("PRAGMA index_list(contracts)").all();
  const obraIsUnique = indexInfo.some(idx => {
    const detail = db.prepare(`PRAGMA index_info(${idx.name})`).all();
    return idx.unique && detail.some(d => d.name === 'obra');
  });

  if (!hasEmpresa || obraIsUnique) {
    console.log("Migrating contracts table to remove UNIQUE(obra) and add empresa...");
    
    // Disable foreign keys temporarily to avoid CASCADE DELETE
    db.pragma('foreign_keys = OFF');
    
    try {
      db.transaction(() => {
        // Create new table
        db.exec(`
          CREATE TABLE contracts_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            obra TEXT NOT NULL,
            empresa TEXT NOT NULL DEFAULT 'CI',
            nCliente TEXT NOT NULL,
            cliente TEXT NOT NULL,
            descripcion TEXT
          )
        `);

        // Copy data
        db.exec(`
          INSERT INTO contracts_new (id, obra, nCliente, cliente, descripcion)
          SELECT id, obra, nCliente, cliente, descripcion FROM contracts
        `);

        // Swap tables
        db.exec("DROP TABLE contracts");
        db.exec("ALTER TABLE contracts_new RENAME TO contracts");
      })();
      console.log("Migration for contracts table completed.");
    } finally {
      // Re-enable foreign keys
      db.pragma('foreign_keys = ON');
    }
  }
} catch (e) {
  console.error("Migration error for contracts table:", e.message);
}

// Migration: Check if old columns exist and migrate to JSON
try {
  const tableInfo = db.prepare("PRAGMA table_info(contract_services)").all();
  const hasOldColumns = tableInfo.some(c => c.name === 'mon');
  if (hasOldColumns) {
    console.log("Migrating contract_services to JSON schema...");
    const oldData = db.prepare(`
      SELECT cs.*, cat.name as cat_name 
      FROM contract_services cs 
      JOIN categories cat ON cat.id = cs.category_id
    `).all();
    
    db.exec("DROP TABLE contract_services");
    db.exec(`
      CREATE TABLE contract_services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        services_json TEXT NOT NULL,
        UNIQUE(contract_id, category_id)
      )
    `);

    const insert = db.prepare('INSERT INTO contract_services (contract_id, category_id, services_json) VALUES (?, ?, ?)');
    for (const row of oldData) {
      const svcs = {
        MONIT: !!row.mon,
        HELP: !!row.help,
        'PREV. PRES.': !!row.prev_pres,
        'COR. PRES.': !!row.cor_pres
      };
      insert.run(row.contract_id, row.category_id, JSON.stringify(svcs));
    }
    console.log("Migration completed successfully.");
  }
} catch (e) {
  console.error("Migration error (might be first run):", e.message);
}

const getContractShape = (id) => {
  const c = db.prepare('SELECT * FROM contracts WHERE id = ?').get(id);
  if (!c) return null;
  const svcs = db.prepare(`
    SELECT cs.*, cat.name as category
    FROM contract_services cs
    JOIN categories cat ON cat.id = cs.category_id
    WHERE cs.contract_id = ?
    ORDER BY cat.name
  `).all(id);
  const servicios = {};
  for (const s of svcs) {
    try {
      servicios[s.category] = JSON.parse(s.services_json);
    } catch (e) {
      servicios[s.category] = {};
    }
  }
  return {
    id: c.id,
    obra: c.obra,
    empresa: c.empresa,
    nCliente: c.nCliente,
    cliente: c.cliente,
    descripcion: c.descripcion,
    servicios,
  };
};

// Routes
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const ContractSchema = z.object({
  obra: z.string().min(1),
  empresa: z.enum(['CI', 'CS']).default('CI'),
  nCliente: z.string().min(1),
  cliente: z.string().min(1),
  descripcion: z.string().optional().nullable(),
  servicios: z.record(z.string(), z.record(z.string(), z.boolean())).optional().default({})
});

// List + search
app.get('/api/contracts', (req, res) => {
  const q = (req.query.q || '').toString().trim();
  let rows;
  if (!q) {
    rows = db.prepare('SELECT id FROM contracts ORDER BY cliente ASC').all();
  } else {
    const like = `%${q.toUpperCase()}%`;
    rows = db.prepare(`
      SELECT id FROM contracts
      WHERE UPPER(obra) LIKE ? OR UPPER(nCliente) LIKE ? OR UPPER(cliente) LIKE ? OR UPPER(descripcion) LIKE ?
      ORDER BY cliente ASC
    `).all(like, like, like, like);
  }
  const data = rows.map(r => getContractShape(r.id));
  res.json(data);
});

// Create
app.post('/api/contracts', (req, res) => {
  const body = ContractSchema.parse(req.body);
  const insertC = db.prepare('INSERT INTO contracts (obra, empresa, nCliente, cliente, descripcion) VALUES (?, ?, ?, ?, ?)');
  const result = insertC.run(body.obra, body.empresa, body.nCliente, body.cliente, body.descripcion ?? null);
  const contractId = result.lastInsertRowid;
  
  const getOrCreateCat = db.prepare('INSERT INTO categories (name) VALUES (?) ON CONFLICT(name) DO NOTHING');
  const findCat = db.prepare('SELECT id FROM categories WHERE name = ?');
  const upsertSvc = db.prepare(`
    INSERT INTO contract_services (contract_id, category_id, services_json)
    VALUES (?, ?, ?)
    ON CONFLICT(contract_id, category_id)
    DO UPDATE SET services_json=excluded.services_json
  `);

  for (const [cat, flags] of Object.entries(body.servicios || {})) {
    getOrCreateCat.run(cat);
    const catId = findCat.get(cat).id;
    upsertSvc.run(contractId, catId, JSON.stringify(flags));
  }
  res.status(201).json(getContractShape(contractId));
});

// Update
app.put('/api/contracts/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = ContractSchema.partial().parse(req.body);
  const existing = db.prepare('SELECT * FROM contracts WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  db.transaction((data) => {
    db.prepare(`
      UPDATE contracts 
      SET obra = COALESCE(?, obra), 
          empresa = COALESCE(?, empresa),
          nCliente = COALESCE(?, nCliente), 
          cliente = COALESCE(?, cliente), 
          descripcion = COALESCE(?, descripcion) 
      WHERE id = ?
    `).run(data.obra ?? null, data.empresa ?? null, data.nCliente ?? null, data.cliente ?? null, data.descripcion ?? null, id);

    if (data.servicios) {
      const currentSvcs = db.prepare(`
        SELECT cs.id, cat.name FROM contract_services cs 
        JOIN categories cat ON cat.id = cs.category_id 
        WHERE cs.contract_id = ?
      `).all(id);

      const newCatNames = Object.keys(data.servicios);
      for (const current of currentSvcs) {
        if (!newCatNames.includes(current.name)) {
          db.prepare('DELETE FROM contract_services WHERE id = ?').run(current.id);
        }
      }

      const getOrCreateCat = db.prepare('INSERT INTO categories (name) VALUES (?) ON CONFLICT(name) DO NOTHING');
      const findCat = db.prepare('SELECT id FROM categories WHERE name = ?');
      const upsertSvc = db.prepare(`
        INSERT INTO contract_services (contract_id, category_id, services_json)
        VALUES (?, ?, ?)
        ON CONFLICT(contract_id, category_id)
        DO UPDATE SET services_json=excluded.services_json
      `);

      for (const [catName, flags] of Object.entries(data.servicios)) {
        getOrCreateCat.run(catName);
        const catId = findCat.get(catName).id;
        upsertSvc.run(id, catId, JSON.stringify(flags));
      }
    }
  })(body);

  res.json(getContractShape(id));
});

// Delete
app.delete('/api/contracts/:id', (req, res) => {
  const id = Number(req.params.id);
  const del = db.prepare('DELETE FROM contracts WHERE id = ?').run(id);
  if (del.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
