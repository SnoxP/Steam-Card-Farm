import { recordUserActivity, recordCardsDropped, loadStats, updateUserStatus } from "./adminStats";
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import SteamUser from 'steam-user';
import SteamCommunity from 'steamcommunity';
import * as cheerio from 'cheerio';

import { loadSession, saveSession } from "./session";

const app = express();
const PORT = 3000;

app.use(express.json());

// Singleton Steam instances for this session (since it's a personal applet)
const client = new SteamUser();
const community = new SteamCommunity();

let botState = {
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

function addLog(msg: string) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  botState.logs.push(`[${timestamp}] ${msg}`);
  if (botState.logs.length > 50) botState.logs.shift();
}

// API Routes
app.get('/api/status', async (req, res) => {
  let isAdmin = false;
  let isBanned = false;
  
  if (botState.isClientLoggedIn && client.steamID) {
    try {
      const mySteamID64 = client.steamID.getSteamID64();
      const cachedPersona = client.users[mySteamID64];
      if (cachedPersona) {
        if (cachedPersona.player_name) {
          botState.username = cachedPersona.player_name;
        }
        if (cachedPersona.avatar_url) {
          botState.avatar = cachedPersona.avatar_url;
        } else if (cachedPersona.avatar_hash) {
          const hash = cachedPersona.avatar_hash.toString('hex');
          botState.avatar = `https://avatars.akamai.steamstatic.com/${hash}_full.jpg`;
        }
        
        const states = ['Offline', 'Online', 'Busy', 'Away', 'Snooze', 'Looking to Trade', 'Looking to Play', 'Invisible'];
        const stateIndex = cachedPersona.persona_state !== undefined ? cachedPersona.persona_state : 0;
        botState.personaStateString = states[stateIndex] || 'Online';
        await recordUserActivity(mySteamID64.toString(), botState.username, botState.avatar);
      }
      
      const stats = await loadStats();
      const userStats = stats.users[mySteamID64.toString()];
      if (userStats) {
        isAdmin = userStats.isAdmin || false;
        isBanned = userStats.isBanned || false;
      }
      
      // Auto-logout if banned
      if (isBanned && botState.isClientLoggedIn) {
        client.logOff();
        botState.refreshToken = ''; saveCurrentSession();
        botState.isClientLoggedIn = false;
        botState.currentFarm = 'Banned';
        botState.activeAppIds = [];
        botState.avatar = '';
        addLog('Sessão encerrada (Usuário banido).');
      }
    } catch (e) {
      // Ignore cache retrieval errors
    }
  }
  res.json({ ...botState, isAdmin, isBanned });
});

// Endpoint para login Cliente (Farm real)
app.post('/api/login-client', (req, res) => {
  const { accountName, password, twoFactorCode, refreshToken } = req.body;
  
  if (!accountName && !refreshToken) {
    return res.status(400).json({ error: 'Conta ou Refresh Token necessários para conectar.' });
  }

  const logOnOptions: any = {};

  if (refreshToken) {
    addLog('Iniciando conexão CM via Refresh Token (Sessão Salva)...');
    logOnOptions.refreshToken = refreshToken;
  } else {
    addLog(`Iniciando conexão CM para usuário: ${accountName}...`);
    logOnOptions.accountName = accountName;
    logOnOptions.password = password;
    logOnOptions.rememberPassword = true;
    logOnOptions.machineName = 'CardHarvester';
    if (twoFactorCode) {
      logOnOptions.twoFactorCode = twoFactorCode;
      addLog('Usando código Steam Guard fornecido...');
    }
  }

  client.logOn(logOnOptions);

  res.json({ success: true, message: 'Tentando logar no Client Matrix...' });
});

