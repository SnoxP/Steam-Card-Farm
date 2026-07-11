import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pt_add = '''    statusOnline: "Disponível",
    statusAway: "Ausente",
    statusSnooze: "Inativo",
    statusBusy: "Ocupado",
    statusTrade: "Disponível para Trocas",
    statusPlay: "Disponível para Jogar",
    statusInvisible: "Invisível",
    statusOffline: "Offline",'''
en_add = '''    statusOnline: "Online",
    statusAway: "Away",
    statusSnooze: "Snooze",
    statusBusy: "Busy",
    statusTrade: "Looking to Trade",
    statusPlay: "Looking to Play",
    statusInvisible: "Invisible",
    statusOffline: "Offline",'''

content = content.replace('multiAppIdDesc: "Irá rodar múltiplos jogos ao mesmo tempo. (Ex: 730, 570, 440, 578080)",', 'multiAppIdDesc: "Irá rodar múltiplos jogos ao mesmo tempo. (Ex: 730, 570, 440, 578080)",\n' + pt_add)
content = content.replace('multiAppIdDesc: "Will run multiple games at the same time. (Ex: 730, 570, 440, 578080)",', 'multiAppIdDesc: "Will run multiple games at the same time. (Ex: 730, 570, 440, 578080)",\n' + en_add)

mapping_old = """    const mapping: Record<string, { label: string, color: string, bg: string }> = {
      'Online': { label: 'Disponível', color: 'text-green-400', bg: 'bg-green-500 shadow-[0_0_8px_#22c55e]' },
      'Away': { label: 'Ausente', color: 'text-amber-400', bg: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' },
      'Snooze': { label: 'Inativo', color: 'text-blue-400', bg: 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' },
      'Busy': { label: 'Ocupado', color: 'text-red-400', bg: 'bg-red-500 shadow-[0_0_8px_#ef4444]' },
      'Looking to Trade': { label: 'Disponível para Trocas', color: 'text-green-400', bg: 'bg-green-500 shadow-[0_0_8px_#22c55e]' },
      'Looking to Play': { label: 'Disponível para Jogar', color: 'text-green-400', bg: 'bg-green-500 shadow-[0_0_8px_#22c55e]' },
      'Invisible': { label: 'Invisível', color: 'text-gray-400', bg: 'bg-gray-500' },
      'Offline': { label: 'Offline', color: 'text-gray-500', bg: 'bg-gray-700' }
    };

    return mapping[state] || { label: state || 'Offline', color: 'text-gray-500', bg: 'bg-gray-700' };"""

mapping_new = """    const mapping: Record<string, { label: string, color: string, bg: string }> = {
      'Online': { label: t[lang].statusOnline, color: 'text-green-400', bg: 'bg-green-500 shadow-[0_0_8px_#22c55e]' },
      'Away': { label: t[lang].statusAway, color: 'text-amber-400', bg: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' },
      'Snooze': { label: t[lang].statusSnooze, color: 'text-blue-400', bg: 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' },
      'Busy': { label: t[lang].statusBusy, color: 'text-red-400', bg: 'bg-red-500 shadow-[0_0_8px_#ef4444]' },
      'Looking to Trade': { label: t[lang].statusTrade, color: 'text-green-400', bg: 'bg-green-500 shadow-[0_0_8px_#22c55e]' },
      'Looking to Play': { label: t[lang].statusPlay, color: 'text-green-400', bg: 'bg-green-500 shadow-[0_0_8px_#22c55e]' },
      'Invisible': { label: t[lang].statusInvisible, color: 'text-gray-400', bg: 'bg-gray-500' },
      'Offline': { label: t[lang].statusOffline, color: 'text-gray-500', bg: 'bg-gray-700' }
    };

    return mapping[state] || { label: state || t[lang].statusOffline, color: 'text-gray-500', bg: 'bg-gray-700' };"""

content = content.replace(mapping_old, mapping_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)
