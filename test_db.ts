import { db } from './db';
import { doc, getDoc } from 'firebase/firestore';

async function main() {
  try {
    const docSnap = await getDoc(doc(db, 'app_data', 'admin_stats'));
    console.log("Success! Data:", docSnap.data());
  } catch(e) {
    console.error("Fail:", e);
  }
  process.exit(0);
}
main();
