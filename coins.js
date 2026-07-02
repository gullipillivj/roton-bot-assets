// coins.js

const reputedCoins = [
  "BTCUSDT","ETHUSDT","BNBUSDT","ADAUSDT","XRPUSDT",
  "SOLUSDT","DOTUSDT","MATICUSDT","LINKUSDT","LTCUSDT",
  "AVAXUSDT","NEARUSDT","APTUSDT","SUIUSDT","ICPUSDT",
  "ATOMUSDT","FILUSDT","TRXUSDT","ETCUSDT","EOSUSDT",
  "DOGEUSDT","SHIBUSDT","PEPEUSDT","FLOKIUSDT","BONKUSDT"
];

async function getRisingCoins() {
    try {
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
            return ["BTCUSDT","ETHUSDT","ADAUSDT","LINKUSDT","SOLUSDT","AVAXUSDT","DOGEUSDT","SHIBUSDT"];
        }

        // DEBUG: show all coins selected
        logToPanel(`[DEBUG] Coins fetched from Binance: ${topCoins.join(", ")}`);

        return topCoins;
    } catch (err) {
        logToPanel(`[ERROR] Failed to fetch rising coins: ${err}`);
        return ["BTCUSDT","ETHUSDT","ADAUSDT","LINKUSDT","SOLUSDT","AVAXUSDT","DOGEUSDT","SHIBUSDT"];
    }
}

async function pickBestCoin() {
    const coins = await getRisingCoins();
    const index = Math.floor(Math.random() * coins.length);
    return coins[index];
}
