import re

with open('server.ts', 'r') as f:
    code = f.read()

# Replace botState initialization
old_botstate = """let botState = {
  isClientLoggedIn: false,
  currentFarm: 'None',
  cardsDropped: loadSession().cardsDropped || 0,
  inventoryValue: 0,
  gamesOwned: 0,
  gamesWithDrops: 0,
  isPausedForPlaying: false,
  isManualPaused: false,
  availableGamesToFarm: [] as { appId: number, drops: number, name: string }[],
  allBadges: [] as { appId: number, name: string, drops: number, text: string }[],
  avatar: '',
  username: '',
  personaStateString: 'Offline',
  steamGuardRequired: false,
  steamGuardDomain: '',
  refreshToken: loadSession().refreshToken,
  activeAppIds: [] as number[],
  nextCheckTime: 0,
  logs: ['[System] Inicializando servidor Steam...'],
  collectedCardsDetails: loadSession().collectedCardsDetails || [] as { image: string, title: string, minPrice: string }[]
};"""

new_botstate = """let botState = {
  isClientLoggedIn: false,
  currentFarm: 'None',
  cardsDropped: 0,
  inventoryValue: 0,
  gamesOwned: 0,
  gamesWithDrops: 0,
  isPausedForPlaying: false,
  isManualPaused: false,
  availableGamesToFarm: [] as { appId: number, drops: number, name: string }[],
  allBadges: [] as { appId: number, name: string, drops: number, text: string }[],
  avatar: '',
  username: '',
  personaStateString: 'Offline',
  steamGuardRequired: false,
  steamGuardDomain: '',
  refreshToken: '',
  activeAppIds: [] as number[],
  nextCheckTime: 0,
  logs: ['[System] Inicializando servidor Steam...'],
  collectedCardsDetails: [] as { image: string, title: string, minPrice: string }[]
};"""

code = code.replace(old_botstate, new_botstate)

# Replace startServer to include loadSession
old_start = """async function startServer() {"""
new_start = """async function startServer() {
  const sessionData = await loadSession();
  botState.refreshToken = sessionData.refreshToken || '';
  botState.cardsDropped = sessionData.cardsDropped || 0;
  botState.collectedCardsDetails = sessionData.collectedCardsDetails || [];
"""
code = code.replace(old_start, new_start)

# app.get('/api/status' to async
code = code.replace("app.get('/api/status', (req, res) => {", "app.get('/api/status', async (req, res) => {")

# recordUserActivity to await
code = code.replace("recordUserActivity(mySteamID64.toString(), botState.username, botState.avatar);", "await recordUserActivity(mySteamID64.toString(), botState.username, botState.avatar);")

# loadStats in /api/status to await
code = code.replace("const stats = loadStats();", "const stats = await loadStats();")

# recordCardsDropped to await
code = code.replace("if (client.steamID) recordCardsDropped(client.steamID.getSteamID64(), difference);", "if (client.steamID) await recordCardsDropped(client.steamID.getSteamID64(), difference);")

# updateUserStatus to await
code = code.replace("updateUserStatus(steamId, { isAdmin, isBanned });", "await updateUserStatus(steamId, { isAdmin, isBanned });")

# /api/admin/stats to async
code = code.replace("app.get('/api/admin/stats', (req, res) => {", "app.get('/api/admin/stats', async (req, res) => {")

# /api/admin/users/:steamId to async
code = code.replace("app.post('/api/admin/users/:steamId', express.json(), (req, res) => {", "app.post('/api/admin/users/:steamId', express.json(), async (req, res) => {")

with open('server.ts', 'w') as f:
    f.write(code)
