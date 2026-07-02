// coins.js (test version with 4 coins)

async function pickBestCoin() {
    const coins = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT"];
    let bestCoin = null;
    let bestChange = -Infinity;

    for (const coin of coins) {
        try {
            const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${coin}`);
            if (!response.ok) {
                logToPanel(`[ERROR] API call failed for ${coin}: ${response.status}`);
                continue;
            }
            const data = await response.json();
            const change = parseFloat(data.priceChangePercent);
            const volume = parseFloat(data.quoteVolume);

            logToPanel(`[INFO] ${coin} → 24h change: ${change.toFixed(2)}%, volume: ${volume.toFixed(0)}`);

            if (change > 0 && volume > 1000000) {
                if (change > bestChange) {
                    bestChange = change;
                    bestCoin = coin;
                }
            }
        } catch (err) {
            logToPanel(`[ERROR] Exception fetching ${coin}: ${err.message}`);
        }
    }

    if (!bestCoin) {
        logToPanel(`[WARN] No coin selected — API may be blocked or all coins failing filter`);
    } else {
        logToPanel(`[INFO] Best coin chosen: ${bestCoin}`);
    }
    return bestCoin;
}

async function evaluateCoin(symbol, balance) {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        if (!response.ok) {
            logToPanel(`[ERROR] Price API failed for ${symbol}: ${response.status}`);
            return balance;
        }
        const data = await response.json();
        const price = parseFloat(data.price);

        const units = balance / price;
        const usdtValue = units * price;

        logToPanel(`[INFO] Evaluated ${symbol}: price=${price}, units=${units.toFixed(6)}, value=${usdtValue.toFixed(2)} USDT`);
        return usdtValue;
    } catch (err) {
        logToPanel(`[ERROR] Exception evaluating ${symbol}: ${err.message}`);
        return balance;
    }
}

window.pickBestCoin = pickBestCoin;
window.evaluateCoin = evaluateCoin;
