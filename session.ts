import { db } from './db';

export interface SessionData {
  refreshToken: string;
  cardsDropped?: number;
  collectedCardsDetails?: { image: string; title: string; minPrice: string }[];
}

export async function loadSession(): Promise<SessionData> {
  try {
    const doc = await db.collection('app_data').doc('session').get();
    if (doc.exists) {
      return doc.data() as SessionData;
    }
  } catch (e) {
    console.error('Error loading session from Firestore:', e);
  }
  return { refreshToken: '', cardsDropped: 0, collectedCardsDetails: [] };
}

export async function saveSession(data: SessionData) {
  try {
    await db.collection('app_data').doc('session').set(data);
  } catch (e) {
    console.error('Error saving session to Firestore:', e);
  }
}
