// coins.js

// Fetch all tradable symbols from Binance
async function getAllCoins() {
    try {
        const response = await fetch("https://api.binance.com/api/v3/exchangeInfo");
        const data = await response.json();

        // Return all tradable symbols
        return data.symbols.map(s => s.symbol);
    } catch (err) {
        logToPanel(`[WARN] Could not fetch coin list: ${err.message}`);
        // Fallback to a few majors if API fails
        return ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT"];
    }
}

// Pick the best coin based on growth and liquidity
async function pickBestCoin() {
    const coins = await getAllCoins();
    let bestCoin = null;
    let bestChange = -Infinity;

    for (const coin of coins) {
        try {
            const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${coin}`);
            const data = await response.json();
            const change = parseFloat(data.priceChangePercent);
            const volume = parseFloat(data.quoteVolume);

            // Only consider coins that are growing AND have decent volume
            if (change > 0 && volume > 1000000) { // 1M USDT threshold
                if (change > bestChange) {
                    bestChange = change;
                    bestCoin = coin;
                }
            }
        } catch (err) {
            logToPanel(`[WARN] Failed to fetch ${coin}: ${err.message}`);
        }
    }

    logToPanel(`Best coin chosen: ${bestCoin} (${bestChange.toFixed(2)}% 24h change)`);
    return bestCoin;
}

// Evaluate coin purchase and return USDT value
async function evaluateCoin(symbol, balance) {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        const data = await response.json();
        const price = parseFloat(data.price);

        // Simulate purchase: how many units we can buy
        const units = balance / price;

        // Current USDT value of holdings
        const usdtValue = units * price;
        return usdtValue;
    } catch (err) {
        logToPanel(`[WARN] Error evaluating ${symbol}: ${err.message}`);
        return balance; // fallback: keep balance unchanged
    }
}

// Expose globally
window.pickBestCoin = pickBestCoin;
window.evaluateCoin = evaluateCoin;
