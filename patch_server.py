import re

with open('server.ts', 'r') as f:
    content = f.read()

# Remove the block handling empty appId in farm-manual
empty_check_block = """  if (appId.trim() === '') {
    session.botState.isManualPaused = true;
    session.client.gamesPlayed([]);
    session.botState.currentFarm = 'Nenhum';
    session.botState.activeAppIds = [];
    session.addLog('Todos os jogos foram finalizados (parados manualmente).');
    return res.json({ success: true });
  }

"""

content = content.replace(empty_check_block, "")

with open('server.ts', 'w') as f:
    f.write(content)
