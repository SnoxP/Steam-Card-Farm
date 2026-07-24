import { db } from './db';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface SessionData {
  refreshToken: string;
  cardsDropped?: number;
  collectedCardsDetails?: { image: string; title: string; minPrice: string }[];
}

export async function loadSession(sessionId: string): Promise<SessionData> {
  try {
    const safeId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '');
    const docRef = doc(db, 'sessions', safeId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SessionData;
    }
  } catch (e) {
    console.error('Error loading session:', e);
  }
  return { refreshToken: '', cardsDropped: 0, collectedCardsDetails: [] };
}

export async function saveSession(sessionId: string, data: SessionData) {
  try {
    const safeId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '');
    const docRef = doc(db, 'sessions', safeId);
    await setDoc(docRef, data, { merge: true });
  } catch (e) {
    console.error('Error saving session:', e);
  }
}
