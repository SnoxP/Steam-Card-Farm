/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Menu, X } from 'lucide-react';
import AdminPage from './components/AdminPage';

function getSessionId() {
  let sid = localStorage.getItem('app_session_id');
  if (!sid) {
    sid = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('app_session_id', sid);
  }
  return sid;
}

const originalFetch = window.fetch;
window.fetch = async function() {
  let [resource, config] = arguments;
  if (!config) config = {};
  if (!config.headers) config.headers = {};
  if (typeof resource === 'string' && resource.startsWith('/api/')) {
    config.headers['x-session-id'] = getSessionId();
  }
  return originalFetch.call(window, resource, config);
};


const t = {
  pt: {
    management: "Gerenciamento",
    dashboard: "Dashboard",
    remainingCards: "Cartas Restantes",
    collectedCards: "Cartas Coletadas",
    language: "Idioma / Language",
    steamProfile: "Perfil Steam",
    steamStatus: "Status Steam",
    activeSessions: "Sessões de Farm Ativas",
    nextCheck: "Próxima verificação",
    stop: "Parar",
    noActiveSessions: "Nenhuma sessão ativa.",
    console: "Console",
    availableCardsList: "Cartas Disponíveis (Lista)",
    allBadges: "Todas as Insígnias",
    unknownGame: "Jogo Desconhecido",
    drops: "drops",
    noCardsLeft: "Nenhuma carta restante para dropar.",
    loginToCheck: "Faça login para verificar as cartas.",
    noBadges: "Nenhuma insígnia encontrada.",
    waitingData: "Aguardando dados...",
    warningRealFarming: "Aviso: Farming real requer acesso à rede CM. Você deve usar suas próprias credenciais; usar credenciais de terceiros é proibido.",
    accountName: "Nome da Conta",
    password: "Senha",
    steamGuardCode: "Código Steam Guard",
    submitCode: "Enviar Código",
    triggerAutoFarm: "Iniciar Auto-Farm",
    stopFarming: "Parar Farming",
    logoutClear: "Sair e Limpar Sessão",
    startAutoFarming: "Iniciar Auto-Farming",
    restoreSession: "Restaurar Sessão",
    clearToken: "Limpar Token",
    manualFarm: "Farming Manual (AppID)",
    farm: "Farm",
    notConnected: "Não conectado",
    totalRemaining: "Cartas Restantes (Total)",
    totalValue: "Valor do Inventário",
    gamesOwned: "Jogos (Total)",
    gamesWithDrops: "Jogos com Drops",
    noCardsYet: "Nenhuma carta coletada ainda nesta sessão.",
    minPrice: "Menor preço"
  },
  en: {
    management: "Management",
    dashboard: "Dashboard",
    remainingCards: "Remaining Cards",
    collectedCards: "Collected Cards",
    language: "Idioma / Language",
    steamProfile: "Steam Profile",
    steamStatus: "Steam Status",
    activeSessions: "Active Farming Sessions",
    nextCheck: "Next check",
    stop: "Stop",
    noActiveSessions: "No active farming sessions.",
    console: "Console",
    availableCardsList: "Available Cards",
    allBadges: "All Badges",
    unknownGame: "Unknown Game",
    drops: "drops",
    noCardsLeft: "No cards left to drop.",
    loginToCheck: "Log in to check cards.",
    noBadges: "No badges found.",
    waitingData: "Waiting for data...",
    warningRealFarming: "Warning: Real farming requires CM Network access. You must use your own account credentials; using others' credentials is strictly prohibited.",
    accountName: "Account Name",
    password: "Password",
    steamGuardCode: "Steam Guard Code",
    submitCode: "Submit Code",
    triggerAutoFarm: "Trigger Auto-Farm",
    stopFarming: "Stop Farming",
    logoutClear: "Logout function AppContent() { Clear Session",
    startAutoFarming: "Start Auto-Farming",
    restoreSession: "Restore Session",
    clearToken: "Clear Token",
    manualFarm: "Manual Farm (AppID)",
    farm: "Farm",
    notConnected: "Not connected",
    totalRemaining: "Remaining Cards (Total)",
    totalValue: "Inventory Value",
    gamesOwned: "Games Owned",
    gamesWithDrops: "Games with Drops",
    noCardsYet: "No cards collected yet in this session.",
    minPrice: "Min Price"
  }
};

