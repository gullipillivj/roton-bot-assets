async function simulateCycle(userId, cycleId) {
    console.log("function name from", "simulateCycle");

    let hops = 0;
    let profit = 0;

    try {
        // Example: pick best coin from a list
        const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];
        const bestCoin = await pickBestCoin(symbols);

        if (bestCoin) {
            console.log(`[SIMULATION] Cycle ${cycleId} best coin:`, bestCoin.symbol, "change:", bestCoin.change24h.toFixed(2), "%");
            logToPanel(`[SIMULATION] Cycle ${cycleId} best coin: ${bestCoin.symbol} change=${bestCoin.change24h.toFixed(2)}%`);

            // Show trend in UI
            showTrend(bestCoin.change24h);

            // Run hops loop using best coin
            while (hops < config.HOP_LIMIT) {
                // Example: pretend profit is proportional to change
                profit += bestCoin.change24h * 0.01; // scale down for demo
                hops++;
            }
        }

        return profit;

    } catch (err) {
        console.error("[SIMULATION] Error in cycle", cycleId, err);
        logToPanel(`[ERROR] Cycle ${cycleId} failed: ${err.message}`);
        return null;
    }
}

window.simulateCycle = simulateCycle;
