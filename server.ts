
import { recordUserActivity, recordCardsDropped, loadStats, updateUserStatus } from "./adminStats";
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import SteamUser from 'steam-user';
import SteamCommunity from 'steamcommunity';
import * as cheerio from 'cheerio';
import { loadSession, saveSession } from "./session";

class SteamBotSession {
    public client = new SteamUser();
    public community = new SteamCommunity();
    public sessionId: string;
    
    public checkTimeoutId: NodeJS.Timeout | null = null;
    
    public steamGuardCallback: any = null;

    public botState = {
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
    };

    constructor(sessionId: string) {
        this.sessionId = sessionId;
        this.setupEvents();
    }

    public addLog(msg: string) {
        const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        this.botState.logs.push(`[${timestamp}] ${msg}`);
        if (this.botState.logs.length > 50) this.botState.logs.shift();
    }

    public saveCurrentSession() {
        saveSession(this.sessionId, {
            refreshToken: this.botState.refreshToken,
            cardsDropped: this.botState.cardsDropped,
            collectedCardsDetails: this.botState.collectedCardsDetails
        });
    }

    public async loadData() {
        const sessionData = await loadSession(this.sessionId);
        this.botState.refreshToken = sessionData.refreshToken || '';
        this.botState.cardsDropped = sessionData.cardsDropped || 0;
        this.botState.collectedCardsDetails = sessionData.collectedCardsDetails || [];
    }

    // Insert parseDropsCount here
    public parseDropsCount(text: string): number {
      let cleanText = text.toLowerCase();
      cleanText = cleanText.replace(/\d+\s*(?:de|of)\s*\d+\s*(?:cartas|cards)?(?:\s*colecionadas|\s*collected)?/g, '');
      cleanText = cleanText.replace(/\d+\s*(?:cartas|cards)\s*(?:colecionadas|collected)/g, '');
      cleanText = cleanText.replace(/(?:cartas colecionadas|cards collected)\s*:\s*\d+/g, '');
      const noDropsPhrases = ['não dará mais', 'não dará', 'no card drops remaining', 'no card drops', 'no more cards', 'sem drops', '0 drops remaining', '0 card drops'];
      for (const phrase of noDropsPhrases) {
        if (cleanText.includes(phrase)) return 0;
      }
      const ptMoreMatch = cleanText.match(/(?:pode obter mais|pode dar mais|restam|restantes|obter mais)\s*(\d+)/);
      if (ptMoreMatch) return parseInt(ptMoreMatch[1], 10);
      const enMoreMatch = cleanText.match(/(\d+)\s*(?:card\s*drops?|drops?|remaining)/);
      if (enMoreMatch) return parseInt(enMoreMatch[1], 10);
      const genericMatch = cleanText.match(/(\d+)\s*(?:cartas?|cards?|drops?)/);
      if (genericMatch) return parseInt(genericMatch[1], 10);
      return 0;
    }

    public startCheckTimer() {
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
    }

