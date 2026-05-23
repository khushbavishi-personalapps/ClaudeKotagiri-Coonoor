import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4173;
const HOST = process.env.HOST || (process.env.PORT ? '0.0.0.0' : '127.0.0.1');
const PUBLIC_DIR = path.join(__dirname, 'dist');
const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');

const clients = new Set();
const defaultState = {
  profiles: [],
  baseVotes: {},
  votes: {},
  comments: [],
  gameVotes: {}
};

async function ensureState() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const state = JSON.parse(await fs.readFile(STATE_FILE, 'utf8'));
    return {
      ...defaultState,
      ...state,
      profiles: Array.isArray(state.profiles) ? state.profiles : [],
      comments: Array.isArray(state.comments) ? state.comments : []
    };
  } catch {
    await saveState(defaultState);
    return structuredClone(defaultState);
  }
}

async function saveState(state) {
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload)
  });
  res.end(payload);
}

function broadcast(state) {
  const message = `data: ${JSON.stringify(state)}\n\n`;
  for (const res of clients) {
    res.write(message);
  }
}

function cleanText(value, maxLength = 500) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

function sameChoicePrefix(targetKey) {
  return targetKey.split(':').slice(0, -1).join(':') + ':';
}

function applyAction(state, action) {
  const type = cleanText(action.type, 80);
  const payload = action.payload || {};

  if (type === 'addProfile') {
    const profile = payload.profile || {};
    const id = cleanText(profile.id, 80);
    const name = cleanText(profile.name, 60);
    if (!id || !name) throw new Error('Profile needs a name.');
    if (!state.profiles.some(existing => existing.id === id)) {
      state.profiles.push({
        id,
        name,
        age: Number.isFinite(profile.age) ? profile.age : null,
        color: cleanText(profile.color, 24) || '#C56B4A'
      });
    }
    return;
  }

  const userId = cleanText(payload.userId, 80);
  if (!state.profiles.some(profile => profile.id === userId)) {
    throw new Error('Choose or create a family profile first.');
  }

  if (type === 'voteBase') {
    const base = cleanText(payload.base, 20);
    if (!['kotagiri', 'coonoor'].includes(base)) throw new Error('Unknown base.');
    state.baseVotes[userId] = base;
    return;
  }

  if (type === 'voteOption') {
    const targetKey = cleanText(payload.targetKey, 200);
    if (!targetKey) throw new Error('Missing itinerary option.');
    const prefix = sameChoicePrefix(targetKey);

    for (const key of Object.keys(state.votes)) {
      if (key.startsWith(prefix) && key !== targetKey && state.votes[key]?.[userId]) {
        delete state.votes[key][userId];
        if (Object.keys(state.votes[key]).length === 0) delete state.votes[key];
      }
    }

    const existing = state.votes[targetKey] || {};
    if (existing[userId]) {
      delete existing[userId];
      if (Object.keys(existing).length === 0) {
        delete state.votes[targetKey];
      } else {
        state.votes[targetKey] = existing;
      }
    } else {
      state.votes[targetKey] = { ...existing, [userId]: true };
    }
    return;
  }

  if (type === 'voteGame') {
    const gameId = cleanText(payload.gameId, 80);
    if (!gameId) throw new Error('Missing game.');
    const existing = state.gameVotes[gameId] || {};
    if (existing[userId]) {
      delete existing[userId];
      if (Object.keys(existing).length === 0) {
        delete state.gameVotes[gameId];
      } else {
        state.gameVotes[gameId] = existing;
      }
    } else {
      state.gameVotes[gameId] = { ...existing, [userId]: true };
    }
    return;
  }

  if (type === 'addComment') {
    const comment = payload.comment || {};
    const id = cleanText(comment.id, 80);
    const target = cleanText(comment.target, 200);
    const text = cleanText(comment.text, 500);
    if (!id || !target || !text) throw new Error('Comment needs text.');
    if (!state.comments.some(existing => existing.id === id)) {
      state.comments.push({
        id,
        userId,
        target,
        text,
        ts: Number.isFinite(comment.ts) ? comment.ts : Date.now()
      });
    }
    return;
  }

  throw new Error('Unknown action.');
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/api/state') {
    sendJson(res, 200, await ensureState());
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/events') {
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive'
    });
    clients.add(res);
    res.write(`data: ${JSON.stringify(await ensureState())}\n\n`);
    req.on('close', () => clients.delete(res));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/action') {
    const action = await parseBody(req);
    const state = await ensureState();
    applyAction(state, action);
    await saveState(state);
    broadcast(state);
    sendJson(res, 200, state);
    return;
  }

  sendJson(res, 404, { error: 'Unknown API route' });
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  let filePath = path.normalize(path.join(PUBLIC_DIR, pathname));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
    res.writeHead(200, { 'content-type': types[ext] || 'application/octet-stream' });
    res.end(file);
  } catch {
    filePath = path.join(PUBLIC_DIR, 'index.html');
    try {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(await fs.readFile(filePath));
    } catch {
      res.writeHead(404);
      res.end('Build not found. Run npm run build first.');
    }
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/')) {
      await handleApi(req, res);
      return;
    }
    await serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Server error' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Nilgiri Trip Planner running on http://${HOST}:${PORT}`);
});
