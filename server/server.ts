import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'anniversary-secret-key';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ---- Auth middleware ----
interface AuthRequest extends Request {
  user?: { username: string };
}

function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ---- Init default data ----
function initDefaults() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const config = db.prepare('SELECT id FROM config WHERE id = 1').get();
  if (!config) {
    db.prepare(`
      INSERT INTO config (id, title, subtitle, start_date_time, signature, photos, photo_interval)
      VALUES (1, ?, ?, ?, ?, ?, ?)
    `).run(
      '我们的纪念日',
      '从遇见你的那一天开始',
      today.toISOString(),
      '',
      '[]',
      8
    );
  }

  const user = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!user) {
    const hash = bcrypt.hashSync('anniversary', 10);
    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', hash);
    console.log('Default user created: admin / anniversary');
  }
}
initDefaults();

// ---- Auth routes ----
app.post('/api/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as
    | { username: string; password_hash: string }
    | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token });
});

app.post('/api/change-password', auth, (req: AuthRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const username = req.user!.username;

  const user = db.prepare('SELECT password_hash FROM users WHERE username = ?').get(username) as
    | { password_hash: string }
    | undefined;

  if (!user || !bcrypt.compareSync(oldPassword, user.password_hash)) {
    res.status(401).json({ error: 'Old password incorrect' });
    return;
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE username = ?').run(hash, username);
  res.json({ success: true });
});

// ---- Config routes ----
app.get('/api/config', auth, (_req: AuthRequest, res: Response) => {
  const row = db.prepare('SELECT * FROM config WHERE id = 1').get() as
    | {
        title: string;
        subtitle: string;
        start_date_time: string;
        signature: string;
        photos: string;
        photo_interval: number;
      }
    | undefined;

  if (!row) {
    res.status(404).json({ error: 'Config not found' });
    return;
  }

  res.json({
    title: row.title,
    subtitle: row.subtitle,
    startDateTime: row.start_date_time,
    signature: row.signature,
    photos: JSON.parse(row.photos),
    photoInterval: row.photo_interval,
  });
});

app.post('/api/config', auth, (req: AuthRequest, res: Response) => {
  const { title, subtitle, startDateTime, signature, photos, photoInterval } = req.body;

  db.prepare(`
    INSERT INTO config (id, title, subtitle, start_date_time, signature, photos, photo_interval, updated_at)
    VALUES (1, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      subtitle = excluded.subtitle,
      start_date_time = excluded.start_date_time,
      signature = excluded.signature,
      photos = excluded.photos,
      photo_interval = excluded.photo_interval,
      updated_at = CURRENT_TIMESTAMP
  `).run(title, subtitle, startDateTime, signature, JSON.stringify(photos), photoInterval ?? 8);

  res.json({ success: true });
});

// ---- Timeline routes ----
app.get('/api/timeline', auth, (_req: AuthRequest, res: Response) => {
  const rows = db.prepare('SELECT * FROM timeline_events ORDER BY date DESC').all() as Array<{
    id: string;
    date: string;
    title: string;
    location: string;
    description: string;
    photos: string;
  }>;

  res.json(
    rows.map((r) => ({
      id: r.id,
      date: r.date,
      title: r.title,
      location: r.location,
      description: r.description,
      photos: JSON.parse(r.photos),
    }))
  );
});

app.post('/api/timeline', auth, (req: AuthRequest, res: Response) => {
  const events = req.body as Array<{
    id: string;
    date: string;
    title: string;
    location?: string;
    description?: string;
    photos?: string[];
  }>;

  db.prepare('DELETE FROM timeline_events').run();

  const insert = db.prepare(`
    INSERT INTO timeline_events (id, date, title, location, description, photos)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run(
        item.id,
        item.date,
        item.title,
        item.location ?? '',
        item.description ?? '',
        JSON.stringify(item.photos ?? [])
      );
    }
  });

  insertMany(events);
  res.json({ success: true });
});

// ---- Celebrated routes ----
app.get('/api/celebrated', auth, (_req: AuthRequest, res: Response) => {
  const rows = db.prepare('SELECT milestone FROM celebrated ORDER BY milestone').all() as Array<{
    milestone: number;
  }>;
  res.json(rows.map((r) => r.milestone));
});

app.post('/api/celebrated', auth, (req: AuthRequest, res: Response) => {
  const { milestones } = req.body as { milestones: number[] };

  db.prepare('DELETE FROM celebrated').run();

  const insert = db.prepare('INSERT INTO celebrated (milestone) VALUES (?)');
  const insertMany = db.transaction((items: number[]) => {
    for (const m of items) insert.run(m);
  });
  insertMany(milestones);

  res.json({ success: true });
});

// ---- Health check ----
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
