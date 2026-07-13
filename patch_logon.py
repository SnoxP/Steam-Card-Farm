import re

with open('server.ts', 'r') as f:
    content = f.read()

pattern = """  const logOnOptions: any = {};
  if (refreshToken) {
    session.addLog('Iniciando conexão CM via Refresh Token (Sessão Salva)...');
    logOnOptions.refreshToken = refreshToken;
  } else {"""

new_pattern = """  const logOnOptions: any = {
    logonID: 144
  };
  if (refreshToken) {
    session.addLog('Iniciando conexão CM via Refresh Token (Sessão Salva)...');
    logOnOptions.refreshToken = refreshToken;
  } else {"""

content = content.replace(pattern, new_pattern)

with open('server.ts', 'w') as f:
    f.write(content)
