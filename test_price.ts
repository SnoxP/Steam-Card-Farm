import SteamCommunity from 'steamcommunity';
const community = new SteamCommunity();
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(community)).filter(k => k.toLowerCase().includes('price') || k.toLowerCase().includes('market')));