    public checkBadgesAndFarm() {
      if (!this.botState.isClientLoggedIn) {
        this.addLog('[Erro] Tentou verificar badges sem estar logado.');
        return;
      }
      this.addLog('Iniciando verificação de insígnias e cartas disponíveis...');
      
      this.community.request({
        uri: 'https://steamcommunity.com/my/badges',
        headers: { 'Cookie': (this.community._cookies || []).join('; ') }
      }, (err: any, response: any, body: any) => {
        if (err) {
          this.addLog(`[Erro] Falha ao acessar página de badges: ${err.message}`);
            this.startCheckTimer();
            return;
          }
          const $ = cheerio.load(body);
          this.botState.allBadges = [];
          this.botState.availableGamesToFarm = [];
          let totalDrops = 0;
          $('.badge_row').each((i: number, el: any) => {
            const row = $(el);
            let link = row.find('a.badge_row_overlay').attr('href');
            let appId = 0;
            if (link) {
              const match = link.match(/\/gamecards\/(\d+)/);
              if (match) appId = parseInt(match[1], 10);
            }
            const name = row.find('.badge_title').text().replace(/&nbsp;/g, '').trim().split('\n')[0].trim();
            const text = row.find('.progress_info_bold').text().trim();
            let drops = 0;
            if (text) drops = this.parseDropsCount(text);
            if (appId > 0) {
              this.botState.allBadges.push({ appId, name, drops, text });
              if (drops > 0) {
                this.botState.availableGamesToFarm.push({ appId, drops, name });
                totalDrops += drops;
              }
            }
          });
          this.botState.gamesWithDrops = this.botState.availableGamesToFarm.length;
          const oldDrops = this.botState.inventoryValue;
          this.botState.inventoryValue = totalDrops;
          if (oldDrops > totalDrops && oldDrops !== 0 && this.botState.activeAppIds.length > 0) {
            const diff = oldDrops - totalDrops;
            this.botState.cardsDropped += diff;
            this.addLog(`[Sucesso] ${diff} carta(s) dropada(s)! Total na sessão: ${this.botState.cardsDropped}`);
            if (this.client.steamID) {
               recordCardsDropped(this.client.steamID.getSteamID64().toString(), diff);
            }
            this.saveCurrentSession();
          }
          if (this.botState.availableGamesToFarm.length > 0) {
            const gamesToPlay = this.botState.availableGamesToFarm.map((g: any) => g.appId);
            this.botState.activeAppIds = gamesToPlay;
            this.botState.currentFarm = `Farmando ${gamesToPlay.length} jogo(s)`;
            this.addLog(`Iniciando farm para ${gamesToPlay.length} jogo(s)... (${totalDrops} cartas restantes)`);
            this.client.gamesPlayed(gamesToPlay);
          } else {
            this.botState.currentFarm = 'Concluído (0 cartas)';
            this.botState.activeAppIds = [];
            this.addLog('Nenhuma carta disponível para farmar.');
            this.client.gamesPlayed([]);
          }
          this.startCheckTimer();
        });
    }

    public setupEvents() {
        this.client.on('refreshToken', (token) => {
          this.botState.refreshToken = token; this.saveCurrentSession();
          this.addLog('Sessão Steam salva com sucesso (Refresh Token).');
        });

        this.client.on('steamGuard', (domain, callback, lastCodeWrong) => {
          this.botState.steamGuardRequired = true;
          this.botState.steamGuardDomain = domain || 'Mobile App';
          if (lastCodeWrong) {
            this.addLog('Último código Steam Guard estava incorreto. Tente novamente.');
          } else {
            this.addLog(`Steam Guard requerido (${domain ? 'Email: ' + domain : 'Mobile App'}). Aguardando código...`);
          }
          this.steamGuardCallback = callback;
        });

        this.client.on('loggedOn', (details) => {
          this.botState.isClientLoggedIn = true;
          this.addLog('Conectado à rede Steam com sucesso!');
          this.client.setPersona(SteamUser.EPersonaState.Online);
          this.botState.personaStateString = 'Online';
          const mySteamID = this.client.steamID;
          if (mySteamID) {
            this.client.getPersonas([mySteamID], (err, personas) => {
              if (!err && personas && personas[mySteamID.getSteamID64()]) {
                const persona = personas[mySteamID.getSteamID64()];
                this.botState.username = persona.player_name;
                if (persona.avatar_url) {
                  this.botState.avatar = persona.avatar_url;
                } else if (persona.avatar_hash) {
                  const hash = persona.avatar_hash.toString('hex');
                  this.botState.avatar = `https://avatars.akamai.steamstatic.com/${hash}_full.jpg`;
                }
              }
            });
          }
          this.addLog('Autenticando sessão web para verificar insígnias...');
        });

        this.client.on('playingState', (blocked, playingApp) => {
          this.addLog(`[System] Estado de jogo atualizado: blocked=${blocked}, playingApp=${playingApp}`);
          if (blocked) {
            this.botState.isPausedForPlaying = true;
            this.addLog(`[System] O farming foi pausado porque você está jogando em outro dispositivo (AppID: ${playingApp}).`);
            this.client.gamesPlayed([]);
            this.botState.activeAppIds = [];
            this.botState.currentFarm = 'Pausado (Jogando outro jogo)';
          } else if (this.botState.isPausedForPlaying) {
            this.botState.isPausedForPlaying = false;
            if (this.botState.isManualPaused) {
              this.addLog(`[System] Você parou de jogar no outro dispositivo. Farming mantido pausado conforme solicitado manualmente.`);
              this.botState.currentFarm = 'Pausado Manualmente';
            } else {
              this.addLog(`[System] Você parou de jogar no outro dispositivo. Retomando o farming automático...`);
              this.checkBadgesAndFarm();
            }
          }
        });

        this.client.on('webSession', (sessionid, cookies) => {
          this.addLog('Sessão web obtida. Verificando cartas disponíveis...');
          this.community.setCookies(cookies);
          this.checkBadgesAndFarm();
        });

        this.client.on('persona', (steamID, persona) => {
          if (this.client.steamID && steamID.getSteamID64() === this.client.steamID.getSteamID64()) {
            this.botState.username = persona.player_name;
            if (persona.avatar_url) {
              this.botState.avatar = persona.avatar_url;
            } else if (persona.avatar_hash) {
              const hash = persona.avatar_hash.toString('hex');
              this.botState.avatar = `https://avatars.akamai.steamstatic.com/${hash}_full.jpg`;
            }
            const states = ['Offline', 'Online', 'Busy', 'Away', 'Snooze', 'Looking to Trade', 'Looking to Play', 'Invisible'];
            const stateIndex = persona.persona_state !== undefined ? persona.persona_state : 0;
            this.botState.personaStateString = states[stateIndex] || 'Online';
          }
        });

        this.client.on('appOwnershipCached', () => {
          if (this.client.ownedApps) {
            this.botState.gamesOwned = this.client.ownedApps.length;
          }
        });

        this.client.on('newItems', (count) => {
          if (count > 0) {
            this.addLog(`[Notificação] ${count} novos itens detectados no inventário Steam! Atualizando status do farm...`);
            setTimeout(() => {
              if (this.botState.isClientLoggedIn) {
                this.checkBadgesAndFarm();
              }
            }, 5000);
          }
        });

        this.client.on('error', (err) => {
          this.botState.isClientLoggedIn = false;
          this.addLog(`[Erro Cliente] ${err.message}`);
          if (err.message.includes('InvalidPassword') || err.message.includes('AccessDenied') || err.message.includes('RateLimitExceeded') || err.message.includes('LogonSessionReplaced')) {
            this.botState.refreshToken = ''; this.saveCurrentSession();
          }
        });

        this.client.on('disconnected', (eresult, msg) => {
          this.botState.isClientLoggedIn = false;
          this.addLog(`Desconectado. Motivo: ${msg || eresult}`);
        });
    }
}

