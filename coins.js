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
    safeLog("[DEBUG] Entered getRisingCoins()");
    try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        const data = await res.json();
        safeLog(`[DEBUG] getRisingCoins fetched ${data.length} symbols`);

        const filtered = data.filter(item =>
            item.symbol.endsWith("USDT") &&
            Math.abs(parseFloat(item.priceChangePercent)) > 0.5
        );

        safeLog(`[DEBUG] Filtered USDT coins count: ${filtered.length}`);

        filtered.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));

        const highRange = filtered.filter(item => parseFloat(item.quoteVolume) > 1_000_000_000).slice(0, 3);
        const midRange = filtered.filter(item =>
            parseFloat(item.quoteVolume) > 100_000_000 &&
            parseFloat(item.quoteVolume) <= 1_000_000_000
        ).slice(0, 3);
        const lowRange = filtered.filter(item =>
            parseFloat(item.quoteVolume) > 10_000_000 &&
            parseFloat(item.quoteVolume) <= 100_000_000
        ).slice(0, 3);

        const topCoins = [...highRange, ...midRange, ...lowRange].map(item => item.symbol);

        if (topCoins.length === 0) {
            safeLog(`[WARN] No rising coins found, returning empty list`);
            return [];
        }

        safeLog(`[DEBUG] Top coins selected: ${topCoins.join(", ")}`);
        return topCoins;
    } catch (err) {
        safeLog(`[ERROR] Failed to fetch rising coins: ${err}`);
        return [];
    }
}

async function pickBestCoin() {
    safeLog("[DEBUG] Entered pickBestCoin()");
    const coins = await getRisingCoins();
    safeLog(`[DEBUG] pickBestCoin got list: ${coins}`);
    if(!coins || coins.length === 0) {
        safeLog(`[WARN] No coins returned, cannot pick`);
        return null; 
    }
    safeLog(`[DEBUG] Best coin chosen: ${coins[0]}`);
    return coins[0]; 
}

window.getRisingCoins = getRisingCoins;
window.pickBestCoin = pickBestCoin;
