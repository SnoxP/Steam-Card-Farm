import re

with open('server.ts', 'r') as f:
    content = f.read()

# Add a background price fetcher
background_fetcher = """
    private async updatePricesSlowly(cards: any[]) {
      for (const card of cards) {
        if (!this.botState.isClientLoggedIn) break; // Stop if logged out
        const existingCard = this.botState.collectedCardsDetails.find(c => c.title === card.name);
        if (existingCard && existingCard.minPrice === 'N/A') {
          try {
            const url = `https://steamcommunity.com/market/priceoverview/?appid=753&currency=1&market_hash_name=${encodeURIComponent(card.market_hash_name)}`;
            const res = await fetch(url, {
              headers: { 'Cookie': (this.community._cookies || []).join('; ') }
            });
            if (res.status === 429) {
              await new Promise(r => setTimeout(r, 60000)); // wait 1 minute on 429
              continue;
            }
            const data = await res.json();
            if (data && data.success) {
              existingCard.minPrice = data.lowest_price || data.median_price || 'N/A';
              this.saveCurrentSession();
            }
          } catch(e) {
            // ignore
          }
          await new Promise(r => setTimeout(r, 3000)); // 3 seconds delay
        }
      }
    }
"""

content = content.replace("public updateCollectedCards() {", background_fetcher + "\n    public updateCollectedCards() {")

# Modify updateCollectedCards to call it
old_update = """          this.botState.collectedCardsDetails = cards.map(item => ({
            image: `https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url}`,
            title: item.name,
            minPrice: 'N/A'
          }));
          this.saveCurrentSession();"""

new_update = """          // Preserve existing prices
          this.botState.collectedCardsDetails = cards.map(item => {
            const existing = this.botState.collectedCardsDetails.find(c => c.title === item.name);
            return {
              image: `https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url}`,
              title: item.name,
              minPrice: existing ? existing.minPrice : 'N/A'
            };
          });
          this.saveCurrentSession();
          
          // Start background price fetching without blocking
          this.updatePricesSlowly(cards);"""

content = content.replace(old_update, new_update)

with open('server.ts', 'w') as f:
    f.write(content)
