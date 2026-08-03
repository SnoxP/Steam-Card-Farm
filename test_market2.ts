import SteamCommunity from 'steamcommunity';
const community = new SteamCommunity();
community.request('https://steamcommunity.com/market/priceoverview/?appid=753&currency=1&market_hash_name=292030-Geralt%20of%20Rivia%20%28Foil%29', (err, res, body) => {
    console.log(body);
});