const sessions = new Map<string, SteamBotSession>();

function getSession(req: any): SteamBotSession {
    let sid = req.headers['x-session-id'] as string;
    if (!sid) {
        sid = 'default';
    }
    if (!sessions.has(sid)) {
        const newSession = new SteamBotSession(sid);
        sessions.set(sid, newSession);
        // Fire and forget loading
        newSession.loadData();
    }
    return sessions.get(sid)!;
}

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/api/status', async (req, res) => {
  const session = getSession(req);
  let isAdmin = false;
  let isBanned = false;
  
  if (session.botState.isClientLoggedIn && session.client.steamID) {
    try {
      const mySteamID64 = session.client.steamID.getSteamID64();
      const cachedPersona = session.client.users[mySteamID64];
      if (cachedPersona) {
        if (cachedPersona.player_name) {
          session.botState.username = cachedPersona.player_name;
        }
        if (cachedPersona.avatar_url) {
          session.botState.avatar = cachedPersona.avatar_url;
        } else if (cachedPersona.avatar_hash) {
          const hash = cachedPersona.avatar_hash.toString('hex');
          session.botState.avatar = `https://avatars.akamai.steamstatic.com/${hash}_full.jpg`;
        }
        
        const states = ['Offline', 'Online', 'Busy', 'Away', 'Snooze', 'Looking to Trade', 'Looking to Play', 'Invisible'];
        const stateIndex = cachedPersona.persona_state !== undefined ? cachedPersona.persona_state : 0;
        session.botState.personaStateString = states[stateIndex] || 'Online';
        await recordUserActivity(mySteamID64.toString(), session.botState.username, session.botState.avatar);
      }
      
      const stats = await loadStats();
      const userStats = stats.users[mySteamID64.toString()];
      if (userStats) {
        isAdmin = userStats.isAdmin || false;
        isBanned = userStats.isBanned || false;
      }
      
      if (isBanned && session.botState.isClientLoggedIn) {
        session.client.logOff();
        session.botState.refreshToken = ''; session.saveCurrentSession();
        session.botState.isClientLoggedIn = false;
        session.botState.currentFarm = 'Banned';
        session.botState.activeAppIds = [];
        session.botState.avatar = '';
        session.addLog('Sessão encerrada (Usuário banido).');
      }
    } catch (e) {
      // Ignore
    }
  }
  res.json({ ...session.botState, isAdmin, isBanned });
});

