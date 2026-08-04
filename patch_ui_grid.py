import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Update grid classes and move "Add New Session" to top
old_grid_start = """                    <div className="p-6 grid max-md:grid-flow-col max-md:grid-rows-2 max-md:auto-cols-[85%] max-md:overflow-x-auto gap-4 custom-scrollbar-blue max-md:pb-6 md:grid-cols-2">
                      {(status?.activeAppIds?.length > 0 || status?.pausedGames?.length > 0) ? (
                        <>
                        {status?.activeAppIds?.map((id: number) => ("""

new_grid_start = """                    <div className={`p-6 grid grid-flow-col max-md:auto-cols-[85%] md:auto-cols-[calc(50%-8px)] overflow-x-auto gap-4 custom-scrollbar-blue pb-6 ${((status?.activeAppIds?.length || 0) + (status?.pausedGames?.length || 0)) === 0 ? 'grid-rows-1' : 'grid-rows-2'}`}>
                      {/* Add New Session Card */}
                      <div onClick={handleAddNewSession} className="bg-[#0b1016] border border-dashed border-[#1d2630] hover:border-[#22c55e]/50 rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#22c55e] text-[#22c55e] group-hover:bg-[#22c55e]/10 transition-colors">
                          <Plus size={24} />
                        </div>
                        <div className="text-sm font-bold text-white tracking-wider">ADICIONAR NOVA SESSÃO</div>
                        <div className="text-xs text-[#8b949e]">Inicie uma nova sessão de farm</div>
                      </div>
                      
                      {(status?.activeAppIds?.length > 0 || status?.pausedGames?.length > 0) ? (
                        <>
                        {status?.activeAppIds?.map((id: number) => ("""

content = content.replace(old_grid_start, new_grid_start)

# Remove the old "Add New Session" block
old_list_end = """                        </>
                      ) : (
                        <div className="col-span-full py-8 text-center text-[#8b949e] text-sm">
                          {t[lang].noActiveSessions}
                        </div>
                      )}

                      {/* Add New Session Card */}
                      <div onClick={handleAddNewSession} className="bg-[#0b1016] border border-dashed border-[#1d2630] hover:border-[#22c55e]/50 rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#22c55e] text-[#22c55e] group-hover:bg-[#22c55e]/10 transition-colors">
                          <Plus size={24} />
                        </div>
                        <div className="text-sm font-bold text-white tracking-wider">ADICIONAR NOVA SESSÃO</div>
                        <div className="text-xs text-[#8b949e]">Inicie uma nova sessão de farm</div>
                      </div>
                    </div>"""

new_list_end = """                        </>
                      ) : null}
                    </div>"""

content = content.replace(old_list_end, new_list_end)

# Also update the Cartas Coletadas value (and I'll update Cartas Restantes to exactly what it was just in case but Cartas Restantes was already fine, let's fix Cartas Coletadas)
old_coletadas = """                    <div className="flex items-center gap-2 text-[10px] text-[#8b949e] font-bold tracking-wider uppercase">
                      <Package size={14} className="text-[#22c55e]" />
                      {t[lang].collectedCards}
                    </div>
                  </div>
                  <div className="text-3xl font-mono text-white font-bold z-10">{status?.cardsDropped || 0}</div>"""

new_coletadas = """                    <div className="flex items-center gap-2 text-[10px] text-[#8b949e] font-bold tracking-wider uppercase">
                      <Package size={14} className="text-[#22c55e]" />
                      {t[lang].collectedCards}
                    </div>
                  </div>
                  <div className="text-3xl font-mono text-white font-bold z-10">{status?.collectedCardsDetails?.length || status?.cardsDropped || 0}</div>"""

content = content.replace(old_coletadas, new_coletadas)

# Fix Cartas Restantes too in case it was wrong
old_restantes = """                    <div className="flex items-center gap-2 text-[10px] text-[#8b949e] font-bold tracking-wider uppercase">
                      <Layers size={14} className="text-[#eab308]" />
                      {t[lang].remainingCards}
                    </div>
                  </div>
                  <div className="text-3xl font-mono text-white font-bold z-10">
                    {status?.availableGamesToFarm?.reduce((acc: number, g: any) => acc + (g.drops || 0), 0) || 0}
                  </div>"""

new_restantes = """                    <div className="flex items-center gap-2 text-[10px] text-[#8b949e] font-bold tracking-wider uppercase">
                      <Layers size={14} className="text-[#eab308]" />
                      {t[lang].remainingCards}
                    </div>
                  </div>
                  <div className="text-3xl font-mono text-white font-bold z-10">
                    {status?.availableGamesToFarm?.reduce((acc: number, g: any) => acc + (g.drops || 0), 0) || 0}
                  </div>"""
content = content.replace(old_restantes, new_restantes)

with open('src/App.tsx', 'w') as f:
    f.write(content)
