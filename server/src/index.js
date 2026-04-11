import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import morgan from 'morgan';
import { z } from 'zod';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'contel.db');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

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
  descripcion TEXT,
  pdf_url TEXT
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
  periodicity TEXT,
  last_execution TEXT,
  next_execution TEXT,
  UNIQUE(contract_id, category_id)
);
`;
db.exec(schema);

// Migration: Add pdf_url column if not exists
try {
  const tableInfo = db.prepare("PRAGMA table_info(contracts)").all();
  const hasPdfUrl = tableInfo.some(c => c.name === 'pdf_url');
  if (!hasPdfUrl) {
    console.log("Migrating contracts table to add pdf_url...");
    db.exec("ALTER TABLE contracts ADD COLUMN pdf_url TEXT");
  }
} catch (e) {
  console.error("Migration error for pdf_url:", e.message);
}

// Migration: Add maintenance columns to contract_services if not exists
try {
  const tableInfo = db.prepare("PRAGMA table_info(contract_services)").all();
  const hasPeriodicity = tableInfo.some(c => c.name === 'periodicity');
  if (!hasPeriodicity) {
    console.log("Migrating contract_services table to add maintenance columns...");
    db.exec("ALTER TABLE contract_services ADD COLUMN periodicity TEXT");
    db.exec("ALTER TABLE contract_services ADD COLUMN last_execution TEXT");
    db.exec("ALTER TABLE contract_services ADD COLUMN next_execution TEXT");
  }
} catch (e) {
  console.error("Migration error for maintenance columns:", e.message);
}

// Serve static files from uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const contractId = req.params.id;
    const ext = path.extname(file.originalname);
    cb(null, `contract_${contractId}_${Date.now()}${ext}`);
  }
});
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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
            descripcion TEXT,
            pdf_url TEXT
          )
        `);

        // Copy data
        db.exec(`
          INSERT INTO contracts_new (id, obra, nCliente, cliente, descripcion, pdf_url)
          SELECT id, obra, nCliente, cliente, descripcion, pdf_url FROM contracts
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
        periodicity TEXT,
        last_execution TEXT,
        next_execution TEXT,
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

// Initial Seed Logic (after migrations)
try {
  const count = db.prepare('SELECT COUNT(*) as count FROM contracts').get().count;
  if (count === 0) {
    const DATA_PATH = path.join(__dirname, 'seed-data.json');
    if (fs.existsSync(DATA_PATH)) {
      console.log('Database empty. Running initial seed...');
      const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
      
      const insertC = db.prepare('INSERT INTO contracts (obra, nCliente, cliente, descripcion) VALUES (?, ?, ?, ?)');
      const insertCat = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
      const getCat = db.prepare('SELECT id FROM categories WHERE name = ?');
      const insertSvc = db.prepare('INSERT INTO contract_services (contract_id, category_id, services_json) VALUES (?, ?, ?)');

      db.transaction(() => {
        for (const row of raw) {
          const res = insertC.run(row.obra, row.nCliente, row.cliente, row.descripcion || null);
          const contractId = res.lastInsertRowid;
          for (const [cat, flags] of Object.entries(row.servicios || {})) {
            insertCat.run(cat);
            const catId = getCat.get(cat).id;
            insertSvc.run(contractId, catId, JSON.stringify(flags));
          }
        }
      })();
      console.log('Seed completed successfully.');
    }
  }
} catch (e) {
  console.error('Seed failed:', e.message);
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
      servicios[s.category] = {
        flags: JSON.parse(s.services_json),
        periodicity: s.periodicity,
        last_execution: s.last_execution,
        next_execution: s.next_execution
      };
    } catch (e) {
      servicios[s.category] = {
        flags: {},
        periodicity: null,
        last_execution: null,
        next_execution: null
      };
    }
  }
  return {
    id: c.id,
    obra: c.obra,
    empresa: c.empresa,
    nCliente: c.nCliente,
    cliente: c.cliente,
    descripcion: c.descripcion,
    pdf_url: c.pdf_url,
    servicios,
  };
};

// Routes
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const ServiceSchema = z.object({
  flags: z.record(z.string(), z.boolean()).default({}),
  periodicity: z.string().optional().nullable(),
  last_execution: z.string().optional().nullable(),
  next_execution: z.string().optional().nullable()
});

const ContractSchema = z.object({
  obra: z.string().min(1),
  empresa: z.enum(['CI', 'CS']).default('CI'),
  nCliente: z.string().min(1),
  cliente: z.string().min(1),
  descripcion: z.string().optional().nullable(),
  pdf_url: z.string().optional().nullable(),
  servicios: z.record(z.string(), ServiceSchema).optional().default({})
});

// List + search
app.get('/api/contracts', (req, res) => {
  const q = (req.query.q || '').toString().trim();
  const category = (req.query.category || '').toString().trim().toUpperCase(); // New parameter for category

  let rows;
  let query = `
    SELECT DISTINCT c.id
    FROM contracts c
  `;
  const params = [];
  const whereClauses = [];

  if (category) {
    query += `
      JOIN contract_services cs ON c.id = cs.contract_id
      JOIN categories cat ON cs.category_id = cat.id
    `;
    whereClauses.push(`UPPER(cat.name) LIKE ?`);
    params.push(`%${category}%`);
  }

  if (q) {
    const like = `%${q.toUpperCase()}%`;
    whereClauses.push(`(UPPER(c.obra) LIKE ? OR UPPER(c.nCliente) LIKE ? OR UPPER(c.cliente) LIKE ? OR UPPER(c.descripcion) LIKE ?)`);
    params.push(like, like, like, like);
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ` + whereClauses.join(' AND ');
  }

  query += ` ORDER BY c.cliente ASC`;

  rows = db.prepare(query).all(...params);

  const data = rows.map(r => getContractShape(r.id));
  res.json(data);
});

