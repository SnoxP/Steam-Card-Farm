/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Menu, X, HelpCircle, LayoutDashboard, Layers, Package, Activity, Terminal, Link as LinkIcon, Code, TrendingUp, Plus, Gamepad2, CheckCircle2 } from 'lucide-react';
import AdminPage from './components/AdminPage';
import TutorialPage from './components/TutorialPage';

import { getSessionId, safeGetItem, safeSetItem, safeRemoveItem, apiFetch } from './utils/apiFetch';


const t = {
  pt: {
    management: "Gerenciamento",
    currentFarm: "Farm Atual",
    howToUseTags: "Como usar as tags de AppID?",
    stopRunningTitle: "Para parar de rodar:",
    stopRunningDesc: 'Aperte o botão "Stop" para parar todos os AppIDs que estão rodando.',
    oneAppIdTitle: "1 AppID:",
    oneAppIdDesc: "Irá rodar um único jogo escolhido. (Ex: 730)",
    multiAppIdTitle: "Múltiplos AppIDs:",
    multiAppIdDesc: "Irá rodar múltiplos jogos ao mesmo tempo. (Ex: 730, 570, 440, 578080)",
    statusOnline: "Disponível",
    statusAway: "Ausente",
    statusSnooze: "Inativo",
    statusBusy: "Ocupado",
    statusTrade: "Disponível para Trocas",
    statusPlay: "Disponível para Jogar",
    statusInvisible: "Invisível",
    statusOffline: "Offline",
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
    minPrice: "Menor preço",
    tutorialHelp: "Não sabe o que fazer? (Ajuda)",
    sessionSaved: "Sessão Salva: Um token de sessão válido foi encontrado. Você pode continuar farmando sem digitar sua senha."
  },
  en: {
    management: "Management",
    currentFarm: "Current Farm",
    howToUseTags: "How to use AppID tags?",
    stopRunningTitle: "To stop running:",
    stopRunningDesc: 'Press the "Stop" button to stop all running AppIDs.',
    oneAppIdTitle: "1 AppID:",
    oneAppIdDesc: "Will run a single chosen game. (Ex: 730)",
    multiAppIdTitle: "Multiple AppIDs:",
    multiAppIdDesc: "Will run multiple games at the same time. (Ex: 730, 570, 440, 578080)",
    statusOnline: "Online",
    statusAway: "Away",
    statusSnooze: "Snooze",
    statusBusy: "Busy",
    statusTrade: "Looking to Trade",
    statusPlay: "Looking to Play",
    statusInvisible: "Invisible",
    statusOffline: "Offline",
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
    logoutClear: "Logout & Clear Session",
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
    minPrice: "Min Price",
    tutorialHelp: "Don't know what to do? (Help)",
    sessionSaved: "Session Saved: A valid session token was found. You can continue farming without entering your password."
  }
};


