import re

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace("session.client.logOn(logOnOptions);", """try {
    session.client.logOn(logOnOptions);
  } catch (e: any) {
    session.addLog(`[Erro] Falha ao iniciar login: ${e.message}`);
    return res.status(400).json({ error: e.message });
  }""")

with open('server.ts', 'w') as f:
    f.write(content)