function AppContent() {
  const [accountName, setAccountName] = useState('');
  const [password, setPassword] = useState('');
  const [steamGuardCode, setSteamGuardCode] = useState('');
  const [manualAppId, setManualAppId] = useState('');
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('steam_refresh_token') || '');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
    const [lang, setLang] = useState<'pt' | 'en'>(localStorage.getItem('lang') === 'en' ? 'en' : 'pt');
  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'console' | 'available' | 'all'>('console');
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const consoleRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const hasAttemptedAutoLogin = useRef(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setStatus(data);
      
      // Auto-login logic: if backend is offline, we have a token, and haven't tried yet
      if (!data.isClientLoggedIn && !data.steamGuardRequired && !hasAttemptedAutoLogin.current) {
        const storedToken = localStorage.getItem('steam_refresh_token');
        if (storedToken && storedToken !== '') {
          hasAttemptedAutoLogin.current = true;
          setLoading(true);
          try {
            await fetch('/api/login-client', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: storedToken })
            });
            // Fetch status again after triggering login
            const resAfter = await fetch('/api/status');
            const dataAfter = await resAfter.json();
            setStatus(dataAfter);
          } catch (e) {
            console.error('Auto-login failed', e);
          }
          setLoading(false);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (status?.nextCheckTime && status?.isClientLoggedIn && status?.activeAppIds?.length > 0) {
      const updateTimer = () => {
        const remaining = Math.max(0, Math.floor((status.nextCheckTime - Date.now()) / 1000));
        setTimeLeft(remaining);
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [status?.nextCheckTime, status?.isClientLoggedIn, status?.activeAppIds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [status?.logs]);

  useEffect(() => {
    if (status) {
      if (status.refreshToken && status.refreshToken !== refreshToken) {
        setRefreshToken(status.refreshToken);
        localStorage.setItem('steam_refresh_token', status.refreshToken);
      } else if (status.refreshToken === '' && status.isClientLoggedIn === false && status.steamGuardRequired === false) {
        // We shouldn't clear the local token just because the server restarted and has empty token.
        // We will only clear it if we tried to auto-login and it failed, or on explicit logout.
      }
    }
  }, [status, refreshToken]);

  const handleClientLogin = async () => {
    setLoading(true);
    try {
      await fetch('/api/login-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountName, password })
      });
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSteamGuard = async () => {
    setLoading(true);
    try {
      await fetch('/api/steam-guard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: steamGuardCode })
      });
      setSteamGuardCode('');
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleStopFarm = async () => {
    try {
      await fetch('/api/farm-stop', { method: 'POST' });
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStopSingleApp = async (appId: number) => {
    try {
      await fetch('/api/farm-stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId })
      });
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualFarm = async () => {
    setLoading(true);
    try {
      await fetch('/api/farm-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId: manualAppId })
      });
      setManualAppId('');
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/logout', { method: 'POST' });
      setRefreshToken('');
      localStorage.removeItem('steam_refresh_token');
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleLoginWithToken = async () => {
    setLoading(true);
    try {
      await fetch('/api/login-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleTriggerAutoFarm = async () => {
    setLoading(true);
    try {
      await fetch('/api/farm-auto', { method: 'POST' });
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const getPersonaDisplay = (state: string) => {
    const mapping: Record<string, { label: string, color: string, bg: string }> = {
      'Online': { label: 'Disponível', color: 'text-green-400', bg: 'bg-green-500 shadow-[0_0_8px_#22c55e]' },
      'Away': { label: 'Ausente', color: 'text-amber-400', bg: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' },
      'Snooze': { label: 'Inativo', color: 'text-blue-400', bg: 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' },
      'Busy': { label: 'Ocupado', color: 'text-red-400', bg: 'bg-red-500 shadow-[0_0_8px_#ef4444]' },
      'Looking to Trade': { label: 'Disponível para Trocas', color: 'text-green-400', bg: 'bg-green-500 shadow-[0_0_8px_#22c55e]' },
      'Looking to Play': { label: 'Disponível para Jogar', color: 'text-green-400', bg: 'bg-green-500 shadow-[0_0_8px_#22c55e]' },
      'Invisible': { label: 'Invisível', color: 'text-gray-400', bg: 'bg-gray-500' },
      'Offline': { label: 'Offline', color: 'text-gray-500', bg: 'bg-gray-700' }
    };
    return mapping[state] || { label: state || 'Offline', color: 'text-gray-500', bg: 'bg-gray-700' };
  };

  const logs = status?.logs || ['[System] Awaiting connection...'];
  const placeholderCards = Array.from({ length: 36 });
  const isCollectedTab = location.pathname === '/cartas-coletadas';
  const isRestantesTab = location.pathname === '/cartas-restantes';

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0d1117] text-[#c9d1d9] font-sans">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-4 py-3 sm:py-2 border-b border-[#30363d] bg-[#161b22] shrink-0 gap-3 sm:gap-0 sticky top-0 z-50">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <img src="https://i.ibb.co/vxg3Rhq1/image-removebg-preview.png" alt="CardHarvester" className="h-10 sm:h-12 object-contain" />
            
            <div className="flex flex-col justify-center -ml-1">
              <div className="flex items-center text-2xl sm:text-[28px] font-black tracking-tighter italic leading-none" style={{ transform: 'skewX(-10deg)' }}>
                <span className="text-white drop-shadow-sm">CARD</span>
                <span className="text-[#6fc627] drop-shadow-sm">HARVESTER</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold tracking-[0.18em] uppercase mt-0.5 ml-1">Steam Card Farmer</span>
            </div>
          </div>
          
          <button 
            className="md:hidden p-2 text-[#8b949e] hover:text-white"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 text-[10px] sm:text-xs uppercase tracking-wider font-mono">
          <div className="px-2 sm:px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded">
            {status?.isClientLoggedIn ? 'Active' : 'Offline'}
          </div>
        </div>
      </header>
      
      <main className="flex flex-col md:flex-row flex-1 relative items-start">
        {/* Mobile Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        <aside className={`
          fixed md:relative z-50 h-[calc(100vh-100px)] md:h-auto 
          w-64 border-r border-[#30363d] bg-[#0d1117] flex-col shrink-0
          transition-transform duration-200 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:flex
        `}>
          <nav className="p-2 space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#8b949e] px-3 mb-2">{t[lang].management}</div>
            <Link onClick={() => setIsMobileSidebarOpen(false)} to="/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${!isCollectedTab && !isRestantesTab ? 'bg-[#1f6feb] text-white' : 'text-[#8b949e] hover:bg-[#161b22]'}`}>
              <span>{t[lang].dashboard}</span>
            </Link>
            <Link onClick={() => setIsMobileSidebarOpen(false)} to="/cartas-restantes" className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${isRestantesTab ? 'bg-[#1f6feb] text-white' : 'text-[#8b949e] hover:bg-[#161b22]'}`}>
              <span>{t[lang].remainingCards}</span>
            </Link>
                        <Link onClick={() => setIsMobileSidebarOpen(false)} to="/cartas-coletadas" className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${isCollectedTab ? 'bg-[#1f6feb] text-white' : 'text-[#8b949e] hover:bg-[#161b22]'}`}>
              <span>{t[lang].collectedCards}</span>
            </Link>
            {status?.isAdmin && (
              <Link onClick={() => setIsMobileSidebarOpen(false)} to="/admin" className="flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors text-amber-500 hover:bg-[#161b22]">
                <ShieldAlert size={16} />
                <span>ADMIN</span>
              </Link>
            )}
            
            <div className="pt-4 pb-2">
              <div className="text-[10px] uppercase font-bold text-[#8b949e] px-3 mb-2">{t[lang].language}</div>
              <button onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')} className="flex items-center justify-between gap-3 px-3 py-2 w-full text-left rounded text-sm font-medium transition-colors text-[#8b949e] hover:bg-[#161b22]">
                <span>{lang === 'pt' ? '🇧🇷 Português' : '🇺🇸 English'}</span>
                <span className="text-[10px] bg-[#30363d] px-1.5 py-0.5 rounded text-white font-bold">{lang.toUpperCase()}</span>
              </button>
            </div>

          </nav>
          
          {status?.avatar && (
            <div className="mt-auto p-4 border-t border-[#30363d] bg-[#161b22]/50 font-mono text-[10px]">
              <div className="flex items-center gap-3">
                <img src={status.avatar} alt="Avatar" className="w-8 h-8 rounded" />
                <span>{status.username}</span>
              </div>
            </div>
          )}
        </aside>
        
        <section className="flex-1 flex flex-col p-2 sm:p-4 gap-2 sm:gap-4">
          {isCollectedTab ? (
            <div className="flex flex-col gap-4 flex-1 min-h-0">
              <div className="bg-[#161b22] border border-[#30363d] p-4 rounded flex items-center justify-between shadow-sm shrink-0">
                <div className="flex flex-col">
                  <span className="text-[11px] text-[#8b949e] uppercase font-bold tracking-wider">{t[lang].totalRemaining}</span>
                  <span className="text-3xl font-mono font-black text-amber-400">
                    {status?.availableGamesToFarm?.reduce((acc: number, g: any) => acc + (g.drops || 0), 0) || 0}
                  </span>
                </div>
              </div>

              <div className="bg-[#161b22] border border-[#30363d] rounded flex flex-col flex-1">
                <div className="px-4 py-3 border-b border-[#30363d] shrink-0 bg-[#21262d]/30">
                  <h2 className="text-sm font-bold uppercase text-[#f0f6fc]">{t[lang].collectedCards} ({status?.collectedCardsDetails?.length || 0})</h2>
                </div>
                <div className="flex-1 p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    {status?.collectedCardsDetails && status.collectedCardsDetails.length > 0 ? (
                      <>
                        {status.collectedCardsDetails.map((card: any, i: number) => (
                          <div key={i} className="bg-[#0d1117] border border-[#30363d] rounded overflow-hidden flex flex-col hover:border-[#58a6ff]/50 transition-colors">
                            <div className="h-28 sm:h-32 bg-[#21262d]/50 flex items-center justify-center p-2 relative">
                              <img src={card.image} alt={card.title} className="max-w-full max-h-full object-contain drop-shadow-md" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                            <div className="p-2 sm:p-3 flex flex-col gap-1 border-t border-[#30363d]">
                              <span className="text-[10px] sm:text-xs font-bold text-[#c9d1d9] truncate" title={card.title}>{card.title}</span>
                              <span className="text-[9px] sm:text-[10px] text-[#8b949e] font-mono">{t[lang].minPrice}: <span className="text-green-400 font-bold">{card.minPrice || 'N/A'}</span></span>
                            </div>
                          </div>
                        ))}
                        {placeholderCards.slice(0, Math.max(0, 36 - status.collectedCardsDetails.length)).map((_, i) => (
                          <div key={`placeholder-${i}`} className="bg-[#0d1117]/30 border border-[#30363d]/50 rounded overflow-hidden flex flex-col items-center justify-center min-h-[128px] opacity-30">
                            <span className="text-[#8b949e] font-mono text-xl">?</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {placeholderCards.map((_, i) => (
                          <div key={`placeholder-empty-${i}`} className="bg-[#0d1117]/30 border border-[#30363d]/50 rounded overflow-hidden flex flex-col items-center justify-center min-h-[128px] opacity-30">
                            <span className="text-[#8b949e] font-mono text-xl">?</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : isRestantesTab ? (
            <div className="flex flex-col gap-4 flex-1 min-h-0">
              <div className="bg-[#161b22] border border-[#30363d] rounded flex flex-col flex-1">
                <div className="px-4 py-3 border-b border-[#30363d] shrink-0 bg-[#21262d]/30 flex justify-between items-center">
                  <h2 className="text-sm font-bold uppercase text-[#f0f6fc]">{t[lang].remainingCards} ({status?.availableGamesToFarm?.length || 0} {lang === 'pt' ? 'jogos' : 'games'})</h2>
                  <span className="text-sm font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20 font-bold">
                    Total: {status?.availableGamesToFarm?.reduce((acc: number, g: any) => acc + (g.drops || 0), 0) || 0} {lang === 'pt' ? 'cartas' : 'cards'}
                  </span>
                </div>
                <div className="flex-1 p-4 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    {status?.availableGamesToFarm && status.availableGamesToFarm.length > 0 ? (
                      <>
                        {status.availableGamesToFarm.map((game: any) => (
                          <div key={game.appId} className="flex flex-col p-3 rounded bg-[#0d1117] border border-[#30363d] hover:border-[#58a6ff]/50 transition-colors">
                            <img src={`https://steamcdn-a.akamaihd.net/steam/apps/${game.appId}/header.jpg`} alt={game.name} className="w-full h-24 object-cover rounded mb-3 border border-[#21262d]" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            <div className="text-[10px] sm:text-xs text-[#c9d1d9] font-bold truncate mb-1" title={game.name}>{game.name || t[lang].unknownGame}</div>
                            <div className="flex justify-between items-end mt-auto">
                              <div className="text-[9px] sm:text-[10px] text-[#8b949e] font-mono">AppID: {game.appId}</div>
                              <div className="text-[10px] text-[#58a6ff] font-bold bg-[#58a6ff]/10 px-2 py-0.5 rounded border border-[#58a6ff]/20">
                                {game.drops} drop
                              </div>
                            </div>
                          </div>
                        ))}
                        {placeholderCards.slice(0, Math.max(0, 36 - status.availableGamesToFarm.length)).map((_, i) => (
                          <div key={`placeholder-${i}`} className="bg-[#0d1117]/30 border border-[#30363d]/50 rounded overflow-hidden flex flex-col items-center justify-center min-h-[140px] opacity-30">
                            <span className="text-[#8b949e] font-mono text-xl">?</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {placeholderCards.map((_, i) => (
                          <div key={`placeholder-empty-${i}`} className="bg-[#0d1117]/30 border border-[#30363d]/50 rounded overflow-hidden flex flex-col items-center justify-center min-h-[140px] opacity-30">
                            <span className="text-[#8b949e] font-mono text-xl">?</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 shrink-0">
                <div className="bg-[#161b22] border border-[#30363d] p-2 sm:p-3 rounded flex flex-col justify-between shadow-sm min-h-[70px]">
                  <span className="text-[9px] sm:text-[11px] text-[#8b949e] uppercase font-bold">Games Owned</span>
                  <span className="text-lg sm:text-2xl font-mono text-white">{status?.gamesOwned || 0}</span>
                </div>


            <Link to="/cartas-restantes" className="bg-[#161b22] border border-[#30363d] p-2 sm:p-3 rounded flex flex-col justify-between shadow-sm min-h-[70px] cursor-pointer hover:border-amber-500/50 hover:bg-[#1c2128] transition-colors">
              <span className="text-[9px] sm:text-[11px] text-[#8b949e] uppercase font-bold">{t[lang].remainingCards}</span>
              <span className="text-lg sm:text-2xl font-mono text-amber-400">
                {status?.availableGamesToFarm?.reduce((acc: number, g: any) => acc + (g.drops || 0), 0) || 0}
              </span>
            </Link>

            <Link to="/cartas-coletadas" className="bg-[#161b22] border border-[#30363d] p-2 sm:p-3 rounded flex flex-col justify-between shadow-sm min-h-[70px] cursor-pointer hover:border-blue-500/50 hover:bg-[#1c2128] transition-colors">
              <span className="text-[9px] sm:text-[11px] text-[#8b949e] uppercase font-bold">{t[lang].collectedCards}</span>
              <span className="text-lg sm:text-2xl font-mono text-green-400">{status?.cardsDropped || 0}</span>
            </Link>

            <div className="bg-[#161b22] border border-[#30363d] p-2 sm:p-3 rounded flex flex-col justify-between shadow-sm min-h-[70px]">
              <span className="text-[9px] sm:text-[11px] text-[#8b949e] uppercase font-bold">Current Farm</span>
              <span className={`text-xs sm:text-sm font-mono truncate ${status?.currentFarm?.includes('Pausado') ? 'text-amber-500' : 'text-blue-400'}`}>{status?.currentFarm || 'None'}</span>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] p-2 sm:p-3 rounded flex items-center justify-between shadow-sm min-h-[70px] col-span-2 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {status?.avatar ? (
                  <div className="relative shrink-0">
                    <img src={status.avatar} alt="Avatar" className="w-10 h-10 rounded border border-[#30363d]" />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-[#161b22] ${getPersonaDisplay(status?.personaStateString).bg}`}></span>
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-[#30363d] rounded flex items-center justify-center font-bold text-[#8b949e] shrink-0">
                    ?
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] text-[#8b949e] uppercase font-bold tracking-wider">{t[lang].steamProfile}</span>
                  <span className="text-xs font-bold text-white truncate max-w-[150px]">{status?.username || 'Não conectado'}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[9px] text-[#8b949e] uppercase font-bold tracking-wider">{t[lang].steamStatus}</span>
                <span className={`text-sm font-bold font-mono ${getPersonaDisplay(status?.personaStateString).color}`}>
                  {getPersonaDisplay(status?.personaStateString).label}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-none md:flex-1 grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4 min-h-0">
            <div className="lg:col-span-2 flex flex-col gap-2 sm:gap-4">
              <div className="bg-[#161b22] border border-[#30363d] rounded flex flex-col shrink-0">
                <div className="px-4 py-2 border-b border-[#30363d] flex justify-between items-center">
                  <h2 className="text-xs font-bold uppercase text-[#f0f6fc]">{t[lang].activeSessions}</h2>
                  {status?.isClientLoggedIn && status?.activeAppIds && status.activeAppIds.length > 0 && timeLeft !== null && (
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1.5 font-bold uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      Próxima verificação: {formatTime(timeLeft)}
                    </span>
                  )}
                </div>
                <div className="p-4 flex gap-3 flex-wrap">
                  {status?.activeAppIds && status.activeAppIds.length > 0 ? (
                    status.activeAppIds.map((id: number) => (
                      <div key={id} className="flex flex-col items-center gap-1.5 p-2 bg-[#0d1117] border border-[#30363d] rounded shrink-0 relative">
                        <a href={`https://store.steampowered.com/app/${id}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 group">
                          <img src={`https://steamcdn-a.akamaihd.net/steam/apps/${id}/capsule_sm_120.jpg`} alt={`App ${id}`} className="w-24 h-9 object-cover rounded border border-[#21262d] group-hover:border-[#58a6ff] transition-colors" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          <span className="text-[10px] font-mono text-[#c9d1d9] font-bold">{id}</span>
                        </a>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleStopSingleApp(id);
                          }}
                          className="w-full px-2 py-0.5 bg-red-500/15 hover:bg-red-600 text-red-400 hover:text-white rounded text-[9px] font-bold transition-all uppercase cursor-pointer text-center"
                        >
                          Parar
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-[#8b949e]">{t[lang].noActiveSessions}</span>
                  )}
                </div>
              </div>

              <div className="bg-[#161b22] border border-[#30363d] rounded flex flex-col flex-1">
                <div className="flex border-b border-[#30363d] shrink-0 flex-wrap">
                  <button 
                    onClick={() => setActiveConsoleTab('console')}
                    className={`flex-1 min-w-[80px] px-3 py-2 text-[10px] sm:text-xs font-bold uppercase transition-colors border-b-2 ${activeConsoleTab === 'console' ? 'border-[#58a6ff] text-[#f0f6fc]' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'}`}
                  >
                    Console
                  </button>
                  <button 
                    onClick={() => setActiveConsoleTab('available')}
                    className={`flex-1 min-w-[120px] px-3 py-2 text-[10px] sm:text-xs font-bold uppercase transition-colors border-b-2 ${activeConsoleTab === 'available' ? 'border-[#58a6ff] text-[#f0f6fc]' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'}`}
                  >
                    Cartas Disponíveis (Lista)
                  </button>
                  <button 
                    onClick={() => setActiveConsoleTab('all')}
                    className={`flex-1 min-w-[120px] px-3 py-2 text-[10px] sm:text-xs font-bold uppercase transition-colors border-b-2 ${activeConsoleTab === 'all' ? 'border-[#58a6ff] text-[#f0f6fc]' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'}`}
                  >
                    Todas as Insígnias
                  </button>
                </div>
                
                {activeConsoleTab === 'console' && (
                  <div ref={consoleRef} className="flex-1 p-4 font-mono text-[12px] leading-relaxed text-[#d1d5db] overflow-y-auto h-[250px] min-h-[250px] max-h-[400px]">
                    {logs.map((log: string, i: number) => (
                      <div key={i} className={log.includes('[Erro') ? 'text-red-400' : log.includes('sucesso') ? 'text-green-400' : ''}>
                        {log}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[#58a6ff]">{'>'}</span>
                      <span className="animate-pulse">_</span>
                    </div>
                  </div>
                )}

                {activeConsoleTab === 'available' && (
                  <div className="flex-1 p-4 space-y-2">
                    {status?.availableGamesToFarm && status.availableGamesToFarm.length > 0 ? (
                      status.availableGamesToFarm.map((game: any) => (
                        <div key={game.appId} className="flex items-center justify-between p-2 rounded bg-[#0d1117] border border-[#30363d]">
                          <div className="flex items-center gap-3">
                            <img src={`https://steamcdn-a.akamaihd.net/steam/apps/${game.appId}/capsule_sm_120.jpg`} alt={game.name} className="w-12 h-5 object-cover rounded" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            <div>
                              <div className="text-xs text-[#c9d1d9] font-bold">{game.name || t[lang].unknownGame}</div>
                              <div className="text-[10px] text-[#8b949e] font-mono">AppID: {game.appId}</div>
                            </div>
                          </div>
                          <div className="text-xs text-[#58a6ff] font-bold">
                            {game.drops} drop
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-[#8b949e] text-center mt-4">
                        {status?.isClientLoggedIn ? 'Nenhuma carta restante para dropar.' : 'Faça login para verificar as cartas.'}
                      </div>
                    )}
                  </div>
                )}

                {activeConsoleTab === 'all' && (
                  <div className="flex-1 p-4 space-y-2">
                    {status?.allBadges && status.allBadges.length > 0 ? (
                      status.allBadges.map((game: any) => (
                        <div key={game.appId} className="flex items-center justify-between p-2 rounded bg-[#0d1117] border border-[#30363d] gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={`https://steamcdn-a.akamaihd.net/steam/apps/${game.appId}/capsule_sm_120.jpg`} alt={game.name} className="w-12 h-5 object-cover rounded shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            <div className="min-w-0">
                              <div className="text-xs text-[#c9d1d9] font-bold truncate">{game.name || t[lang].unknownGame}</div>
                              <div className="text-[10px] text-[#8b949e] font-mono truncate">AppID: {game.appId} | Texto: <span className="text-yellow-500/80 font-sans italic">"{game.text || 'Nenhum'}"</span></div>
                            </div>
                          </div>
                          <div className={`text-xs font-bold shrink-0 ${game.drops > 0 ? 'text-[#58a6ff]' : 'text-[#8b949e]'}`}>
                            {game.drops > 0 ? `${game.drops} drop$` : '0 {t[lang].drops}'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-[#8b949e] text-center mt-4">
                        {status?.isClientLoggedIn ? 'Verificando insígnias...' : 'Faça login para ver a lista de insígnias.'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-[#161b22] border border-[#30363d] rounded flex flex-col flex-none md:flex-1">
              <div className="px-3 sm:px-4 py-2 border-b border-[#30363d] bg-[#21262d]/30 shrink-0">
                <h2 className="text-xs font-bold uppercase text-[#f0f6fc]">Account Link Configuration</h2>
              </div>
              
              <div className="p-3 sm:p-4 space-y-4">
                {refreshToken && !status?.steamGuardRequired ? (
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/30 p-3 rounded text-[11px] text-green-200 leading-normal">
                      <p><strong>Session Saved:</strong> A valid session token was found. You can continue farming without entering your password.</p>
                    </div>
                    {status?.isClientLoggedIn ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={handleTriggerAutoFarm}
                            disabled={loading}
                            className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer"
                          >
                            Trigger Auto-Farm
                          </button>
                          <button 
                            onClick={handleStopFarm}
                            disabled={loading}
                            className="flex-1 py-2 bg-[#da3633] hover:bg-[#f85149] text-white rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer"
                          >
                            Stop Farming
                          </button>
                        </div>
                        <button 
                          onClick={handleLogout}
                          disabled={loading}
                          className="w-full py-2 bg-[#21262d] hover:bg-[#30363d] text-[#da3633] border border-[#30363d] rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer"
                        >
                          Logout & Clear Session
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={handleLoginWithToken}
                          disabled={loading}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer"
                        >
                          {loading ? '...' : t[lang].restoreSession}
                        </button>
                        <button 
                          onClick={handleLogout}
                          disabled={loading}
                          className="flex-1 py-2 bg-[#da3633] hover:bg-[#f85149] text-white rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer"
                        >
                          Clear Token
                        </button>
                      </div>
                    )}
                    {status?.isClientLoggedIn && !status?.steamGuardRequired && (
                      <div className="mt-4 pt-4 border-t border-[#30363d] space-y-2">
                        <label className="text-[10px] text-[#8b949e] uppercase font-bold">{t[lang].manualFarm}</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={manualAppId}
                            onChange={(e) => setManualAppId(e.target.value)}
                            placeholder="e.g., 730, 440" 
                            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs font-mono focus:border-blue-500 outline-none text-[#c9d1d9]" 
                          />
                          <button 
                            onClick={handleManualFarm}
                            disabled={loading || !manualAppId}
                            className="px-4 py-2 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer disabled:opacity-50"
                          >
                            Farm
                          </button>
                          {status?.activeAppIds && status.activeAppIds.length > 0 && (
                            <button 
                              onClick={handleStopFarm}
                              disabled={loading}
                              className="px-4 py-2 bg-[#da3633] hover:bg-[#f85149] text-white rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer"
                            >
                              Stop
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded text-[11px] text-yellow-200 leading-normal">
                      <p><strong>Warning:</strong> {t[lang].warningRealFarming}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-[#8b949e] uppercase font-bold">{t[lang].accountName}</label>
                      <input 
                        type="text" 
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder={t[lang].accountName}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs font-mono focus:border-blue-500 outline-none text-[#c9d1d9]" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-[#8b949e] uppercase font-bold">{t[lang].password}</label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs font-mono focus:border-blue-500 outline-none text-[#c9d1d9]" 
                      />
                    </div>
                    {status?.steamGuardRequired && (
                      <div className="space-y-1.5 p-3 border border-blue-500/50 bg-blue-500/10 rounded">
                        <label className="text-[10px] text-blue-400 uppercase font-bold">Steam Guard Code ({status.steamGuardDomain})</label>
                        <input 
                          type="text" 
                          value={steamGuardCode}
                          onChange={(e) => setSteamGuardCode(e.target.value)}
                          placeholder={t[lang].steamGuardCode} 
                          className="w-full bg-[#0d1117] border border-blue-500/50 rounded px-3 py-2 text-xs font-mono focus:border-blue-500 outline-none text-[#c9d1d9]" 
                        />
                        <button 
                          onClick={handleSteamGuard}
                          disabled={loading || !steamGuardCode}
                          className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer disabled:opacity-50"
                        >
                          Submit Code
                        </button>
                      </div>
                    )}
                    {status?.isClientLoggedIn ? (
                      <div className="space-y-3 mt-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={handleTriggerAutoFarm}
                            disabled={loading}
                            className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer"
                          >
                            Trigger Auto-Farm
                          </button>
                          <button 
                            onClick={handleStopFarm}
                            disabled={loading}
                            className="flex-1 py-2 bg-[#da3633] hover:bg-[#f85149] text-white rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer"
                          >
                            Stop Farming
                          </button>
                        </div>
                        <button 
                          onClick={handleLogout}
                          disabled={loading}
                          className="w-full py-2 bg-[#21262d] hover:bg-[#30363d] text-[#da3633] border border-[#30363d] rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer"
                        >
                          Logout & Clear Session
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-4">
                        <button 
                          onClick={handleClientLogin}
                          disabled={loading}
                          className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer disabled:opacity-50"
                        >
                          {loading ? '...' : t[lang].startAutoFarming}
                        </button>
                      </div>
                    )}
                    
                    {status?.isClientLoggedIn && !status?.steamGuardRequired && (
                      <div className="mt-4 pt-4 border-t border-[#30363d] space-y-2">
                        <label className="text-[10px] text-[#8b949e] uppercase font-bold">{t[lang].manualFarm}</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={manualAppId}
                            onChange={(e) => setManualAppId(e.target.value)}
                            placeholder="e.g., 730, 440" 
                            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs font-mono focus:border-blue-500 outline-none text-[#c9d1d9]" 
                          />
                          <button 
                            onClick={handleManualFarm}
                            disabled={loading || !manualAppId}
                            className="px-4 py-2 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer disabled:opacity-50"
                          >
                            Farm
                          </button>
                          {status?.activeAppIds && status.activeAppIds.length > 0 && (
                            <button 
                              onClick={handleStopFarm}
                              disabled={loading}
                              className="px-4 py-2 bg-[#da3633] hover:bg-[#f85149] text-white rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer"
                            >
                              Stop
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
            </>
          )}
        </section>
      </main>
      
      <footer className="bg-[#0d1117] border-t border-[#30363d] px-2 sm:px-4 py-2 flex flex-col sm:flex-row justify-between items-center text-[9px] sm:text-[11px] text-[#8b949e] font-mono shrink-0 gap-1 sm:gap-0">
        <div className="flex items-center gap-2 text-center sm:text-left">

        </div>
        <div className="flex gap-3 sm:gap-4">
          <span className="hidden sm:inline">v1.0.1</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}

