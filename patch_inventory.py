import re

with open('server.ts', 'r') as f:
    content = f.read()

func = """
    public updateCollectedCards() {
      if (!this.client.steamID) return;
      this.community.getUserInventoryContents(this.client.steamID, 753, 6, true, (err: any, inventory: any[]) => {
        if (err) {
          // this.addLog(`[System] Erro ao obter inventário para atualizar cartas coletadas: ${err.message}`);
          return;
        }
        if (inventory) {
          const cards = inventory.filter(item => item.tags && item.tags.some((t: any) => t.internal_name === 'item_class_2'));
          this.botState.collectedCardsDetails = cards.map(item => ({
            image: `https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url}`,
            title: item.name,
            minPrice: 'N/A'
          }));
          this.saveCurrentSession();
        }
      });
    }
"""

content = content.replace("public startCheckTimer() {", func + "\n    public startCheckTimer() {")

# call it when logged in
content = content.replace(
    "this.botState.personaStateString = 'Online';",
    "this.botState.personaStateString = 'Online';\n          this.updateCollectedCards();"
)

# call it when drop occurs
old_drop = """            if (this.client.steamID) {
               recordCardsDropped(this.client.steamID.getSteamID64().toString(), diff);
            }
            this.saveCurrentSession();"""
new_drop = """            if (this.client.steamID) {
               recordCardsDropped(this.client.steamID.getSteamID64().toString(), diff);
               this.updateCollectedCards();
            } else {
               this.saveCurrentSession();
            }"""
content = content.replace(old_drop, new_drop)

with open('server.ts', 'w') as f:
    f.write(content)
