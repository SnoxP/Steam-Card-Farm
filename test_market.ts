import SteamCommunity from 'steamcommunity';
const community = new SteamCommunity();
community.getMarketItem(753, '292030-Geralt of Rivia (Foil)', 1, (err, item) => {
    console.log(err, item);
});
