async function simulateCycle(userId, cycleId) {
    console.log("function name from", "simulateCycle");

    let hops = 0;
    let profit = 0;

    try {
        const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];
        const bestCoin = await pickBestCoin(symbols);

        if (bestCoin) {
            logToPanel(`[SIMULATION] Cycle ${cycleId} best coin: ${bestCoin.symbol} change=${bestCoin.change24h.toFixed(2)}%`);
            showTrend(bestCoin.change24h);

            while (hops < config.HOP_LIMIT) {
                profit += bestCoin.change24h * 0.01;
                hops++;
            }
        }

        return profit;

    } catch (err) {
        logToPanel(`[ERROR] Cycle ${cycleId} failed: ${err.message}`);
        return null;
    }
}

window.simulateCycle = simulateCycle;
