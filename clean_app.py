import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix the translation object syntax errors
content = content.replace('    multiAppIdDesc: "{t[lang].multiAppIdDesc}",,\n', '    multiAppIdDesc: "Irá rodar múltiplos jogos ao mesmo tempo. (Ex: 730, 570, 440, 578080)",\n')
content = content.replace('    howToUseTags: "{t[lang].howToUseTags}",\n', '    howToUseTags: "Como usar as tags de AppID?",\n')
content = content.replace('    stopRunningTitle: "{t[lang].stopRunningTitle}",\n', '    stopRunningTitle: "Para parar de rodar:",\n')
content = content.replace("    stopRunningDesc: '{t[lang].stopRunningDesc}',\n", '    stopRunningDesc: \'Aperte o botão "Stop" para parar todos os AppIDs que estão rodando.\',\n')
content = content.replace('    oneAppIdTitle: "{t[lang].oneAppIdTitle}",\n', '    oneAppIdTitle: "1 AppID:",\n')
content = content.replace('    oneAppIdDesc: "{t[lang].oneAppIdDesc}",\n', '    oneAppIdDesc: "Irá rodar um único jogo escolhido. (Ex: 730)",\n')
content = content.replace('    multiAppIdTitle: "{t[lang].multiAppIdTitle}",\n', '    multiAppIdTitle: "Múltiplos AppIDs:",\n')

content = content.replace('    statusOffline: "Offline",,\n', '    statusOffline: "Offline",\n')
content = content.replace('    oneAppIdTitle: "{t[lang].oneAppIdTitle}",\n', '    oneAppIdTitle: "1 AppID:",\n')

# Also add the missing PT status
pt_status = '''    statusOnline: "Disponível",
    statusAway: "Ausente",
    statusSnooze: "Inativo",
    statusBusy: "Ocupado",
    statusTrade: "Disponível para Trocas",
    statusPlay: "Disponível para Jogar",
    statusInvisible: "Invisível",
    statusOffline: "Offline",'''

if 'statusOnline: "Disponível"' not in content:
    content = content.replace('    multiAppIdDesc: "Irá rodar múltiplos jogos ao mesmo tempo. (Ex: 730, 570, 440, 578080)",\n', '    multiAppIdDesc: "Irá rodar múltiplos jogos ao mesmo tempo. (Ex: 730, 570, 440, 578080)",\n' + pt_status + '\n')

with open('src/App.tsx', 'w') as f:
    f.write(content)