// Parsing & Farm Helpers
function parseDropsCount(text: string): number {
  let cleanText = text.toLowerCase();
  
  // 1. Remove collected cards progress patterns so they don't interfere
  // e.g., "6 de 13 cartas colecionadas", "0 de 15 cartas colecionadas", "6 of 13 cards collected"
  cleanText = cleanText.replace(/\d+\s*(?:de|of)\s*\d+\s*(?:cartas|cards)?(?:\s*colecionadas|\s*collected)?/g, '');
  // e.g., "13 cartas colecionadas", "13 cards collected"
  cleanText = cleanText.replace(/\d+\s*(?:cartas|cards)\s*(?:colecionadas|collected)/g, '');
  // e.g., "cartas colecionadas: 13", "cards collected: 13"
  cleanText = cleanText.replace(/(?:cartas colecionadas|cards collected)\s*:\s*\d+/g, '');

  // 2. Check for explicit "no more drops" indicator phrases
  const noDropsPhrases = [
    'não dará mais',
    'não dará',
    'no card drops remaining',
    'no card drops',
    'no more cards',
    'sem drops',
    '0 drops remaining',
    '0 card drops'
  ];
  for (const phrase of noDropsPhrases) {
    if (cleanText.includes(phrase)) {
      return 0;
    }
  }

  // 3. Match positive card drop patterns
  // Portuguese patterns:
  // "pode obter mais 3 cartas", "pode dar mais 3 cartas"
  const ptMoreMatch = cleanText.match(/(?:pode obter mais|pode dar mais|restam|restantes|obter mais)\s*(\d+)/);
  if (ptMoreMatch) {
    return parseInt(ptMoreMatch[1], 10);
  }

  // English patterns:
  // "3 card drops remaining", "3 drops remaining", "3 remaining"
  const enMoreMatch = cleanText.match(/(\d+)\s*(?:card\s*drops?|drops?|remaining)/);
  if (enMoreMatch) {
    return parseInt(enMoreMatch[1], 10);
  }

  // Generic fallback: match any number of cards remaining
  // "3 cartas restantes", "3 cartas" (since we removed "X de Y cartas colecionadas" and "X cartas colecionadas")
  const genericMatch = cleanText.match(/(\d+)\s*(?:cartas?|cards?|drops?)/);
  if (genericMatch) {
    return parseInt(genericMatch[1], 10);
  }

  return 0;
}

let checkTimeoutId: NodeJS.Timeout | null = null;

function startCheckTimer() {
  if (checkTimeoutId) {
    clearTimeout(checkTimeoutId);
  }

  // Set the next check time to 15 minutes from now
  const interval = 15 * 60 * 1000;
  botState.nextCheckTime = Date.now() + interval;

  checkTimeoutId = setTimeout(() => {
    if (!botState.isClientLoggedIn) {
      startCheckTimer();
      return;
    }

    if (botState.isPausedForPlaying || botState.isManualPaused) {
      addLog('[Auto-Check] Verificando insígnias (farming está pausado)...');
      checkBadgesAndFarm();
      return;
    }

    if (botState.activeAppIds.length > 0) {
      addLog('[Auto-Check] Iniciando reinicialização periódica de jogos (reabrindo jogos para forçar drop de cartas)...');
      // Stop playing the games first
      client.gamesPlayed([]);
      
      // Wait 3 seconds to let Steam register the session close
      setTimeout(() => {
        if (botState.isClientLoggedIn) {
          addLog('[Auto-Check] Reabrindo jogos e verificando insígnias...');
          checkBadgesAndFarm();
        } else {
          startCheckTimer();
        }
      }, 3000);
    } else {
      addLog('[Auto-Check] Nenhuma sessão ativa. Verificando insígnias...');
      checkBadgesAndFarm();
    }
  }, interval);
}