const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);
function AppContent() {
  const [accountName, setAccountName] = useState('');
  const [password, setPassword] = useState('');
  const [steamGuardCode, setSteamGuardCode] = useState('');
  const [manualAppId, setManualAppId] = useState('');
  const [showTagsHelp, setShowTagsHelp] = useState(false);
  const [refreshToken, setRefreshToken] = useState(safeGetItem('steam_refresh_token') || '');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
    const [lang, setLang] = useState<'pt' | 'en'>(safeGetItem('lang') === 'en' ? 'en' : 'pt');
  useEffect(() => {
    safeSetItem('lang', lang);
  }, [lang]);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'console' | 'available' | 'all'>('console');
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number | null>(null);
  
  const consoleRef = useRef<HTMLDivElement>(null);
  const manualFarmRef = useRef<HTMLDivElement>(null);
  const [highlightManualFarm, setHighlightManualFarm] = useState(false);

  const handleAddNewSession = () => {
    setHighlightManualFarm(true);
    if (manualFarmRef.current) {
      manualFarmRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      setHighlightManualFarm(false);
    }, 3000);
  };
  const location = useLocation();

  const hasAttemptedAutoLogin = useRef(false);

  const fetchStatus = async () => {
    try {
      const res = await apiFetch('/api/status');
      const data = await res.json();
      setStatus(data);
      
      // Auto-login logic: if backend is offline, we have a token, and haven't tried yet
      if (!data.isClientLoggedIn && !data.steamGuardRequired && !hasAttemptedAutoLogin.current) {
        const storedToken = safeGetItem('steam_refresh_token');
        if (storedToken && storedToken !== '') {
          hasAttemptedAutoLogin.current = true;
          setLoading(true);
          try {
            await apiFetch('/api/login-client', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: storedToken })
            });
            // Fetch status again after triggering login
            const resAfter = await apiFetch('/api/status');
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
    const updateTimer = () => {
      if (status?.nextCheckTime && status?.isClientLoggedIn && status?.activeAppIds?.length > 0) {
        const remaining = Math.max(0, Math.floor((status.nextCheckTime - Date.now()) / 1000));
        setTimeLeft(remaining);
      } else {
        setTimeLeft(null);
      }
      
      if (status?.farmingStartTime && status?.isClientLoggedIn && status?.activeAppIds?.length > 0) {
        const elapsed = Math.max(0, Math.floor((Date.now() - status.farmingStartTime) / 1000));
        setTimeElapsed(elapsed);
      } else {
        setTimeElapsed(null);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [status?.nextCheckTime, status?.farmingStartTime, status?.isClientLoggedIn, status?.activeAppIds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatElapsed = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
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
        safeSetItem('steam_refresh_token', status.refreshToken);
      } else if (status.refreshToken === '' && status.isClientLoggedIn === false && status.steamGuardRequired === false) {
        // We shouldn't clear the local token just because the server restarted and has empty token.
        // We will only clear it if we tried to auto-login and it failed, or on explicit logout.
      }
    }
  }, [status, refreshToken]);

  const handleClientLogin = async () => {
    setLoading(true);
    try {
      await apiFetch('/api/login-client', {
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
      await apiFetch('/api/steam-guard', {
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
      await apiFetch('/api/farm-stop', { method: 'POST' });
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStopSingleApp = async (appId: number) => {
    try {
      await apiFetch('/api/farm-stop', {
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
      await apiFetch('/api/farm-manual', {
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
      await apiFetch('/api/logout', { method: 'POST' });
      setRefreshToken('');
      safeRemoveItem('steam_refresh_token');
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleLoginWithToken = async () => {
    setLoading(true);
    try {
      await apiFetch('/api/login-client', {
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
      await apiFetch('/api/farm-auto', { method: 'POST' });
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
    <div className="flex flex-col min-h-screen w-full bg-[#080b0e] text-[#8b949e] font-sans selection:bg-green-500/30">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-[#080b0e] border-b border-[#1d2630] shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="https://i.ibb.co/vxg3Rhq1/image-removebg-preview.png" alt="CardHarvester" className="h-10 object-contain drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
          <div className="flex flex-col -ml-1">
            <div className="flex items-center text-2xl font-black tracking-tighter italic leading-none" style={{ transform: 'skewX(-10deg)' }}>
              <span className="text-white">CARD</span>
              <span className="text-[#6fc627]">HARVESTER</span>
            </div>
            <span className="text-[9px] text-[#6fc627] font-bold tracking-[0.18em] uppercase mt-0.5 ml-1">Steam Card Farmer</span>
          </div>
        </div>
        <div className="flex items-center mt-3 sm:mt-0">
          <div className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full flex items-center gap-2 text-xs font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            {status?.isClientLoggedIn ? 'ACTIVE' : 'OFFLINE'}
          </div>
          <button 
            className="ml-4 md:hidden p-2 text-[#8b949e] hover:text-white"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
      
      <main className="flex flex-col md:flex-row flex-1 relative items-start overflow-hidden h-[calc(100vh-65px)]">
        {isMobileSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        <aside className={`
          fixed md:relative z-50 h-full w-64 border-r border-[#1d2630] bg-[#0b1016] flex-col shrink-0
          transition-transform duration-200 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex
        `}>
          <div className="flex-1 overflow-y-auto p-3 space-y-6">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#8b949e] px-3 mb-2 tracking-wider flex items-center justify-between">
                <span>{t[lang].management}</span>
                <span className="text-xs">^</span>
              </div>
              <div className="space-y-1">
                <Link onClick={() => setIsMobileSidebarOpen(false)} to="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold transition-colors ${!isCollectedTab && !isRestantesTab ? 'bg-[#15231a] text-[#22c55e] border border-[#22c55e]/30 shadow-[inset_0_0_12px_rgba(34,197,94,0.1)]' : 'text-[#8b949e] hover:bg-[#121820]'}`}>
                  <LayoutDashboard size={18} />
                  <span>{t[lang].dashboard}</span>
                </Link>
                <Link onClick={() => setIsMobileSidebarOpen(false)} to="/cartas-restantes" className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold transition-colors ${isRestantesTab ? 'bg-[#15231a] text-[#22c55e] border border-[#22c55e]/30' : 'text-[#8b949e] hover:bg-[#121820]'}`}>
                  <Layers size={18} />
                  <span>{t[lang].remainingCards}</span>
                </Link>
                <Link onClick={() => setIsMobileSidebarOpen(false)} to="/cartas-coletadas" className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold transition-colors ${isCollectedTab ? 'bg-[#15231a] text-[#22c55e] border border-[#22c55e]/30' : 'text-[#8b949e] hover:bg-[#121820]'}`}>
                  <Package size={18} />
                  <span>{t[lang].collectedCards}</span>
                </Link>
              </div>
            </div>

            {status?.isAdmin && (
              <div>
                <Link onClick={() => setIsMobileSidebarOpen(false)} to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold transition-colors text-amber-500 hover:bg-[#15231a] border border-transparent hover:border-amber-500/30">
                  <ShieldAlert size={18} />
                  <span>ADMIN</span>
                </Link>
              </div>
            )}
            
            <div>
              <div className="text-[10px] uppercase font-bold text-[#8b949e] px-3 mb-2 tracking-wider">{t[lang].language}</div>
              <button onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')} className="flex items-center justify-between gap-3 px-3 py-2.5 w-full text-left rounded-md text-sm font-bold transition-colors text-[#8b949e] hover:bg-[#121820]">
                <div className="flex items-center gap-3">
                  <GlobeIcon />
                  <span>{lang === 'pt' ? 'Português' : 'English'}</span>
                </div>
                <span className="text-[10px] bg-[#1d2630] text-white px-2 py-0.5 rounded-md font-bold">{lang.toUpperCase()}</span>
              </button>
            </div>

            {status?.avatar && (
              <div className="mt-4 pt-4 border-t border-[#1d2630] px-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={status.avatar} alt="Avatar" className="w-10 h-10 rounded-md border border-[#1d2630]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{status.username}</span>
                    {status.isAdmin && <span className="text-[10px] text-amber-500 font-bold tracking-wider">ADMIN</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-[#1d2630] bg-[#0b1016]">
             <div className="w-full h-40 bg-[#0c1218] border border-[#1d2630] rounded-md relative overflow-hidden flex flex-col justify-center items-center">
                <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                   {/* Decorative background lines */}
                   <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#22c55e" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                   </svg>
                </div>
                <div className="z-10 flex flex-col gap-1 items-start w-full px-6">
                  <span className="text-[#22c55e] font-black text-sm tracking-widest">AUTOMATE.</span>
                  <span className="text-[#22c55e] font-black text-sm tracking-widest">FARM.</span>
                  <span className="text-[#22c55e] font-black text-sm tracking-widest">PROFIT.</span>
                </div>
             </div>
             <div className="flex justify-between items-center mt-3 px-1 text-[10px] text-[#4b5563]">
               <span>v1.0.1</span>
               <button onClick={() => setIsMobileSidebarOpen(false)} className="hover:text-white transition-colors">&lt;&lt;</button>
             </div>
          </div>
        </aside>
        
        <section className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#080b0e]">
          {isCollectedTab || isRestantesTab ? (
            /* Reusing the existing simple view for lists, but stylized */
            <div className="bg-[#10151c] border border-[#1d2630] rounded-lg p-6 min-h-full">
               <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wide">
                 {isCollectedTab ? t[lang].collectedCards : t[lang].remainingCards}
               </h2>
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                 {/* This just maps the current active tab contents using the same objects from the original code */}
                 {isCollectedTab && status?.collectedCardsDetails?.map((card: any, i: number) => (
                    <div key={i} className="bg-[#0b1016] border border-[#1d2630] rounded-md overflow-hidden flex flex-col hover:border-green-500/50 transition-colors">
                      <div className="h-28 sm:h-32 bg-[#10151c] flex items-center justify-center p-2 relative">
                        <img src={card.image} alt={card.title} className="max-w-full max-h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                      <div className="p-3 border-t border-[#1d2630] flex flex-col">
                        <span className="text-xs font-bold text-white truncate" title={card.title}>{card.title}</span>
                        <span className="text-[10px] text-[#8b949e] font-mono mt-1">Price: <span className="text-green-400 font-bold">{card.minPrice || 'N/A'}</span></span>
                      </div>
                    </div>
                 ))}
                 {isRestantesTab && status?.availableGamesToFarm?.map((game: any) => (
                    <div key={game.appId} className="bg-[#0b1016] border border-[#1d2630] rounded-md overflow-hidden flex flex-col hover:border-green-500/50 transition-colors">
                      <img src={`https://steamcdn-a.akamaihd.net/steam/apps/${game.appId}/header.jpg`} alt={game.name} className="w-full h-24 object-cover border-b border-[#1d2630]" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      <div className="p-3 flex flex-col h-full justify-between gap-2">
                        <span className="text-xs font-bold text-white line-clamp-2" title={game.name}>{game.name || t[lang].unknownGame}</span>
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] text-[#8b949e] font-mono">{game.appId}</span>
                          <span className="text-[10px] text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">{game.drops} drops</span>
                        </div>
                      </div>
                    </div>
                 ))}
                 {(!isCollectedTab && !status?.availableGamesToFarm?.length) && (!isRestantesTab && !status?.collectedCardsDetails?.length) && (
                   <div className="col-span-full py-12 text-center text-[#8b949e] text-sm">
                     {t[lang].waitingData}
                   </div>
                 )}
               </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 max-w-[1600px] mx-auto">
              
              {/* TOP STATS ROW */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                
                <div className="bg-[#10151c] border border-[#1d2630] rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group hover:border-[#22c55e]/50 transition-colors h-24">
                  <div className="flex justify-between items-start z-10">
                    <div className="flex items-center gap-2 text-[10px] text-[#8b949e] font-bold tracking-wider uppercase">
                      <Gamepad2 size={14} className="text-[#22c55e]" />
                      {t[lang].gamesOwned}
                    </div>
                  </div>
                  <div className="text-3xl font-mono text-white font-bold z-10">{status?.gamesOwned || 0}</div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[#22c55e]"></div>
                </div>

                <div className="bg-[#10151c] border border-[#1d2630] rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group hover:border-[#eab308]/50 transition-colors h-24">
                  <div className="flex justify-between items-start z-10">
                    <div className="flex items-center gap-2 text-[10px] text-[#8b949e] font-bold tracking-wider uppercase">
                      <Layers size={14} className="text-[#eab308]" />
                      {t[lang].remainingCards}
                    </div>
                  </div>
                  <div className="text-3xl font-mono text-white font-bold z-10">
                    {status?.availableGamesToFarm?.reduce((acc: number, g: any) => acc + (g.drops || 0), 0) || 0}
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[#eab308]"></div>
                </div>

                <div className="bg-[#10151c] border border-[#1d2630] rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group hover:border-[#22c55e]/50 transition-colors h-24">
                  <div className="flex justify-between items-start z-10">
                    <div className="flex items-center gap-2 text-[10px] text-[#8b949e] font-bold tracking-wider uppercase">
                      <Package size={14} className="text-[#22c55e]" />
                      {t[lang].collectedCards}
                    </div>
                  </div>
                  <div className="text-3xl font-mono text-white font-bold z-10">{status?.cardsDropped || 0}</div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[#22c55e]"></div>
                </div>

                <div className="bg-[#10151c] border border-[#1d2630] rounded-lg p-4 flex flex-col justify-center gap-1 relative overflow-hidden h-24">
                  <div className="flex items-center gap-2 text-[10px] text-[#8b949e] font-bold tracking-wider uppercase">
                    <Activity size={14} className="text-[#3b82f6]" />
                    {t[lang].currentFarm}
                  </div>
                  <div className={`text-sm font-bold ${status?.currentFarm?.includes('Pausado') ? 'text-amber-500' : 'text-[#3b82f6]'} leading-tight line-clamp-2`}>
                    {status?.currentFarm || 'None'}
                  </div>
                </div>

                <div className="bg-[#10151c] border border-[#1d2630] rounded-lg p-4 flex items-center justify-between gap-3 h-24">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {status?.avatar ? (
                      <div className="relative shrink-0">
                        <img src={status.avatar} alt="Avatar" className="w-10 h-10 rounded-md border border-[#1d2630]" />
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-[1.5px] border-[#10151c] ${getPersonaDisplay(status?.personaStateString).bg}`}></span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-[#1d2630] rounded-md flex items-center justify-center font-bold text-[#8b949e] shrink-0">
                        ?
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] text-[#8b949e] uppercase font-bold tracking-wider">{t[lang].steamProfile}</span>
                      <span className="text-xs font-bold text-white truncate">{status?.username || 'Não conectado'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 border-l border-[#1d2630] pl-3">
                    <span className="text-[9px] text-[#8b949e] uppercase font-bold tracking-wider">{t[lang].steamStatus}</span>
                    <span className={`text-xs font-bold ${getPersonaDisplay(status?.personaStateString).color}`}>
                      {getPersonaDisplay(status?.personaStateString).label}
                    </span>
                  </div>
                </div>

              </div>

              {/* MAIN LAYOUT: 2 COLUMNS */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN (Sessões & Console) */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                  
                  {/* SESSÕES DE FARM ATIVAS */}
                  <div className="bg-[#10151c] border border-[#1d2630] rounded-lg overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-[#1d2630] flex justify-between items-center bg-[#0d1217]">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-[#22c55e]" />
                        <h2 className="text-sm font-bold uppercase text-white tracking-wider">{t[lang].activeSessions}</h2>
                      </div>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {status?.activeAppIds && status.activeAppIds.length > 0 ? (
                        status.activeAppIds.map((id: number) => (
                          <div key={id} className="bg-[#0b1016] border border-[#1d2630] rounded-lg p-4 flex flex-col gap-4 relative">
                            <div className="flex justify-between items-start">
                              <div className="w-32 h-16 bg-gray-800 rounded overflow-hidden border border-[#1d2630]">
                                <img src={`https://steamcdn-a.akamaihd.net/steam/apps/${id}/header.jpg`} alt={`App ${id}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                              </div>
                              <div className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-bold uppercase rounded flex items-center gap-1.5">
                                <Activity size={10} />
                                EM EXECUÇÃO
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                              <span className="text-lg font-bold text-white font-mono">{id}</span>
                              <span className="text-xs text-[#8b949e]">{status?.allBadges?.find((b: any) => b.appId === id)?.name || status?.availableGamesToFarm?.find((g: any) => g.appId === id)?.name || t[lang].unknownGame}</span>
                            </div>

                            <div className="flex flex-col gap-1 text-[11px] text-[#8b949e] font-mono">
                              <div>Iniciado em: <span className="text-white">{status?.farmingStartTime ? new Date(status.farmingStartTime).toLocaleTimeString() : "N/A"}</span></div>
                              {timeElapsed !== null && <div>Tempo rodado: <span className="text-white">{formatElapsed(timeElapsed)}</span></div>}
                              {timeLeft !== null && <div>Próxima checagem: <span className="text-green-400">{formatTime(timeLeft)}</span></div>}
                            </div>
                            
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                handleStopSingleApp(id);
                              }}
                              className="mt-2 w-full py-2.5 bg-gradient-to-b from-[#7f1d1d] to-[#450a0a] hover:from-[#991b1b] hover:to-[#7f1d1d] text-[#fca5a5] hover:text-white rounded text-xs font-bold transition-all border border-[#991b1b]/50 shadow-[0_0_10px_rgba(220,38,38,0.1)] uppercase"
                            >
                              PARAR
                            </button>
                          </div>
                        ))
                      ) : null}

                      {/* Add New Session Card */}
                      <div onClick={handleAddNewSession} className="bg-[#0b1016] border border-dashed border-[#1d2630] hover:border-[#22c55e]/50 rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#22c55e] text-[#22c55e] group-hover:bg-[#22c55e]/10 transition-colors">
                          <Plus size={24} />
                        </div>
                        <div className="text-sm font-bold text-white tracking-wider">ADICIONAR NOVA SESSÃO</div>
                        <div className="text-xs text-[#8b949e]">Inicie uma nova sessão de farm</div>
                      </div>
                    </div>
                  </div>

                  {/* CONSOLE */}
                  <div className="bg-[#10151c] border border-[#1d2630] rounded-lg overflow-hidden flex flex-col flex-1 min-h-[300px]">
                    <div className="flex border-b border-[#1d2630] bg-[#0d1217]">
                      <button 
                        onClick={() => setActiveConsoleTab('console')}
                        className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-xs font-bold uppercase transition-colors border-b-2 ${activeConsoleTab === 'console' ? 'border-[#22c55e] text-white bg-[#15231a]/50' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#121820]'}`}
                      >
                        <Terminal size={14} /> Console
                      </button>
                      <button 
                        onClick={() => setActiveConsoleTab('available')}
                        className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-xs font-bold uppercase transition-colors border-b-2 ${activeConsoleTab === 'available' ? 'border-[#22c55e] text-white bg-[#15231a]/50' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#121820]'}`}
                      >
                        <Package size={14} /> Cartas Disponíveis (Lista)
                      </button>
                      <button 
                        onClick={() => setActiveConsoleTab('all')}
                        className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-xs font-bold uppercase transition-colors border-b-2 ${activeConsoleTab === 'all' ? 'border-[#22c55e] text-white bg-[#15231a]/50' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#121820]'}`}
                      >
                        <ShieldAlert size={14} /> Todas as Insígnias
                      </button>
                    </div>
                    
                    {activeConsoleTab === 'console' && (
                      <div ref={consoleRef} className="flex-1 p-5 font-mono text-[11px] leading-relaxed text-[#8b949e] overflow-y-auto bg-[#080b0e] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                        {logs.map((log: string, i: number) => {
                          let isSystem = log.includes('[System]') || log.includes('[Sytem]');
                          let isError = log.includes('[Erro');
                          return (
                            <div key={i} className={`whitespace-pre-wrap mb-0.5 ${isError ? 'text-red-400' : 'text-[#8b949e]'}`}>
                              {isSystem ? (
                                <>
                                  <span className="text-[#8b949e]">{log.split('] ')[0] + ']'}</span>{' '}
                                  <span className="text-[#22c55e]">{log.split('] ')[1]?.split(' ')[0]}</span>{' '}
                                  <span className="text-[#c9d1d9]">{log.substring(log.indexOf(log.split('] ')[1]?.split(' ')[1] || ''))}</span>
                                </>
                              ) : (
                                log
                              )}
                            </div>
                          );
                        })}
                        <div className="flex items-center gap-2 mt-3 text-[#3b82f6]">
                          <span>{'>'}</span>
                          <span className="animate-pulse font-black">_</span>
                        </div>
                      </div>
                    )}
                    
                    {activeConsoleTab === 'available' && (
                      <div className="flex-1 p-4 space-y-2 overflow-y-auto bg-[#080b0e]">
                        {status?.availableGamesToFarm && status.availableGamesToFarm.length > 0 ? (
                          status.availableGamesToFarm.map((game: any) => (
                            <div key={game.appId} className="flex items-center justify-between p-3 rounded-md bg-[#10151c] border border-[#1d2630]">
                              <div className="flex items-center gap-3">
                                <img src={`https://steamcdn-a.akamaihd.net/steam/apps/${game.appId}/capsule_sm_120.jpg`} alt={game.name} className="w-14 h-6 object-cover rounded" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                <div>
                                  <div className="text-xs text-white font-bold">{game.name || t[lang].unknownGame}</div>
                                  <div className="text-[10px] text-[#8b949e] font-mono">AppID: {game.appId}</div>
                                </div>
                              </div>
                              <div className="text-[11px] text-[#22c55e] font-bold bg-[#22c55e]/10 px-2 py-1 rounded border border-[#22c55e]/20">
                                {game.drops} drops
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-[#8b949e] text-center mt-10">
                            {status?.isClientLoggedIn ? 'Nenhuma carta restante para dropar.' : 'Faça login para verificar as cartas.'}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activeConsoleTab === 'all' && (
                      <div className="flex-1 p-4 space-y-2 overflow-y-auto bg-[#080b0e]">
                        {status?.allBadges && status.allBadges.length > 0 ? (
                          status.allBadges.map((game: any) => (
                            <div key={game.appId} className="flex items-center justify-between p-3 rounded-md bg-[#10151c] border border-[#1d2630] gap-2">
                              <div className="flex items-center gap-3 min-w-0">
                                <img src={`https://steamcdn-a.akamaihd.net/steam/apps/${game.appId}/capsule_sm_120.jpg`} alt={game.name} className="w-14 h-6 object-cover rounded shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                <div className="min-w-0">
                                  <div className="text-xs text-white font-bold truncate">{game.name || t[lang].unknownGame}</div>
                                  <div className="text-[10px] text-[#8b949e] font-mono truncate">AppID: {game.appId} | Texto: <span className="text-yellow-500 font-sans italic">"{game.text || 'Nenhum'}"</span></div>
                                </div>
                              </div>
                              <div className={`text-xs font-bold shrink-0 ${game.drops > 0 ? 'text-[#22c55e]' : 'text-[#8b949e]'}`}>
                                {game.drops > 0 ? `${game.drops} ` + t[lang].drops : `0 ${t[lang].drops}`}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-[#8b949e] text-center mt-10">
                            {status?.isClientLoggedIn ? 'Verificando insígnias...' : 'Faça login para ver a lista de insígnias.'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN (Configs & Stats) */}
                <div className="flex flex-col gap-6">
                  
                  {/* ACCOUNT LINK CONFIGURATION */}
                  <div className="bg-[#10151c] border border-[#1d2630] rounded-lg overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#1d2630] bg-[#0d1217] flex items-center gap-2">
                      <LinkIcon size={16} className="text-[#eab308]" />
                      <h2 className="text-xs font-bold uppercase text-white tracking-wider">Account Link Configuration</h2>
                    </div>
                    <div className="p-5 space-y-4">
                      {refreshToken && !status?.steamGuardRequired ? (
                        <>
                          <div className="bg-[#15231a] border border-[#22c55e]/30 p-4 rounded-md flex gap-3">
                            <CheckCircle2 size={18} className="text-[#22c55e] shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                              <span className="text-xs text-white font-bold">{t[lang].sessionSaved.split(":")[0]}:</span>
                              <span className="text-[11px] text-[#22c55e] leading-relaxed mt-0.5">{t[lang].sessionSaved.split(":")[1]}</span>
                            </div>
                          </div>
                          
                          {status?.isClientLoggedIn ? (
                            <div className="space-y-3 pt-2">
                              <div className="flex gap-3">
                                <button 
                                  onClick={handleTriggerAutoFarm}
                                  disabled={loading}
                                  className="flex-1 py-3 bg-[#166534] hover:bg-[#15803d] text-white rounded-md text-xs font-bold transition-colors uppercase border border-[#22c55e]/30 flex justify-center items-center gap-2"
                                >
                                  <span className="text-[#4ade80]">▶</span> TRIGGER AUTO-FARM
                                </button>
                                <button 
                                  onClick={handleStopFarm}
                                  disabled={loading}
                                  className="flex-1 py-3 bg-[#991b1b] hover:bg-[#b91c1c] text-white rounded-md text-xs font-bold transition-colors uppercase border border-[#f87171]/30 flex justify-center items-center gap-2"
                                >
                                  <span className="w-2.5 h-2.5 bg-white rounded-sm"></span> STOP FARMING
                                </button>
                              </div>
                              <button 
                                onClick={handleLogout}
                                disabled={loading}
                                className="w-full py-3 bg-[#080b0e] hover:bg-[#121820] text-red-500 border border-[#1d2630] rounded-md text-xs font-bold transition-colors flex justify-center items-center gap-2 uppercase"
                              >
                                <X size={16} /> LOGOUT & CLEAR SESSION
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={handleClientLogin}
                              disabled={loading}
                              className="w-full py-3 bg-[#166534] hover:bg-[#15803d] text-white rounded-md text-xs font-bold transition-colors uppercase border border-[#22c55e]/30"
                            >
                              {loading ? '...' : t[lang].startAutoFarming}
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="space-y-3">
                          <input 
                            type="text" 
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            placeholder={t[lang].accountName}
                            className="w-full bg-[#080b0e] border border-[#1d2630] rounded-md px-4 py-3 text-xs font-mono focus:border-[#22c55e]/50 outline-none text-white transition-colors placeholder-[#4b5563]" 
                          />
                          <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" 
                            className="w-full bg-[#080b0e] border border-[#1d2630] rounded-md px-4 py-3 text-xs font-mono focus:border-[#22c55e]/50 outline-none text-white transition-colors placeholder-[#4b5563]" 
                          />
                          {!status?.steamGuardRequired && (
                            <button 
                              onClick={handleClientLogin}
                              disabled={loading || !accountName || !password}
                              className="w-full py-3 bg-[#166534] hover:bg-[#15803d] text-white rounded-md text-xs font-bold transition-colors uppercase border border-[#22c55e]/30 mt-2"
                            >
                              {loading ? '...' : (lang === 'pt' ? 'LOGIN & INICIAR AUTO-FARMING' : 'LOGIN & START AUTO-FARMING')}
                            </button>
                          )}
                          {status?.steamGuardRequired && (
                            <div className="p-4 border border-[#3b82f6]/30 bg-[#3b82f6]/10 rounded-md mt-2 space-y-3">
                              <label className="text-xs text-[#3b82f6] font-bold uppercase block">{t[lang].steamGuardCode} ({status.steamGuardDomain})</label>
                              <input 
                                type="text" 
                                value={steamGuardCode}
                                onChange={(e) => setSteamGuardCode(e.target.value)}
                                placeholder={t[lang].steamGuardCode} 
                                className="w-full bg-[#080b0e] border border-[#3b82f6]/50 rounded-md px-4 py-3 text-xs font-mono focus:border-[#3b82f6] outline-none text-white transition-colors" 
                              />
                              <button 
                                onClick={handleSteamGuard}
                                disabled={loading || !steamGuardCode}
                                className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-md text-xs font-bold transition-colors uppercase disabled:opacity-50"
                              >{t[lang].submitCode}</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FARMING MANUAL (APPID) */}
                  {status?.isClientLoggedIn && !status?.steamGuardRequired && (
                  <div 
                    ref={manualFarmRef}
                    className={`bg-[#10151c] border rounded-lg overflow-hidden transition-all duration-1000 ${
                      highlightManualFarm ? 'border-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-[#1d2630]'
                    }`}
                  >
                      <div className="px-5 py-4 border-b border-[#1d2630] bg-[#0d1217] flex items-center gap-2">
                        <Code size={16} className="text-[#3b82f6]" />
                        <h2 className="text-xs font-bold uppercase text-white tracking-wider">Farming Manual (AppID)</h2>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={manualAppId}
                            onChange={(e) => setManualAppId(e.target.value)}
                            placeholder="Ex: 730, 570, 440" 
                            className="flex-1 bg-[#080b0e] border border-[#1d2630] rounded-md px-4 py-3 text-xs font-mono focus:border-[#3b82f6]/50 outline-none text-white transition-colors placeholder-[#4b5563]" 
                          />
                          <button 
                            onClick={handleManualFarm}
                            disabled={loading || !manualAppId}
                            className="px-6 py-3 bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white border border-[#3b82f6]/30 rounded-md text-xs font-bold transition-colors uppercase disabled:opacity-50"
                          >
                            Farm
                          </button>
                          {status?.activeAppIds && status.activeAppIds.length > 0 && (
                            <button 
                              onClick={handleStopFarm}
                              disabled={loading}
                              className="px-6 py-3 bg-[#7f1d1d] hover:bg-[#991b1b] text-white border border-[#f87171]/30 rounded-md text-xs font-bold transition-colors uppercase"
                            >
                              Stop
                            </button>
                          )}
                        </div>
                        
                        <div>
                          <button onClick={() => setShowTagsHelp(!showTagsHelp)} className="text-[#8b949e] hover:text-white transition-colors flex items-center gap-1.5 text-xs">
                            <HelpCircle size={14} /> {t[lang].howToUseTags}
                          </button>
                          {showTagsHelp && (
                            <div className="mt-3 p-4 bg-[#080b0e] border border-[#1d2630] rounded-md text-xs text-[#8b949e] space-y-3">
                              <p><strong className="text-white">{t[lang].stopRunningTitle}</strong> <br/> {t[lang].stopRunningDesc}</p>
                              <p><strong className="text-white">{t[lang].oneAppIdTitle}</strong> <br/> {t[lang].oneAppIdDesc}</p>
                              <p><strong className="text-white">{t[lang].multiAppIdTitle}</strong> <br/> {t[lang].multiAppIdDesc}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  

                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/tutorial" element={<TutorialPage />} />
        <Route path="*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}

