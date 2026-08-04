const go = async () => {
  const res = await fetch('https://steamcommunity.com/market/priceoverview/?appid=753&currency=7&market_hash_name=730-CS:GO%20Profile%20Background');
  console.log(res.status, await res.text());
}
go();
