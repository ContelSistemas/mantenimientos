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

// Ensure schema
const schema = `
CREATE TABLE IF NOT EXISTS contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  obra TEXT NOT NULL UNIQUE,
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
  mon INTEGER NOT NULL,
  help INTEGER NOT NULL,
  prev_pres INTEGER NOT NULL,
  cor_pres INTEGER NOT NULL,
  UNIQUE(contract_id, category_id)
);
`;
db.exec(schema);

// Helpers
const flagsFromBody = (o) => ({
  mon: o?.MONIT ? 1 : 0,
  help: o?.HELP ? 1 : 0,
  prev_pres: o?.["PREV. PRES."] ? 1 : 0,
  cor_pres: o?.["COR. PRES."] ? 1 : 0,
});

const toSvcObject = (row) => ({
  MONIT: !!row.mon,
  HELP: !!row.help,
  'PREV. PRES.': !!row.prev_pres,
  'COR. PRES.': !!row.cor_pres,
});

function getContractShape(id) {
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
  for (const s of svcs) servicios[s.category] = toSvcObject(s);
  return {
    id: c.id,
    obra: c.obra,
    nCliente: c.nCliente,
    cliente: c.cliente,
    descripcion: c.descripcion,
    servicios,
  };
}

// Routes
app.get('/api/health', (_req, res) => res.json({ ok: true }));

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

// Get one
app.get('/api/contracts/:id', (req, res) => {
  const id = Number(req.params.id);
  const data = getContractShape(id);
  if (!data) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

// Create
const ContractSchema = z.object({
  obra: z.string().min(1),
  nCliente: z.string().min(1),
  cliente: z.string().min(1),
  descripcion: z.string().optional().nullable(),
  servicios: z.record(z.string(), z.object({
    MONIT: z.boolean().optional().default(false),
    HELP: z.boolean().optional().default(false),
    'PREV. PRES.': z.boolean().optional().default(false),
    'COR. PRES.': z.boolean().optional().default(false),
  })).optional().default({})
});

app.post('/api/contracts', (req, res) => {
  const body = ContractSchema.parse(req.body);
  const insertC = db.prepare('INSERT INTO contracts (obra, nCliente, cliente, descripcion) VALUES (?, ?, ?, ?)');
  const result = insertC.run(body.obra, body.nCliente, body.cliente, body.descripcion ?? null);
  const contractId = result.lastInsertRowid;
  const getOrCreateCat = db.prepare('INSERT INTO categories (name) VALUES (?) ON CONFLICT(name) DO NOTHING');
  const findCat = db.prepare('SELECT id FROM categories WHERE name = ?');
  const upsertSvc = db.prepare(`
    INSERT INTO contract_services (contract_id, category_id, mon, help, prev_pres, cor_pres)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(contract_id, category_id)
    DO UPDATE SET mon=excluded.mon, help=excluded.help, prev_pres=excluded.prev_pres, cor_pres=excluded.cor_pres
  `);
  for (const [cat, flags] of Object.entries(body.servicios || {})) {
    getOrCreateCat.run(cat);
    const catId = findCat.get(cat).id;
    const f = flagsFromBody(flags);
    upsertSvc.run(contractId, catId, f.mon, f.help, f.prev_pres, f.cor_pres);
  }
  res.status(201).json(getContractShape(contractId));
});

// Update core fields
app.put('/api/contracts/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = ContractSchema.partial().parse(req.body);
  const existing = db.prepare('SELECT * FROM contracts WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE contracts SET obra = COALESCE(?, obra), nCliente = COALESCE(?, nCliente), cliente = COALESCE(?, cliente), descripcion = COALESCE(?, descripcion) WHERE id = ?')
    .run(body.obra ?? null, body.nCliente ?? null, body.cliente ?? null, body.descripcion ?? null, id);
  res.json(getContractShape(id));
});

// Upsert services for a contract
app.put('/api/contracts/:id/services', (req, res) => {
  const id = Number(req.params.id);
  const body = z.record(z.string(), z.object({
    MONIT: z.boolean().optional().default(false),
    HELP: z.boolean().optional().default(false),
    'PREV. PRES.': z.boolean().optional().default(false),
    'COR. PRES.': z.boolean().optional().default(false),
  })).parse(req.body);
  const exists = db.prepare('SELECT id FROM contracts WHERE id = ?').get(id);
  if (!exists) return res.status(404).json({ error: 'Not found' });
  const getOrCreateCat = db.prepare('INSERT INTO categories (name) VALUES (?) ON CONFLICT(name) DO NOTHING');
  const findCat = db.prepare('SELECT id FROM categories WHERE name = ?');
  const upsertSvc = db.prepare(`
    INSERT INTO contract_services (contract_id, category_id, mon, help, prev_pres, cor_pres)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(contract_id, category_id)
    DO UPDATE SET mon=excluded.mon, help=excluded.help, prev_pres=excluded.prev_pres, cor_pres=excluded.cor_pres
  `);
  for (const [cat, flags] of Object.entries(body)) {
    getOrCreateCat.run(cat);
    const catId = findCat.get(cat).id;
    const f = flagsFromBody(flags);
    upsertSvc.run(id, catId, f.mon, f.help, f.prev_pres, f.cor_pres);
  }
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
