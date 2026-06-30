// coins.js — Binance API helpers
// Debug mode enabled
logMessage("[DEBUG] Binance data received: " + data.symbol + " change=" + data.priceChangePercent + "%");
async function pickBestCoin(symbols) {
    let bestCoin = null;
    let bestChange = -Infinity;
    console.log("function name from", " coins");
    for (const sym of symbols) {
        try {
            const res = await fetch(
                `https://api.binance.com/api/v3/klines?symbol=${sym}&interval=5m&limit=20`
            );
            const data = await res.json();
            const prices = data.map(k => parseFloat(k[4]));
            const last = prices[prices.length - 1];
            const min = Math.min(...prices);
            const change = (last - min) / min;

            console.debug("[Coins] Symbol:", sym, "Last:", last, "Change:", change);

            if (change > bestChange) {
                bestChange = change;
                bestCoin = { symbol: sym, price: last, change24h: change * 100 };
            }
        } catch (err) {
            console.error("[Coins] Error fetching data for", sym, err);
        }
    }

    console.debug("[Coins] BestCoin selected:", bestCoin);
    return bestCoin;
}

function showTrend(change24h) {
    const trend = change24h >= 0 ? "UP" : "DOWN";
    document.getElementById("status").textContent =
        `Market trend today: ${trend}`;
    logMessage(`Trend detected: ${trend} (${change24h.toFixed(2)}%)`);

    console.debug("[Coins] Trend:", trend, "Change:", change24h.toFixed(2));
}
window.pickBestCoin = pickBestCoin;
