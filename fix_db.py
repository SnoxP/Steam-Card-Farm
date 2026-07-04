import re

with open('db.ts', 'r') as f:
    content = f.read()

content = content.replace("export const app = initializeApp();", "export const app = initializeApp({ projectId: config.projectId });")

with open('db.ts', 'w') as f:
    f.write(content)
