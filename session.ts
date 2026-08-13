import { db } from './db';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

export interface SessionData {
  refreshToken: string;
  cardsDropped?: number;
  collectedCardsDetails?: { image: string; title: string; minPrice: string }[];
}

const LOCAL_STORAGE_FILE = path.join(process.cwd(), 'local_sessions.json');

function loadLocalSession(sessionId: string): SessionData | null {
  try {
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      const data = JSON.parse(fs.readFileSync(LOCAL_STORAGE_FILE, 'utf8'));
      if (data[sessionId]) {
        return data[sessionId];
      }
    }
  } catch (e) {
    console.error('Local backup read error:', e);
  }
  return null;
}

function saveLocalSession(sessionId: string, data: SessionData) {
  try {
    let allData: any = {};
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      allData = JSON.parse(fs.readFileSync(LOCAL_STORAGE_FILE, 'utf8'));
    }
    allData[sessionId] = { ...allData[sessionId], ...data };
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(allData, null, 2), 'utf8');
  } catch (e) {
    console.error('Local backup write error:', e);
  }
}

export async function loadSession(sessionId: string): Promise<SessionData> {
  const defaultData = { refreshToken: '', cardsDropped: 0, collectedCardsDetails: [] };
  
  // Try Firebase first
  try {
    const safeId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '');
    const docRef = doc(db, 'sessions', safeId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const fbData = docSnap.data() as SessionData;
      // sync to local just in case
      saveLocalSession(sessionId, fbData);
      return fbData;
    }
  } catch (e) {
    console.error('Error loading session from Firebase:', e);
  }

  // Fallback to local
  const localData = loadLocalSession(sessionId);
  if (localData) {
    console.log('Loaded session from local backup file.');
    return localData;
  }

  return defaultData;
}

export async function saveSession(sessionId: string, data: SessionData) {
  // Save locally first (instant)
  saveLocalSession(sessionId, data);

  // Save to Firebase (async)
  try {
    const safeId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '');
    const docRef = doc(db, 'sessions', safeId);
    await setDoc(docRef, data, { merge: true });
  } catch (e) {
    console.error('Error saving session to Firebase:', e);
  }
}
