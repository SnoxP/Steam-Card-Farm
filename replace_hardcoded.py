import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

replacements = {
    'Trigger Auto-Farm': '{t[lang].triggerAutoFarm}',
    'Stop Farming': '{t[lang].stopFarming}',
    'Logout & Clear Session': '{t[lang].logoutClear}',
    'Submit Code': '{t[lang].submitCode}',
    'Steam Guard Code ({status.steamGuardDomain})': '{t[lang].steamGuardCode} ({status.steamGuardDomain})',
    'Restore Session': '{t[lang].restoreSession}',
    'Não sabe o que fazer? (Ajuda)': '{t[lang].tutorialHelp}',
    '<strong>Session Saved:</strong> A valid session token was found. You can continue farming without entering your password.': '<strong>{t[lang].sessionSaved.split(":")[0]}:</strong> {t[lang].sessionSaved.split(":")[1]}',
}

for old, new in replacements.items():
    if '{t[lang].sessionSaved' in new:
        content = content.replace(old, new)
    else:
        # For buttons and labels, they might just be text inside tags
        content = re.sub(rf'>{old}<', f'>{new}<', content)

# But steam guard code label is: <label className="...">Steam Guard Code ({status.steamGuardDomain})</label>
content = content.replace('Steam Guard Code ({status.steamGuardDomain})', '{t[lang].steamGuardCode} ({status.steamGuardDomain})')

# Also fix the restore session button:
content = content.replace("{loading ? '...' : 'Restore Session'}", "{loading ? '...' : t[lang].restoreSession}")

with open('src/App.tsx', 'w') as f:
    f.write(content)
