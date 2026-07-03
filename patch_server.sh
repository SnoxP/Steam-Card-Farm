#!/bin/bash
# Insert import
sed -i '1s/^/import { recordUserActivity, recordCardsDropped, loadStats } from ".\/adminStats";\n/' server.ts

# Insert logic in checkBadgesAndFarm after drop detection
# The line is: addLog(`[Coleta] Sucesso! ${difference} nova(s) carta(s) coletada(s)/dropada(s)!`);
sed -i '/addLog(`\[Coleta\] Sucesso/a \
      if (client.steamID) recordCardsDropped(client.steamID.getSteamID64(), difference);' server.ts

# Insert logic in /api/status or loggedOn to recordUserActivity
