import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Restore disabled state on Farm buttons
content = content.replace("disabled={loading}\n                            className=\"px-4 py-2 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer disabled:opacity-50\"\n                          >\n                            Farm", "disabled={loading || !manualAppId}\n                            className=\"px-4 py-2 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded text-xs font-bold transition-colors shadow-sm uppercase cursor-pointer disabled:opacity-50\"\n                          >\n                            Farm")

# Update the help text
old_help = '<p><strong className="text-white">Sem AppID:</strong> Deixe o campo vazio e aperte em "Farm" (ou aperte em "Stop") para parar todos os AppIDs que estão rodando.</p>'
new_help = '<p><strong className="text-white">Para parar de rodar:</strong> Aperte o botão "Stop" para parar todos os AppIDs que estão rodando.</p>'
content = content.replace(old_help, new_help)

with open('src/App.tsx', 'w') as f:
    f.write(content)