function checkBadgesAndFarm() {
  addLog('Carregando página de insígnias...');
  community.request('https://steamcommunity.com/my/badges/', async (err, response, body) => {
    if (err || response.statusCode !== 200) {
      addLog(`[Erro Insígnias] Falha ao ler página de insígnias. Status: ${response?.statusCode}`);
      // Reschedule so the loop doesn't break
      startCheckTimer();
      return;
    }
    
    addLog(`Página de insígnias carregada. Tamanho do HTML: ${body.length} bytes.`);
    const gamesToFarmList: { appId: number, drops: number, name: string }[] = [];
    const allBadgesList: { appId: number, name: string, drops: number, text: string }[] = [];
    let totalDrops = 0;
    
    const $ = cheerio.load(body);
    const rows = $('.badge_row');
    addLog(`Encontradas ${rows.length} linhas de insígnias para analisar.`);
    
    rows.each((i, elem) => {
      // Find the link to gamecards
      const cardLink = $(elem).find('a[href*="/gamecards/"]').first().attr('href');
      if (!cardLink) return;
      
      const appIdMatch = cardLink.match(/gamecards\/(\d+)/);
      if (!appIdMatch) return;
      const appId = parseInt(appIdMatch[1], 10);
      
      // Find the game name by checking .badge_title
      const titleClone = $(elem).find('.badge_title').clone();
      titleClone.find('*').remove(); // remove children like span, etc.
      const name = titleClone.text().replace(/&nbsp;/g, '').replace(/\s+/g, ' ').trim() || "Unknown Game";
      
      // Find progress text
      const progressText = $(elem).find('[class*="progress_info"]').text().replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      const drops = parseDropsCount(progressText);
      
      allBadgesList.push({ appId, name, drops, text: progressText });
      
      if (drops > 0) {
        addLog(`[Detecção] AppID ${appId} ("${name}") -> ${drops} cartas restantes.`);
        gamesToFarmList.push({ appId, drops, name });
        totalDrops += drops;
      }
    });
    
    // Calculate difference in remaining card drops to increment cardsDropped counter
    let prevTotalDrops = 0;
    if (botState.allBadges && botState.allBadges.length > 0) {
      botState.allBadges.forEach(b => {
        prevTotalDrops += (b.drops || 0);
      });
    }

    botState.allBadges = allBadgesList;
    botState.gamesWithDrops = gamesToFarmList.length;
    botState.availableGamesToFarm = gamesToFarmList;
    
    if (prevTotalDrops > 0 && totalDrops < prevTotalDrops) {
      const difference = prevTotalDrops - totalDrops;
      botState.cardsDropped += difference; saveCurrentSession();
      addLog(`[Coleta] Sucesso! ${difference} nova(s) carta(s) coletada(s)/dropada(s)!`);
      if (client.steamID) await recordCardsDropped(client.steamID.getSteamID64(), difference);
      
      // Fetch new cards from inventory
      if (client.steamID) {
        community.getUserInventoryContents(client.steamID, 753, 6, true, (err: any, inventory: any) => {
          if (!err && inventory) {
            const cards = inventory.filter((item: any) => item.tags && item.tags.some((tag: any) => tag.category === 'item_class' && tag.internal_name === 'item_class_2'));
            
            // Sort by id descending
            cards.sort((a: any, b: any) => {
               const idA = BigInt(a.assetid || a.id);
               const idB = BigInt(b.assetid || b.id);
               return idA < idB ? 1 : -1;
            });
            
            const newCards = cards.slice(0, difference);
            newCards.forEach((card: any) => {
              const title = card.name;
              const image = card.getImageURL ? card.getImageURL() : `https://community.cloudflare.steamstatic.com/economy/image/${card.icon_url}`;
              const hashName = encodeURIComponent(card.market_hash_name || card.name);
              
              // Get price
              community.request(`https://steamcommunity.com/market/priceoverview/?appid=753&currency=7&market_hash_name=${hashName}`, (errPrice: any, resPrice: any, bodyPrice: any) => {
                let minPrice = 'N/A';
                if (!errPrice && resPrice?.statusCode === 200) {
                  try {
                    const priceData = JSON.parse(bodyPrice);
                    if (priceData.lowest_price) minPrice = priceData.lowest_price;
                  } catch(e) {}
                }
                
                botState.collectedCardsDetails.unshift({
                  image,
                  title,
                  minPrice
                });
                
                if (botState.collectedCardsDetails.length > 50) {
                  botState.collectedCardsDetails.length = 50;
                }
                saveCurrentSession();
              });
            });
          }
        });
      }
    }
    
    if (gamesToFarmList.length > 0) {
      addLog(`Encontrados ${gamesToFarmList.length} jogos com cartas (Total de ${totalDrops} drops restantes).`);
      if (botState.isPausedForPlaying) {
        addLog(`Farming não iniciado porque você está jogando em outro dispositivo.`);
        botState.currentFarm = 'Pausado (Jogando outro jogo)';
      } else if (botState.isManualPaused) {
        addLog(`Farming não iniciado porque está pausado manualmente.`);
        botState.currentFarm = 'Pausado Manualmente';
      } else {
        const appsToFarm = gamesToFarmList.slice(0, 32).map(g => g.appId); // Max 32 games at once
        addLog(`Iniciando farm nos jogos: ${appsToFarm.join(', ')}...`);
        client.gamesPlayed(appsToFarm);
        botState.currentFarm = `${appsToFarm.length} jogos ativos`;
        botState.activeAppIds = appsToFarm;
      }
    } else {
      addLog('Nenhuma carta restante para dropar neste momento.');
      client.gamesPlayed([]);
      botState.currentFarm = 'None';
      botState.activeAppIds = [];
    }

    // Always reset/start the check timer when we successfully parse badges
    startCheckTimer();
  });
}

