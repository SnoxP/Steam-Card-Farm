import re

with open('server.ts', 'r') as f:
    content = f.read()

old_manual = """    session.botState.activeAppIds = appIds;
    session.addLog(`Farming manual iniciado para AppIDs: ${appIds.join(', ')}`);
    res.json({ success: true });"""

new_manual = """    session.botState.activeAppIds = appIds;
    session.addLog(`Farming manual iniciado para AppIDs: ${appIds.join(', ')}`);
    
    // Fetch names in background
    fetch(`https://store.steampowered.com/api/appdetails?appids=${appIds.join(',')}`)
      .then(res => res.json())
      .then(data => {
        appIds.forEach(id => {
          if (data[id] && data[id].success && data[id].data && data[id].data.name) {
            const exists = session.botState.allBadges.find(b => b.appId === id);
            if (!exists) {
              session.botState.allBadges.push({
                appId: id,
                name: data[id].data.name,
                drops: 0,
                text: 'Manual'
              });
            } else if (exists.name === 'Jogo Desconhecido' || !exists.name) {
              exists.name = data[id].data.name;
            }
          }
        });
      })
      .catch(err => {
        console.error('Error fetching app details', err);
      });

    res.json({ success: true });"""

content = content.replace(old_manual, new_manual)

with open('server.ts', 'w') as f:
    f.write(content)

