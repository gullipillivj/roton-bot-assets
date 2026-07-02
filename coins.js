// coins.js

async function getRisingCoins() {
    try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        const data = await res.json();

        // filter: USDT pairs, decent volume, meaningful % change
        const filtered = data.filter(item =>
            item.symbol.endsWith("USDT") &&
            parseFloat(item.quoteVolume) > 20000000 && // > $20M daily volume
            Math.abs(parseFloat(item.priceChangePercent)) > 0.5
        );

        // sort by % gain descending
        filtered.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));

        // Tier 1: large‑caps
        const largeCaps = ["BTCUSDT","ETHUSDT","BNBUSDT","ADAUSDT","LINKUSDT","DOTUSDT","MATICUSDT"];
        const tier1 = filtered.filter(item => largeCaps.includes(item.symbol));

        // Tier 2: mid‑caps
        const midCaps = ["SOLUSDT","AVAXUSDT","NEARUSDT","APTUSDT","SUIUSDT","ICPUSDT"];
        const tier2 = filtered.filter(item => midCaps.includes(item.symbol));

        // Tier 3: short‑caps
        const shortCaps = ["DOGEUSDT","SHIBUSDT","PEPEUSDT","FLOKIUSDT","BONKUSDT"];
        const tier3 = filtered.filter(item => shortCaps.includes(item.symbol));

        // weighted pool: 40% large, 40% mid, 20% short
        const pool = [];
        for (let i = 0; i < 4 && i < tier1.length; i++) pool.push(tier1[i].symbol);
        for (let i = 0; i < 4 && i < tier2.length; i++) pool.push(tier2[i].symbol);
        for (let i = 0; i < 2 && i < tier3.length; i++) pool.push(tier3[i].symbol);

        // fallback if API returns junk
        if (pool.length === 0) {
            return ["BTCUSDT","ETH