app.post('/api/farm-stop', (req, res) => {
  const { appId } = req.body;
  if (botState.isClientLoggedIn) {
    if (appId) {
      const idToStop = parseInt(appId, 10);
      if (!isNaN(idToStop)) {
        botState.activeAppIds = botState.activeAppIds.filter(id => id !== idToStop);
        client.gamesPlayed(botState.activeAppIds);
        if (botState.activeAppIds.length > 0) {
          botState.currentFarm = `${botState.activeAppIds.length} jogos ativos`;
          addLog(`Farming do AppID ${idToStop} parado. Jogos restantes: ${botState.activeAppIds.join(', ')}`);
        } else {
          botState.currentFarm = 'None';
          addLog(`Farming do AppID ${idToStop} parado. Nenhum jogo em execução.`);
        }
        
        setTimeout(() => {
          if (botState.isClientLoggedIn) {
            addLog(`[Auto-Check] Verificando insígnias pós-fechamento do AppID ${idToStop}...`);
            checkBadgesAndFarm();
          }
        }, 5000);
      }
    } else {
      client.gamesPlayed([]);
      botState.currentFarm = 'Pausado Manualmente';
      botState.activeAppIds = [];
      botState.isManualPaused = true;
      addLog('Farming pausado manualmente. Todas as sessões de jogo foram fechadas.');
      
      // Quando fechamos um jogo, a Steam frequentemente dropa uma carta imediatamente.
      // Vamos verificar as insígnias após 5 segundos para garantir que pegamos essa atualização.
      setTimeout(() => {
        if (botState.isClientLoggedIn) {
          addLog('[Auto-Check] Verificando insígnias pós-pausa para contabilizar possíveis drops recentes...');
          checkBadgesAndFarm();
        }
      }, 5000);
    }
  }
  res.json({ success: true });
});

app.post('/api/farm-auto', (req, res) => {
  if (botState.isClientLoggedIn) {
    botState.isManualPaused = false;
    checkBadgesAndFarm();
    res.json({ success: true, message: 'Verificação de insígnias iniciada.' });
  } else {
    res.status(400).json({ error: 'Não foi possível iniciar. Verifique se está logado.' });
  }
});

