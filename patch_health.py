import re

with open('server.ts', 'r') as f:
    content = f.read()

# Add health route
if "app.get('/api/health'" not in content:
    content = content.replace("app.use(express.json());", "app.use(express.json());\n\napp.get('/api/health', (req, res) => { res.json({ status: 'ok' }); });")
    with open('server.ts', 'w') as f:
        f.write(content)
