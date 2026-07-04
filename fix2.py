import re

with open('server.ts', 'r') as f:
    code = f.read()

code = code.replace("community.request('https://steamcommunity.com/my/badges/', (err, response, body) => {", "community.request('https://steamcommunity.com/my/badges/', async (err, response, body) => {")

code = code.replace("app.post('/api/admin/update-user', (req, res) => {", "app.post('/api/admin/update-user', async (req, res) => {")

with open('server.ts', 'w') as f:
    f.write(code)