app.post('/api/farm-manual', (req, res) => {
  const { appId } = req.body;
  if (!appId) return res.status(400).json({ error: 'AppID is required' });
  
  if (botState.isPausedForPlaying) {
    return res.status(400).json({ error: 'O farming está pausado porque você está jogando em outro dispositivo. Feche o jogo primeiro.' });
  }

  const appIds = appId.split(',').map((id: string) => parseInt(id.trim(), 10)).filter((id: number) => !isNaN(id));
  
  if (appIds.length > 0 && botState.isClientLoggedIn) {
    botState.isManualPaused = false;
    client.gamesPlayed(appIds);
    botState.currentFarm = `${appIds.length} manual games (${appIds.join(', ')})`;
    botState.activeAppIds = appIds;
    addLog(`Farming manual iniciado para AppIDs: ${appIds.join(', ')}`);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Não foi possível iniciar o farm manual. Verifique se está logado e o AppID é válido.' });
  }
});

app.post('/api/steam-guard', (req, res) => {
  const { code } = req.body;
  if (app.locals.steamGuardCallback) {
    app.locals.steamGuardCallback(code);
    app.locals.steamGuardCallback = null;
    botState.steamGuardRequired = false;
    botState.steamGuardDomain = '';
    addLog('Código Steam Guard enviado. Verificando...');
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Nenhum código Steam Guard pendente' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  const stats = await loadStats();
  if (!client.steamID || !stats.users[client.steamID.getSteamID64().toString()]?.isAdmin) {
    return res.status(403).json({ error: 'Acesso negado. Apenas o administrador pode ver esta página.' });
  }
  res.json(stats);
});

app.post('/api/admin/update-user', async (req, res) => {
  const stats = await loadStats();
  if (!client.steamID || !stats.users[client.steamID.getSteamID64().toString()]?.isAdmin) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }
  const { steamId, isAdmin, isBanned } = req.body;
  if (!steamId) return res.status(400).json({ error: 'SteamID is required' });
  
  await updateUserStatus(steamId, { isAdmin, isBanned });
  res.json({ success: true });
});

app.post('/api/logout', (req, res) => {
  if (botState.isClientLoggedIn) {
    client.logOff();
  }
  botState.refreshToken = ''; saveCurrentSession();
  botState.isClientLoggedIn = false;
  botState.currentFarm = 'None';
  botState.activeAppIds = [];
  botState.avatar = '';
  botState.username = '';
  addLog('Sessão encerrada (Logout).');
  res.json({ success: true });
});

// Eventos do Steam-User
client.on('refreshToken', (token) => {
  botState.refreshToken = token; saveCurrentSession();
  addLog('Sessão Steam salva com sucesso (Refresh Token).');
});
client.on('steamGuard', (domain, callback, lastCodeWrong) => {
  botState.steamGuardRequired = true;
  botState.steamGuardDomain = domain || 'Mobile App';
  
  if (lastCodeWrong) {
    addLog('Último código Steam Guard estava incorreto. Tente novamente.');
  } else {
    addLog(`Steam Guard requerido (${domain ? 'Email: ' + domain : 'Mobile App'}). Aguardando código...`);
  }
  
  app.locals.steamGuardCallback = callback;
});

client.on('loggedOn', (details) => {
  botState.isClientLoggedIn = true;
  addLog('Conectado à rede Steam com sucesso!');
  client.setPersona(SteamUser.EPersonaState.Online);
  botState.personaStateString = 'Online';
  
  const mySteamID = client.steamID;
  if (mySteamID) {
    client.getPersonas([mySteamID], (err, personas) => {
      if (!err && personas && personas[mySteamID.getSteamID64()]) {
        const persona = personas[mySteamID.getSteamID64()];
        botState.username = persona.player_name;
        if (persona.avatar_url) {
          botState.avatar = persona.avatar_url;
        } else if (persona.avatar_hash) {
          const hash = persona.avatar_hash.toString('hex');
          botState.avatar = `https://avatars.akamai.steamstatic.com/${hash}_full.jpg`;
        }
      }
    });
  }
  
  addLog('Autenticando sessão web para verificar insígnias...');
});

