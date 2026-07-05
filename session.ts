import fs from 'fs';
import path from 'path';

const SESSIONS_DIR = path.join(process.cwd(), 'sessions');

if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR);
}

export interface SessionData {
  refreshToken: string;
  cardsDropped?: number;
  collectedCardsDetails?: { image: string; title: string; minPrice: string }[];
}

function getSessionFile(sessionId: string) {
  // sanitize
  const safeId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(SESSIONS_DIR, `session_${safeId}.json`);
}

export async function loadSession(sessionId: string): Promise<SessionData> {
  try {
    const file = getSessionFile(sessionId);
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading session:', e);
  }
  return { refreshToken: '', cardsDropped: 0, collectedCardsDetails: [] };
}

export async function saveSession(sessionId: string, data: SessionData) {
  try {
    const file = getSessionFile(sessionId);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving session:', e);
  }
}
