import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_help1 = '<p><strong className="text-white">Sem AppID:</strong> Irá finalizar (parar) todos os jogos que estão sendo rodados no momento.</p>'
new_help1 = '<p><strong className="text-white">Sem AppID:</strong> Deixe o campo vazio e aperte em "Farm" (ou aperte em "Stop") para parar todos os AppIDs que estão rodando.</p>'

old_help2 = '<p><strong className="text-white">Múltiplos AppIDs:</strong> Irá rodar múltiplos jogos ao mesmo tempo. (Ex: 730, 570, 440, 578080 - CS:GO, Dota 2, TF2, PUBG)</p>'
new_help2 = '<p><strong className="text-white">Múltiplos AppIDs:</strong> Irá rodar múltiplos jogos ao mesmo tempo. (Ex: 730, 570, 440, 578080)</p>'

content = content.replace(old_help1, new_help1)
content = content.replace(old_help2, new_help2)

with open('src/App.tsx', 'w') as f:
    f.write(content)