client.on('playingState', (blocked, playingApp) => {
  addLog(`[System] Estado de jogo atualizado: blocked=${blocked}, playingApp=${playingApp}`);
  if (blocked) {
    botState.isPausedForPlaying = true;
    addLog(`[System] O farming foi pausado porque você está jogando em outro dispositivo (AppID: ${playingApp}).`);
    client.gamesPlayed([]);
    botState.activeAppIds = [];
    botState.currentFarm = 'Pausado (Jogando outro jogo)';
  } else if (botState.isPausedForPlaying) {
    botState.isPausedForPlaying = false;
    if (botState.isManualPaused) {
      addLog(`[System] Você parou de jogar no outro dispositivo. Farming mantido pausado conforme solicitado manualmente.`);
      botState.currentFarm = 'Pausado Manualmente';
    } else {
      addLog(`[System] Você parou de jogar no outro dispositivo. Retomando o farming automático...`);
      checkBadgesAndFarm();
    }
  }
});

client.on('webSession', (sessionid, cookies) => {
  addLog('Sessão web obtida. Verificando cartas disponíveis...');
  community.setCookies(cookies);
  checkBadgesAndFarm();
});

client.on('persona', (steamID, persona) => {
  if (client.steamID && steamID.getSteamID64() === client.steamID.getSteamID64()) {
    botState.username = persona.player_name;
    if (persona.avatar_url) {
      botState.avatar = persona.avatar_url;
    } else if (persona.avatar_hash) {
      const hash = persona.avatar_hash.toString('hex');
      botState.avatar = `https://avatars.akamai.steamstatic.com/${hash}_full.jpg`;
    }
    
    const states = ['Offline', 'Online', 'Busy', 'Away', 'Snooze', 'Looking to Trade', 'Looking to Play', 'Invisible'];
    const stateIndex = persona.persona_state !== undefined ? persona.persona_state : 0;
    botState.personaStateString = states[stateIndex] || 'Online';
  }
});

client.on('appOwnershipCached', () => {
  if (client.ownedApps) {
    botState.gamesOwned = client.ownedApps.length;
  }
});

client.on('newItems', (count) => {
  if (count > 0) {
    addLog(`[Notificação] ${count} novos itens detectados no inventário Steam! Atualizando status do farm...`);
    // Delay slightly to let Steam update pages
    setTimeout(() => {
      if (botState.isClientLoggedIn) {
        checkBadgesAndFarm();
      }
    }, 5000);
  }
});

// Automatic checks are handled dynamically by startCheckTimer()

client.on('error', (err) => {
  botState.isClientLoggedIn = false;
  addLog(`[Erro Cliente] ${err.message}`);
  if (err.message.includes('InvalidPassword') || err.message.includes('AccessDenied') || err.message.includes('RateLimitExceeded') || err.message.includes('LogonSessionReplaced')) {
    botState.refreshToken = ''; saveCurrentSession();
  }
});

client.on('disconnected', (eresult, msg) => {
  botState.isClientLoggedIn = false;
  addLog(`Desconectado. Motivo: ${msg || eresult}`);
});

// Vite Middleware & Startup
async function startServer() {
  const sessionData = await loadSession();
  botState.refreshToken = sessionData.refreshToken || '';
  botState.cardsDropped = sessionData.cardsDropped || 0;
  botState.collectedCardsDetails = sessionData.collectedCardsDetails || [];

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
    
    // Auto-login on startup if token exists
    if (botState.refreshToken) {
      addLog('Encontrado Refresh Token, tentando logar automaticamente...');
      client.logOn({ refreshToken: botState.refreshToken });
    }
  });
}

startServer();

function saveCurrentSession() {
  saveSession({
    refreshToken: botState.refreshToken,
    cardsDropped: botState.cardsDropped,
    collectedCardsDetails: botState.collectedCardsDetails
  });
}
