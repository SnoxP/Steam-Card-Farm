const go = async () => {
  const res = await fetch('https://steamcommunity.com/market/priceoverview/?appid=753&currency=1&market_hash_name=292030-Geralt%20of%20Rivia%20%28Foil%29');
  console.log(await res.text());
}
go();
