import fs from 'fs';
import path from 'path';

const SESSION_FILE = path.join(process.cwd(), 'session.json');

export function loadSession() {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading session:', e);
  }
  return { refreshToken: '' };
}

export function saveSession(refreshToken: string) {
  try {
    fs.writeFileSync(SESSION_FILE, JSON.stringify({ refreshToken }, null, 2));
  } catch (e) {
    console.error('Error saving session:', e);
  }
}
