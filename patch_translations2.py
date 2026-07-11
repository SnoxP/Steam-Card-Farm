import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pt_add = '    sessionSaved: "Sessão Salva: Um token de sessão válido foi encontrado. Você pode continuar farmando sem digitar sua senha."'
en_add = '    sessionSaved: "Session Saved: A valid session token was found. You can continue farming without entering your password."'

content = content.replace('    tutorialHelp: "Não sabe o que fazer? (Ajuda)"', '    tutorialHelp: "Não sabe o que fazer? (Ajuda)",\n' + pt_add)
content = content.replace('    tutorialHelp: "Don\'t know what to do? (Help)"', '    tutorialHelp: "Don\'t know what to do? (Help)",\n' + en_add)

with open('src/App.tsx', 'w') as f:
    f.write(content)
