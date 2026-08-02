import re

with open('server.ts', 'r') as f:
    content = f.read()

# 1. Add pausedGames and checkInterval to botState
old_botstate = """        activeAppIds: [] as number[],
        nextCheckTime: 0,
        farmingStartTime: null as number | null,
        logs: ['[System] Inicializando servidor Steam...'],
        collectedCardsDetails: [] as { image: string, title: string, minPrice: string }[]
    };"""
new_botstate = """        activeAppIds: [] as number[],
        pausedGames: [] as { appId: number, name: string, drops: number }[],
        checkInterval: 15 * 60 * 1000,
        nextCheckTime: 0,
        farmingStartTime: null as number | null,
        logs: ['[System] Inicializando servidor Steam...'],
        collectedCardsDetails: [] as { image: string, title: string, minPrice: string }[]
    };"""
content = content.replace(old_botstate, new_botstate)

# 2. Update startCheckTimer to use checkInterval
old_timer = """    public startCheckTimer() {
      if (this.checkTimeoutId) clearTimeout(this.checkTimeoutId);
      this.botState.nextCheckTime = Date.now() + 30 * 60 * 1000;
      this.checkTimeoutId = setTimeout(() => this.checkBadgesAndFarm(), 30 * 60 * 1000);
    }"""
new_timer = """    public startCheckTimer() {
      if (this.checkTimeoutId) clearTimeout(this.checkTimeoutId);
      this.botState.nextCheckTime = Date.now() + this.botState.checkInterval;
      this.checkTimeoutId = setTimeout(() => this.checkBadgesAndFarm(), this.botState.checkInterval);
    }"""
content = content.replace(old_timer, new_timer)

# 3. Update checkBadgesAndFarm logic to respect pausedGames
old_badges = """              if (drops > 0) {
                this.botState.availableGamesToFarm.push({ appId, drops, name });
                totalDrops += drops;
              }
            }
          });
          this.botState.gamesWithDrops = this.botState.availableGamesToFarm.length;
          const oldDrops = this.botState.inventoryValue;
          this.botState.inventoryValue = totalDrops;"""

new_badges = """              if (drops > 0) {
                if (this.botState.pausedGames.some(g => g.appId === appId)) {
                  const pg = this.botState.pausedGames.find(g => g.appId === appId);
                  if (pg) pg.drops = drops;
                } else {
                  this.botState.availableGamesToFarm.push({ appId, drops, name });
                  totalDrops += drops;
                }
              } else {
                this.botState.pausedGames = this.botState.pausedGames.filter(g => g.appId !== appId);
              }
            }
          });
          this.botState.gamesWithDrops = this.botState.availableGamesToFarm.length;
          const oldDrops = this.botState.inventoryValue;
          this.botState.inventoryValue = totalDrops;"""
content = content.replace(old_badges, new_badges)

# 4. Modify /api/farm-stop to handle pausedGames
old_stop = """  if (appId) {
    session.botState.activeAppIds = session.botState.activeAppIds.filter(id => id !== appId);
    if (session.botState.activeAppIds.length > 0) {
      session.client.gamesPlayed(session.botState.activeAppIds);
      session.botState.currentFarm = `Farmando ${session.botState.activeAppIds.length} jogo${session.botState.activeAppIds.length > 1 ? 's' : ''}`;
      session.addLog(`Farm parado para o jogo ${appId}. Farmando os demais...`);
    } else {
      session.botState.isManualPaused = true;
      if (session.checkTimeoutId) clearTimeout(session.checkTimeoutId);
      session.botState.nextCheckTime = 0;
      session.botState.farmingStartTime = null;
      session.client.gamesPlayed([]);
      session.botState.currentFarm = 'Pausado Manualmente';
      session.addLog(`Farm parado para o jogo ${appId}. Nenhum outro jogo na lista.`);
    }
  } else {"""

new_stop = """  if (appId) {
    // Adicionar à lista de pausados
    const gameToPause = session.botState.availableGamesToFarm.find(g => g.appId === appId) || session.botState.allBadges.find(g => g.appId === appId);
    if (gameToPause && !session.botState.pausedGames.some(g => g.appId === appId)) {
      session.botState.pausedGames.push({ appId: gameToPause.appId, name: gameToPause.name, drops: gameToPause.drops });
    }
    // Remover do availableGamesToFarm
    session.botState.availableGamesToFarm = session.botState.availableGamesToFarm.filter(g => g.appId !== appId);
    // Atualizar total drops
    session.botState.inventoryValue = session.botState.availableGamesToFarm.reduce((acc, g) => acc + g.drops, 0);

    session.botState.activeAppIds = session.botState.activeAppIds.filter(id => id !== appId);
    if (session.botState.activeAppIds.length > 0) {
      session.client.gamesPlayed(session.botState.activeAppIds);
      session.botState.currentFarm = `Farmando ${session.botState.activeAppIds.length} jogo${session.botState.activeAppIds.length > 1 ? 's' : ''}`;
      session.addLog(`Farm parado para o jogo ${appId}. Farmando os demais...`);
    } else {
      session.botState.isManualPaused = true;
      if (session.checkTimeoutId) clearTimeout(session.checkTimeoutId);
      session.botState.nextCheckTime = 0;
      session.botState.farmingStartTime = null;
      session.client.gamesPlayed([]);
      session.botState.currentFarm = 'Pausado Manualmente';
      session.addLog(`Farm parado para o jogo ${appId}. Nenhum outro jogo na lista.`);
    }
  } else {"""
content = content.replace(old_stop, new_stop)

# 5. Add endpoint to resume single app and update check interval
endpoints = """
app.post('/api/farm-resume-app', (req, res) => {
  const session = getSession(req);
  const { appId } = req.body;
  if (appId && session.botState.isClientLoggedIn) {
    session.botState.pausedGames = session.botState.pausedGames.filter(g => g.appId !== appId);
    session.botState.isManualPaused = false;
    session.checkBadgesAndFarm();
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Falha ao retomar o app.' });
  }
});

app.post('/api/set-check-interval', (req, res) => {
  const session = getSession(req);
  const { intervalMs } = req.body;
  if (intervalMs && typeof intervalMs === 'number') {
    session.botState.checkInterval = intervalMs;
    // Restart timer if currently running
    if (session.checkTimeoutId && !session.botState.isManualPaused) {
      session.startCheckTimer();
    }
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Intervalo inválido.' });
  }
});
"""

content = content.replace("app.post('/api/farm-resume', (req, res) => {", endpoints + "\napp.post('/api/farm-resume', (req, res) => {")

with open('server.ts', 'w') as f:
    f.write(content)