app.post('/api/login-client', (req, res) => {
  const session = getSession(req);
  const { accountName, password, twoFactorCode, refreshToken } = req.body;
  
  if (!accountName && !refreshToken) {
    return res.status(400).json({ error: 'Conta ou Refresh Token necessários para conectar.' });
  }
  const logOnOptions: any = {};
  if (refreshToken) {
    session.addLog('Iniciando conexão CM via Refresh Token (Sessão Salva)...');
    logOnOptions.refreshToken = refreshToken;
  } else {
    session.addLog(`Iniciando conexão CM para usuário: ${accountName}...`);
    logOnOptions.accountName = accountName;
    logOnOptions.password = password;
    logOnOptions.rememberPassword = true;
    logOnOptions.machineName = 'CardHarvester';
    if (twoFactorCode) {
      logOnOptions.twoFactorCode = twoFactorCode;
      session.addLog('Usando código Steam Guard fornecido...');
    }
  }
  try {
    session.client.logOn(logOnOptions);
  } catch (e: any) {
    session.addLog(`[Erro] Falha ao iniciar login: ${e.message}`);
    return res.status(400).json({ error: e.message });
  }
  res.json({ success: true, message: 'Tentando logar no Client Matrix...' });
});

app.post('/api/farm-stop', (req, res) => {
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
});

app.post('/api/farm-auto', (req, res) => {
  const session = getSession(req);
  if (session.botState.isPausedForPlaying) {
    return res.status(400).json({ error: 'O farming está pausado porque você está jogando em outro dispositivo. Feche o jogo primeiro.' });
  }
  if (session.botState.isClientLoggedIn) {
    session.botState.isManualPaused = false;
    session.checkBadgesAndFarm();
    res.json({ success: true, message: 'Verificação de insígnias iniciada.' });
  } else {
    res.status(400).json({ error: 'Não foi possível iniciar. Verifique se está logado.' });
  }
});

app.post('/api/farm-manual', (req, res) => {
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
});

app.post('/api/steam-guard', (req, res) => {
  const session = getSession(req);
  const { code } = req.body;
  if (session.steamGuardCallback) {
    session.steamGuardCallback(code);
    session.steamGuardCallback = null;
    session.botState.steamGuardRequired = false;
    session.botState.steamGuardDomain = '';
    session.addLog('Código Steam Guard enviado. Verificando...');
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Nenhum código Steam Guard pendente' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  const session = getSession(req);
  const stats = await loadStats();
  if (!session.client.steamID || !stats.users[session.client.steamID.getSteamID64().toString()]?.isAdmin) {
    return res.status(403).json({ error: 'Acesso negado. Apenas o administrador pode ver esta página.' });
  }
  res.json(stats);
});

app.post('/api/admin/update-user', async (req, res) => {
  const session = getSession(req);
  const stats = await loadStats();
  if (!session.client.steamID || !stats.users[session.client.steamID.getSteamID64().toString()]?.isAdmin) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }
  const { steamId, isAdmin, isBanned } = req.body;
  if (!steamId) return res.status(400).json({ error: 'SteamID is required' });
  
  await updateUserStatus(steamId, { isAdmin, isBanned });
  res.json({ success: true });
});

app.post('/api/logout', (req, res) => {
  const session = getSession(req);
  if (session.botState.isClientLoggedIn) {
    session.client.logOff();
  }
  session.botState.refreshToken = ''; session.saveCurrentSession();
  session.botState.isClientLoggedIn = false;
  session.botState.currentFarm = 'None';
  session.botState.activeAppIds = [];
  session.botState.avatar = '';
  session.botState.username = '';
  session.addLog('Sessão encerrada (Logout).');
  res.json({ success: true });
});


// Vite Middleware & Startup
async function startServer() {
  // Preload default session or don't load any?
  // We don't auto-login here anymore, we let the frontend send X-Session-ID on first fetch.

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}
startServer();

