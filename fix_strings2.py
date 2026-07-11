import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add currentFarm to translations
pt_add = '    currentFarm: "Farm Atual",'
en_add = '    currentFarm: "Current Farm",'

content = content.replace('management: "Gerenciamento"', 'management: "Gerenciamento",\n' + pt_add)
content = content.replace('management: "Management"', 'management: "Management",\n' + en_add)

content = content.replace('>Games Owned<', '>{t[lang].gamesOwned}<')
content = content.replace('>Current Farm<', '>{t[lang].currentFarm}<')
content = content.replace('Current Farm: ', '{t[lang].currentFarm}: ') # just in case

# Fix the translation map
with open('src/App.tsx', 'w') as f:
    f.write(content)
