import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add remaining drops to active apps
old_active = """                              <div>Tempo rodado: <span className="text-white">{timeElapsed !== null ? formatElapsed(timeElapsed) : "N/A"}</span></div>
                              {timeLeft !== null && <div>Próxima checagem: <span className="text-green-400">{formatTime(timeLeft)}</span></div>}
                            </div>"""

new_active = """                              <div>Tempo rodado: <span className="text-white">{timeElapsed !== null ? formatElapsed(timeElapsed) : "N/A"}</span></div>
                              {timeLeft !== null && <div>Próxima checagem: <span className="text-green-400">{formatTime(timeLeft)}</span></div>}
                              {status?.availableGamesToFarm?.find((g: any) => g.appId === id) && (
                                <div>Restantes: <span className="text-yellow-500">{status.availableGamesToFarm.find((g: any) => g.appId === id).drops} drops</span></div>
                              )}
                            </div>"""
content = content.replace(old_active, new_active)

with open('src/App.tsx', 'w') as f:
    f.write(content)
