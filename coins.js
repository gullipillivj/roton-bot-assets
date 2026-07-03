// coins.js

const reputedCoins = [
  "BTCUSDT","ETHUSDT","BNBUSDT","ADAUSDT","XRPUSDT",
  "SOLUSDT","DOTUSDT","MATICUSDT","LINKUSDT","LTCUSDT",
  "AVAXUSDT","NEARUSDT","APTUSDT","SUIUSDT","ICPUSDT",
  "ATOMUSDT","FILUSDT","TRXUSDT","ETCUSDT","EOSUSDT",
  "DOGEUSDT","SHIBUSDT","PEPEUSDT","FLOKIUSDT","BONKUSDT"
];

function safeLog(msg) {
    if (typeof window.logToPanel === "function") {
        window.logToPanel(msg);
    } else {
        console.log(msg);
    }
}

async function getRisingCoins() {
    try {
        // ✅ Correct Binance endpoint
        const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        const data = await res.json();

        const filtered = data.filter(item =>
            item.symbol.endsWith("USDT") &&
            Math.abs(parseFloat(item.priceChangePercent)) > 0.5
        );

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
            return fallbackCoins();
        }

        safeLog(`[DEBUG] Coins fetched from Binance: ${topCoins.join(", ")}`);
        return topCoins;
    } catch (err) {
        safeLog(`[ERROR] Failed to fetch rising coins: ${err}`);
        return fallbackCoins();
    }
}

function fallbackCoins() {
    return ["BTCUSDT","ETHUSDT","ADAUSDT","LINKUSDT","SOLUSDT","AVAXUSDT","DOGEUSDT","SHIBUSDT"];
}

async function pickBestCoin() {
    const coins = await getRisingCoins();
    if (!coins || coins.length === 0) return "BTCUSDT"; 
    // Always returns the top performing coin string ending in USDT
    return coins[0]; 
}

window.getRisingCoins = getRisingCoins;
window.pickBestCoin = pickBestCoin;
