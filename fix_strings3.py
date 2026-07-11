import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add to translations
pt_add = '''    howToUseTags: "Como usar as tags de AppID?",
    stopRunningTitle: "Para parar de rodar:",
    stopRunningDesc: 'Aperte o botão "Stop" para parar todos os AppIDs que estão rodando.',
    oneAppIdTitle: "1 AppID:",
    oneAppIdDesc: "Irá rodar um único jogo escolhido. (Ex: 730)",
    multiAppIdTitle: "Múltiplos AppIDs:",
    multiAppIdDesc: "Irá rodar múltiplos jogos ao mesmo tempo. (Ex: 730, 570, 440, 578080)",'''
en_add = '''    howToUseTags: "How to use AppID tags?",
    stopRunningTitle: "To stop running:",
    stopRunningDesc: 'Press the "Stop" button to stop all running AppIDs.',
    oneAppIdTitle: "1 AppID:",
    oneAppIdDesc: "Will run a single chosen game. (Ex: 730)",
    multiAppIdTitle: "Multiple AppIDs:",
    multiAppIdDesc: "Will run multiple games at the same time. (Ex: 730, 570, 440, 578080)",'''

content = content.replace('currentFarm: "Farm Atual",', 'currentFarm: "Farm Atual",\n' + pt_add)
content = content.replace('currentFarm: "Current Farm",', 'currentFarm: "Current Farm",\n' + en_add)

# Replace in JSX
content = content.replace('Como usar as tags de AppID?', '{t[lang].howToUseTags}')
content = content.replace('Para parar de rodar:', '{t[lang].stopRunningTitle}')
content = content.replace('Aperte o botão "Stop" para parar todos os AppIDs que estão rodando.', '{t[lang].stopRunningDesc}')
content = content.replace('1 AppID:', '{t[lang].oneAppIdTitle}')
content = content.replace('Irá rodar um único jogo escolhido. (Ex: 730)', '{t[lang].oneAppIdDesc}')
content = content.replace('Múltiplos AppIDs:', '{t[lang].multiAppIdTitle}')
content = content.replace('Irá rodar múltiplos jogos ao mesmo tempo. (Ex: 730, 570, 440, 578080)', '{t[lang].multiAppIdDesc}')

# Write file
with open('src/App.tsx', 'w') as f:
    f.write(content)
