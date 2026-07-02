// coins.js

const reputedCoins = [
  // Large‑caps
  "BTCUSDT","ETHUSDT","BNBUSDT","ADAUSDT","XRPUSDT",
  "SOLUSDT","DOTUSDT","MATICUSDT","LINKUSDT","LTCUSDT",

  // Mid‑caps
  "AVAXUSDT","NEARUSDT","APTUSDT","SUIUSDT","ICPUSDT",
  "ATOMUSDT","FILUSDT","TRXUSDT","ETCUSDT","EOSUSDT",

  // Popular short‑caps
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

        // High range: > 1B
        const highRange = filtered.filter(item => parseFloat(item.quoteVolume) > 1_000_000_000).slice(0, 3);

        // Mid range: 100M–1B
        const midRange = filtered.filter(item =>
            parseFloat(item.quoteVolume) > 100_000_000 &&
            parseFloat(item.quoteVolume) <= 1_000_000_000
        ).slice(0, 3);

        // Low range: 10M–100M
        const lowRange = filtered.filter(item =>
            parseFloat(item.quoteVolume) > 10_000_000 &&
            parseFloat(item.quoteVolume) <= 100_000_000
        ).slice(0, 3);

        const topCoins = [...highRange, ...midRange, ...lowRange].map(item => item.symbol);

        if (topCoins.length === 0) {
            return ["BTCUSDT","ETHUSDT","ADAUSDT","LINKUSDT","SOLUSDT","AVAXUSDT","DOGEUSDT","SHIBUSDT"];
        }

        // internal log only, not shown to users
        console.log("Selected coins:", topCoins);
        return topCoins;
    } catch (err) {
        console.error("Failed to fetch rising coins:", err);
        return ["BTCUSDT","ETHUSDT","ADAUSDT","LINKUSDT","SOLUSDT","AVAXUSDT","DOGEUSDT","SHIBUSDT"];
    }
}

async function pickBestCoin() {
    const coins = await getRisingCoins();
    const index = Math.floor(Math.random() * coins.length);
    return coins[index];
}
