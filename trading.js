// trading.js — consolidated trading loop with debug logs
// Debug mode enabled

const { pickBestCoin, showTrend } = require('./coins');
const { simulateCycle } = require('./simulate');
const { logMessage } = require('./debug');

async function tradingLoop(runNumber) {
    logMessage("[DEBUG] tradingLoop entered, Run=" + runNumber);

    const symbols = ["BTCUSDT","ETHUSDT","BNBUSDT","ADAUSDT","LINKUSDT"];
    let cycleCount = 0;

    while (running && cycleCount < 2) { // 2 cycles
        let hops = 0;
        logMessage("[DEBUG] Starting cycle " + (cycleCount + 1));

        while (running && hops < 3) { // 2–3 hops per cycle
            try {
                logMessage("[DEBUG] No position, picking best coin...");
                const bestCoin = await pickBestCoin(symbols);

                if (!bestCoin) {
                    logMessage("[DEBUG] No coin selected, retrying...");
                    break;
                }

                // Lifecycle % check: first buy when coin is nearing upward movement
                showTrend(bestCoin.change24h);
                logMessage("[DEBUG] Best coin chosen: " + bestCoin.symbol +
                           " | Change24h=" + bestCoin.change24h.toFixed(2));

                const qty = investment / bestCoin.price;
                position = { symbol: bestCoin.symbol, price: bestCoin.price, qty: qty };
                holdStart = Date.now();

                logMessage("[DEBUG] Bought " + bestCoin.symbol + " at " + bestCoin.price +
                           " | Qty: " + qty.toFixed(6));
                updateCurrentValue(bestCoin.price, position);

                // Run hop simulation for this coin
                const profitResult = await simulateCycle("user", runNumber);
                profit += profitResult || 0;
                balance += profitResult || 0;

                logMessage("[DEBUG] Profit updated: " + profit.toFixed(2) +
                           " | Balance=" + balance.toFixed(2));

                hops++;
                hopCount++;
                logMessage("[DEBUG] Hop count=" + hopCount);

                // Stop conditions
                if (fees >= profit) {
                    logMessage("[DEBUG] Fees exceeded profit. Stopping bot.");
                    stopBot(runNumber);
                    return;
                }
                if (Date.now() - startTime >= 2700000) {
                    logMessage("[DEBUG] Max runtime reached. Stopping bot.");
                    stopBot(runNumber);
                    return;
                }

            } catch (err) {
                logMessage("[DEBUG] Error in tradingLoop: " + err);
            }

            // Wait 15 seconds before next hop
            await new Promise(r => setTimeout(r, 15000));
            logMessage("[DEBUG] Hop iteration complete, Run=" + runNumber);
        }

        cycleCount++;
        logMessage("[DEBUG] Cycle " + cycleCount + " completed");
    }

    logMessage("[DEBUG] Bot exiting after " + cycleCount + " cycles");
    stopBot(runNumber);
}

module.exports = { tradingLoop };
window.tradingLoop = tradingLoop;

