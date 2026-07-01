async function fetch24hChange(symbol) {
    try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`);
        const data = await res.json();
        return parseFloat(data.priceChangePercent);
    } catch (err) {
        logToPanel("Error fetching data for " + symbol + ": " + err);
        return null;
    }
}

async function pickBestCoin() {
    const coins = ["BTC", "ETH", "BNB", "ADA"];
    let bestCoin = null;
    let bestChange = -Infinity;

    for (const coin of coins) {
        const change = await fetch24hChange(coin);
        if (change !== null) {
            logToPanel(`${coin} 24h change: ${change}%`);
            if (change > bestChange) {
                bestChange = change;
                bestCoin = coin;
            }
        }
    }

    logToPanel("Coin evaluation complete, picked: " + bestCoin + " (" + bestChange + "%)");
    return bestCoin;
}
window.pickBestCoin = pickBestCoin;
