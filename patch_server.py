import re

with open('server.ts', 'r') as f:
    content = f.read()

# startCheckTimer
old_startCheckTimer = """    public startCheckTimer() {
      if (this.checkTimeoutId) clearTimeout(this.checkTimeoutId);
      const interval = 15 * 60 * 1000;
      this.botState.nextCheckTime = Date.now() + interval;
      this.checkTimeoutId = setTimeout(() => {
        if (!this.botState.isClientLoggedIn) {
          this.startCheckTimer();
          return;
        }
        if (this.botState.isPausedForPlaying || this.botState.isManualPaused) {
          this.startCheckTimer();
          return;
        }
        this.addLog('[System] Iniciando verificação automática periódica...');
        this.checkBadgesAndFarm();
      }, interval);
    }"""

new_startCheckTimer = """    public startCheckTimer() {
      if (this.checkTimeoutId) clearTimeout(this.checkTimeoutId);
      if (this.botState.isPausedForPlaying || this.botState.isManualPaused) {
        this.botState.nextCheckTime = 0;
        return;
      }
      const interval = 15 * 60 * 1000;
      this.botState.nextCheckTime = Date.now() + interval;
      this.checkTimeoutId = setTimeout(() => {
        if (!this.botState.isClientLoggedIn) {
          this.startCheckTimer();
          return;
        }
        this.addLog('[System] Iniciando verificação automática periódica...');
        this.checkBadgesAndFarm();
      }, interval);
    }"""
content = content.replace(old_startCheckTimer, new_startCheckTimer)

old_farm_manual = """app.post('/api/farm-manual', (req, res) => {
  const session = getSession(req);
  const { appId } = req.body;
  if (appId === undefined) return res.status(400).json({ error: 'AppID is required' });
  
  if (session.botState.isPausedForPlaying) {
    return res.status(400).json({ error: 'O farming está pausado porque você está jogando em outro dispositivo. Feche o jogo primeiro.' });
  }

  const appIds = appId.split(',').map((id: string) => parseInt(id.trim(), 10)).filter((id: number) => !isNaN(id));
  
  if (appIds.length > 0 && session.botState.isClientLoggedIn) {
    session.botState.isManualPaused = true;
    session.client.gamesPlayed(appIds);
    session.botState.currentFarm = `${appIds.length} jogo(s) manual(is) (${appIds.join(', ')})`;
    session.botState.activeAppIds = appIds;
    session.addLog(`Farming manual iniciado para AppIDs: ${appIds.join(', ')}`);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Não foi possível iniciar o farm manual. Verifique se está logado e o AppID é válido.' });
  }
});"""

new_farm_manual = """app.post('/api/farm-manual', (req, res) => {
  const session = getSession(req);
  const { appId } = req.body;
  if (appId === undefined) return res.status(400).json({ error: 'AppID is required' });
  
  if (session.botState.isPausedForPlaying) {
    return res.status(400).json({ error: 'O farming está pausado porque você está jogando em outro dispositivo. Feche o jogo primeiro.' });
  }

  const appIds = appId.split(',').map((id: string) => parseInt(id.trim(), 10)).filter((id: number) => !isNaN(id));
  
  if (appIds.length > 0 && session.botState.isClientLoggedIn) {
    session.botState.isManualPaused = true;
    if (session.checkTimeoutId) clearTimeout(session.checkTimeoutId);
    session.botState.nextCheckTime = 0;
    session.client.gamesPlayed(appIds);
    session.botState.currentFarm = `${appIds.length} jogo(s) manual(is) (${appIds.join(', ')})`;
    session.botState.activeAppIds = appIds;
    session.addLog(`Farming manual iniciado para AppIDs: ${appIds.join(', ')}`);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Não foi possível iniciar o farm manual. Verifique se está logado e o AppID é válido.' });
  }
});"""
content = content.replace(old_farm_manual, new_farm_manual)

old_farm_stop = """app.post('/api/farm-stop', (req, res) => {
  const session = getSession(req);
  const { appId } = req.body;
  
  if (!session.botState.isClientLoggedIn) {
    return res.status(400).json({ error: 'Não foi possível parar o farm. Verifique se está logado.' });
  }
  if (appId) {
    session.botState.activeAppIds = session.botState.activeAppIds.filter(id => id !== appId);
    if (session.botState.activeAppIds.length > 0) {
      session.client.gamesPlayed(session.botState.activeAppIds);
      session.botState.currentFarm = `Farmando ${session.botState.activeAppIds.length} jogo(s)`;
      session.addLog(`Farm parado para o jogo ${appId}. Farmando os demais...`);
    } else {
      session.botState.isManualPaused = true;
      session.client.gamesPlayed([]);
      session.botState.currentFarm = 'Pausado Manualmente';
      session.addLog(`Farm parado para o jogo ${appId}. Nenhum outro jogo na lista.`);
    }
  } else {
    session.botState.isManualPaused = true;
    session.client.gamesPlayed([]);
    session.botState.currentFarm = 'Pausado Manualmente';
    session.botState.activeAppIds = [];
    session.addLog('Farming parado manualmente.');
  }
  res.json({ success: true });
});"""

new_farm_stop = """app.post('/api/farm-stop', (req, res) => {
  const session = getSession(req);
  const { appId } = req.body;
  
  if (!session.botState.isClientLoggedIn) {
    return res.status(400).json({ error: 'Não foi possível parar o farm. Verifique se está logado.' });
  }
  if (appId) {
    session.botState.activeAppIds = session.botState.activeAppIds.filter(id => id !== appId);
    if (session.botState.activeAppIds.length > 0) {
      session.client.gamesPlayed(session.botState.activeAppIds);
      session.botState.currentFarm = `Farmando ${session.botState.activeAppIds.length} jogo(s)`;
      session.addLog(`Farm parado para o jogo ${appId}. Farmando os demais...`);
    } else {
      session.botState.isManualPaused = true;
      if (session.checkTimeoutId) clearTimeout(session.checkTimeoutId);
      session.botState.nextCheckTime = 0;
      session.client.gamesPlayed([]);
      session.botState.currentFarm = 'Pausado Manualmente';
      session.addLog(`Farm parado para o jogo ${appId}. Nenhum outro jogo na lista.`);
    }
  } else {
    session.botState.isManualPaused = true;
    if (session.checkTimeoutId) clearTimeout(session.checkTimeoutId);
    session.botState.nextCheckTime = 0;
    session.client.gamesPlayed([]);
    session.botState.currentFarm = 'Pausado Manualmente';
    session.botState.activeAppIds = [];
    session.addLog('Farming parado manualmente.');
  }
  res.json({ success: true });
});"""
content = content.replace(old_farm_stop, new_farm_stop)

with open('server.ts', 'w') as f:
    f.write(content)
