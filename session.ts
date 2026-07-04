import fs from 'fs';
import path from 'path';

const SESSION_FILE = path.join(process.cwd(), 'session.json');

export interface SessionData {
  refreshToken: string;
  cardsDropped?: number;
  collectedCardsDetails?: { image: string; title: string; minPrice: string }[];
}

export function loadSession(): SessionData {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading session:', e);
  }
  return { refreshToken: '', cardsDropped: 0, collectedCardsDetails: [] };
}

export function saveSession(data: SessionData) {
  try {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving session:', e);
  }
}
