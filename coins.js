async function getCoinPrice(symbol) {
  try {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    return parseFloat(data.price);
  } catch (err) {
    console.warn(`[WARN] No internet connection or API error for ${symbol}: ${err.message}`);
    return null; // trap offline/API failure
  }
}

async function evaluateCoins() {
  const coins = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT"];
  let bestCoin = null;
  let bestScore = -Infinity;

  for (const coin of coins) {
    const price = await getCoinPrice(coin);

    // 🚫 Trap null immediately
    if (price === null) {
      console.warn("[WARN] Skipping cycle — no internet connection.");
      return; // exit here, don’t move to next functions
    }

    const score = Math.random() * price; // placeholder evaluation
    if (score > bestScore) {
      bestScore = score;
      bestCoin = coin;
    }
  }

  console.info(`[INFO] Best coin chosen: ${bestCoin} (${bestScore.toFixed(2)})`);
}
