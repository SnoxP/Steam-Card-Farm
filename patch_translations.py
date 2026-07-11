import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pt_add = '    tutorialHelp: "Não sabe o que fazer? (Ajuda)"'
en_add = '    tutorialHelp: "Don\'t know what to do? (Help)"'

content = content.replace('minPrice: "Menor preço"', 'minPrice: "Menor preço",\n' + pt_add)
content = content.replace('minPrice: "Min Price"', 'minPrice: "Min Price",\n' + en_add)
content = content.replace('Logout function AppContent() { Clear Session', 'Logout & Clear Session')

with open('src/App.tsx', 'w') as f:
    f.write(content)
