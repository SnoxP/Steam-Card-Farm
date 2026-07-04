with open('session.ts', 'r') as f:
    content = f.read()

content = content.replace("await db.collection('app_data').doc('session').get();", "await getDoc(doc(db, 'app_data', 'session'));")
content = content.replace("doc.exists", "docSnap.exists()")
content = content.replace("doc.data()", "docSnap.data()")
content = content.replace("const doc =", "const docSnap =")

content = content.replace("await db.collection('app_data').doc('session').set(data);", "await setDoc(doc(db, 'app_data', 'session'), data);")

content = "import { doc, getDoc, setDoc } from 'firebase/firestore';\n" + content

with open('session.ts', 'w') as f:
    f.write(content)


with open('adminStats.ts', 'r') as f:
    content = f.read()

content = content.replace("await db.collection('app_data').doc('admin_stats').get();", "await getDoc(doc(db, 'app_data', 'admin_stats'));")
content = content.replace("doc.exists", "docSnap.exists()")
content = content.replace("doc.data()", "docSnap.data()")
content = content.replace("const doc =", "const docSnap =")

content = content.replace("await db.collection('app_data').doc('admin_stats').set(stats);", "await setDoc(doc(db, 'app_data', 'admin_stats'), stats);")

content = "import { doc, getDoc, setDoc } from 'firebase/firestore';\n" + content

with open('adminStats.ts', 'w') as f:
    f.write(content)
