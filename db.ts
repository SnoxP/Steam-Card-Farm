import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

let config: any = {};
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
  console.warn('Could not read firebase-applet-config.json');
}

export const app = initializeApp();
export const db = getFirestore(app, config.firestoreDatabaseId || "(default)");
