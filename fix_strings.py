import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace hardcoded JSX content with {t[lang].variable}
content = re.sub(r'>\s*Trigger Auto-Farm\s*<', '>{t[lang].triggerAutoFarm}<', content)
content = re.sub(r'>\s*Stop Farming\s*<', '>{t[lang].stopFarming}<', content)
content = re.sub(r'>\s*Logout & Clear Session\s*<', '>{t[lang].logoutClear}<', content)
content = re.sub(r'>\s*Submit Code\s*<', '>{t[lang].submitCode}<', content)
content = re.sub(r'>\s*Não sabe o que fazer\? \(Ajuda\)\s*<', '>{t[lang].tutorialHelp}<', content)

# Session saved
session_str = '<p><strong>Session Saved:</strong> A valid session token was found. You can continue farming without entering your password.</p>'
new_session_str = '<p><strong>{t[lang].sessionSaved.split(":")[0]}:</strong> {t[lang].sessionSaved.split(":")[1]}</p>'
content = content.replace(session_str, new_session_str)

# Some remaining things?
content = content.replace("Steam Card Farmer", "Steam Card Farmer") # no change

with open('src/App.tsx', 'w') as f:
    f.write(content)