// Create
app.post('/api/contracts', (req, res) => {
  const body = ContractSchema.parse(req.body);
  const insertC = db.prepare('INSERT INTO contracts (obra, empresa, nCliente, cliente, descripcion, pdf_url) VALUES (?, ?, ?, ?, ?, ?)');
  const result = insertC.run(body.obra, body.empresa, body.nCliente, body.cliente, body.descripcion ?? null, body.pdf_url ?? null);
  const contractId = result.lastInsertRowid;
  
  const getOrCreateCat = db.prepare('INSERT INTO categories (name) VALUES (?) ON CONFLICT(name) DO NOTHING');
  const findCat = db.prepare('SELECT id FROM categories WHERE name = ?');
  const upsertSvc = db.prepare(`
    INSERT INTO contract_services (contract_id, category_id, services_json, periodicity, last_execution, next_execution)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(contract_id, category_id)
    DO UPDATE SET 
      services_json=excluded.services_json,
      periodicity=excluded.periodicity,
      last_execution=excluded.last_execution,
      next_execution=excluded.next_execution
  `);

  for (const [cat, data] of Object.entries(body.servicios || {})) {
    getOrCreateCat.run(cat);
    const catId = findCat.get(cat).id;
    upsertSvc.run(contractId, catId, JSON.stringify(data.flags), data.periodicity ?? null, data.last_execution ?? null, data.next_execution ?? null);
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
          descripcion = COALESCE(?, descripcion),
          pdf_url = COALESCE(?, pdf_url)
      WHERE id = ?
    `).run(data.obra ?? null, data.empresa ?? null, data.nCliente ?? null, data.cliente ?? null, data.descripcion ?? null, data.pdf_url ?? null, id);

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
        INSERT INTO contract_services (contract_id, category_id, services_json, periodicity, last_execution, next_execution)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(contract_id, category_id)
        DO UPDATE SET 
          services_json=excluded.services_json,
          periodicity=excluded.periodicity,
          last_execution=excluded.last_execution,
          next_execution=excluded.next_execution
      `);

      for (const [catName, svcData] of Object.entries(data.servicios)) {
        getOrCreateCat.run(catName);
        const catId = findCat.get(catName).id;
        upsertSvc.run(id, catId, JSON.stringify(svcData.flags), svcData.periodicity ?? null, svcData.last_execution ?? null, svcData.next_execution ?? null);
      }
    }
  })(body);

  res.json(getContractShape(id));
});

// PDF Upload
app.post('/api/contracts/:id/pdf', upload.single('pdf'), (req, res) => {
  const id = Number(req.params.id);
  const contract = db.prepare('SELECT * FROM contracts WHERE id = ?').get(id);
  if (!contract) return res.status(404).json({ error: 'Contract not found' });

  // Delete old PDF if exists
  if (contract.pdf_url) {
    const oldPath = path.join(UPLOADS_DIR, path.basename(contract.pdf_url));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const pdfUrl = `/uploads/${req.file.filename}`;
  db.prepare('UPDATE contracts SET pdf_url = ? WHERE id = ?').run(pdfUrl, id);

  res.json({ pdf_url: pdfUrl });
});

// PDF Delete
app.delete('/api/contracts/:id/pdf', (req, res) => {
  const id = Number(req.params.id);
  const contract = db.prepare('SELECT * FROM contracts WHERE id = ?').get(id);
  if (!contract) return res.status(404).json({ error: 'Contract not found' });

  if (contract.pdf_url) {
    const oldPath = path.join(UPLOADS_DIR, path.basename(contract.pdf_url));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  db.prepare('UPDATE contracts SET pdf_url = NULL WHERE id = ?').run(id);
  res.status(204).end();
});

// Delete
app.delete('/api/contracts/:id', (req, res) => {
  const id = Number(req.params.id);
  const contract = db.prepare('SELECT * FROM contracts WHERE id = ?').get(id);
  
  // Delete PDF if exists
  if (contract?.pdf_url) {
    const oldPath = path.join(UPLOADS_DIR, path.basename(contract.pdf_url));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const del = db.prepare('DELETE FROM contracts WHERE id = ?').run(id);
  if (del.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
