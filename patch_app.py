import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add state
content = content.replace("const [manualAppId, setManualAppId] = useState('');", "const [manualAppId, setManualAppId] = useState('');\n  const [showTagsHelp, setShowTagsHelp] = useState(false);")

# Add Help Circle icon
if 'HelpCircle' not in content:
    content = content.replace("import { ShieldAlert, Menu, X } from 'lucide-react';", "import { ShieldAlert, Menu, X, HelpCircle } from 'lucide-react';")

help_box = """
                        <div className="mt-2">
                          <button onClick={() => setShowTagsHelp(!showTagsHelp)} className="text-[#8b949e] hover:text-white transition-colors flex items-center gap-1 text-xs">
                            <HelpCircle size={14} /> Como usar as tags de AppID?
                          </button>
                          {showTagsHelp && (
                            <div className="mt-2 p-3 bg-[#161b22] border border-[#30363d] rounded text-xs text-[#8b949e] space-y-2">
                              <p><strong className="text-white">Sem AppID:</strong> Irá finalizar (parar) todos os jogos que estão sendo rodados no momento.</p>
                              <p><strong className="text-white">1 AppID:</strong> Irá rodar um único jogo escolhido. (Ex: 730)</p>
                              <p><strong className="text-white">Múltiplos AppIDs:</strong> Irá rodar múltiplos jogos ao mesmo tempo. (Ex: 730, 570, 440, 578080 - CS:GO, Dota 2, TF2, PUBG)</p>
                            </div>
                          )}
                        </div>"""

replacement_chunk = """<label className="text-[10px] text-[#8b949e] uppercase font-bold">{t[lang].manualFarm}</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={manualAppId}
                            onChange={(e) => setManualAppId(e.target.value)}
                            placeholder="Ex: 730, 570, 440" 
                            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs font-mono focus:border-blue-500 outline-none text-[#c9d1d9]" 
                          />
                          <button 
                            onClick={handleManualFarm}
                            disabled={loading}
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
                        </div>""" + help_box

# We need to replace the manual farm block in both places.
old_block_pattern = r'<label className="text-\[10px\] text-\[#8b949e\] uppercase font-bold">\{t\[lang\]\.manualFarm\}<\/label>\s*<div className="flex gap-2">\s*<input \s*type="text" \s*value=\{manualAppId\}\s*onChange=\{\(e\) => setManualAppId\(e\.target\.value\)\}\s*placeholder="e\.g\., 730, 440" \s*className="flex-1 bg-\[#0d1117\] border border-\[#30363d\] rounded px-3 py-2 text-xs font-mono focus:border-blue-500 outline-none text-\[#c9d1d9\]" \s*\/>\s*<button \s*onClick=\{handleManualFarm\}\s*disabled=\{loading \|\| !manualAppId\}\s*className="px-4 py-2 bg-\[#1f6feb\] hover:bg-\[#388bfd\] text-white rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer disabled:opacity-50"\s*>\s*Farm\s*<\/button>\s*\{status\?\.activeAppIds && status\.activeAppIds\.length > 0 && \(\s*<button \s*onClick=\{handleStopFarm\}\s*disabled=\{loading\}\s*className="px-4 py-2 bg-\[#da3633\] hover:bg-\[#f85149\] text-white rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer"\s*>\s*Stop\s*<\/button>\s*\)\}\s*<\/div>'

content = re.sub(old_block_pattern, replacement_chunk, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
