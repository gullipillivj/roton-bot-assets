// coins.js

function safeLog(msg) {
    if (typeof window.logToPanel === "function") {
        window.logToPanel(msg);
    } else {
        console.log(msg);
    }
}

safeLog("[DEBUG] coins.js loaded successfully");

async function getRisingCoins() {
    try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        const data = await res.json();
        const filtered = data.filter(item =>
            item.symbol.endsWith("USDT") &&
            Math.abs(parseFloat(item.priceChangePercent)) > 0.5
        );
        filtered.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));
        const topCoins = filtered.slice(0, 5).map(item => item.symbol);
        safeLog(`[DEBUG] Top coins: ${topCoins.join(", ")}`);
        return topCoins;
    } catch (err) {
        safeLog(`[ERROR] getRisingCoins failed: ${err}`);
        return [];
    }
}

async function pickBestCoin() {
    const coins = await getRisingCoins();
    if (!coins || coins.length === 0) return null;
    return coins[0];
}

window.getRisingCoins = getRisingCoins;
window.pickBestCoin = pickBestCoin;
