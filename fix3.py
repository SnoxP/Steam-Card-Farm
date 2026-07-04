import re

with open('db.ts', 'r') as f:
    content = f.read()

content = """
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

let config: any = {};
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
  console.warn('Could not read firebase-applet-config.json');
}

export const app = initializeApp(config);
export const db = getFirestore(app, config.firestoreDatabaseId || "(default)");
"""

with open('db.ts', 'w') as f:
    f.write(content)
