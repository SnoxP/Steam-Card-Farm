import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add handleResumeSingleApp
resume_handler = """
  const handleResumeSingleApp = async (appId: number) => {
    try {
      await apiFetch('/api/farm-resume-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId })
      });
      fetchStatus();
    } catch(e) {
      console.error(e);
    }
  };
"""
content = content.replace("const handleStopSingleApp = async (appId: number) => {", resume_handler + "\n  const handleStopSingleApp = async (appId: number) => {")

# Modify active sessions rendering logic
old_list = """                    <div className="p-6 grid max-md:grid-flow-col max-md:grid-rows-2 max-md:auto-cols-[85%] max-md:overflow-x-auto gap-4 custom-scrollbar-blue max-md:pb-6 md:grid-cols-2">
                      {status?.activeAppIds && status.activeAppIds.length > 0 ? (
                        status.activeAppIds.map((id: number) => (
                          <div key={id} className="bg-[#0b1016] border border-[#1d2630] rounded-lg p-4 flex flex-col gap-4 relative">"""

new_list = """                    <div className="p-6 grid max-md:grid-flow-col max-md:grid-rows-2 max-md:auto-cols-[85%] max-md:overflow-x-auto gap-4 custom-scrollbar-blue max-md:pb-6 md:grid-cols-2">
                      {(status?.activeAppIds?.length > 0 || status?.pausedGames?.length > 0) ? (
                        <>
                        {status?.activeAppIds?.map((id: number) => (
                          <div key={id} className="bg-[#0b1016] border border-[#1d2630] rounded-lg p-4 flex flex-col gap-4 relative">"""
content = content.replace(old_list, new_list)

old_list_end = """                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-8 text-center text-[#8b949e] text-sm">
                          {t[lang].noActiveSessions}
                        </div>
                      )}
                    </div>"""

new_list_end = """                            </button>
                          </div>
                        ))}
                        {status?.pausedGames?.map((game: any) => (
                          <div key={game.appId} className="bg-[#0b1016] border border-[#1d2630] opacity-75 rounded-lg p-4 flex flex-col gap-4 relative">
                            <div className="flex justify-between items-start">
                              <div className="w-32 h-16 bg-gray-800 rounded overflow-hidden border border-[#1d2630]">
                                <img src={`https://steamcdn-a.akamaihd.net/steam/apps/${game.appId}/header.jpg`} alt={`App ${game.appId}`} className="w-full h-full object-cover grayscale" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                <div className={`px-2.5 py-1 border text-[9px] font-bold uppercase rounded flex items-center gap-1.5 bg-amber-500/10 border-amber-500/20 text-amber-500`}>
                                  <Activity size={10} />
                                  PAUSADO
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                              <span className="text-lg font-bold text-white font-mono">{game.appId}</span>
                              <span className="text-xs text-[#8b949e]">{game.name || t[lang].unknownGame}</span>
                            </div>

                            <div className="flex flex-col gap-1 text-[11px] text-[#8b949e] font-mono">
                              <div>Restantes: <span className="text-yellow-500">{game.drops} drops</span></div>
                            </div>
                            
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                handleResumeSingleApp(game.appId);
                              }}
                              className="mt-2 w-full py-2.5 bg-gradient-to-b from-[#14532d] to-[#064e3b] hover:from-[#166534] hover:to-[#14532d] text-[#86efac] hover:text-white rounded text-xs font-bold transition-all border border-[#166534]/50 shadow-[0_0_10px_rgba(34,197,94,0.1)] uppercase"
                            >
                              RETOMAR
                            </button>
                          </div>
                        ))}
                        </>
                      ) : (
                        <div className="col-span-full py-8 text-center text-[#8b949e] text-sm">
                          {t[lang].noActiveSessions}
                        </div>
                      )}
                    </div>"""
content = content.replace(old_list_end, new_list_end)

with open('src/App.tsx', 'w') as f:
    f.write(content)

