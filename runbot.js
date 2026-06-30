const { debugLog, debugError } = require('./debug');
const { tradeCycle } = require('./trading');   // new trading logic
const { sleep } = require('./simulate');       // helper delay

async function runBot(userId) {
    debugLog("runbot", `Bot started for user ${userId}`);

    try {
        const balance = { entryPrice: null, totalProfit: 0 };

        // Example: run 10 trading cycles
        for (let i = 0; i < 10; i++) {
            debugLog("runbot", `Cycle ${i + 1} started`);

            const profit = await tradeCycle(
                userId,
                balance,
                config.profitTarget,
                config.stopLoss
            );

            balance.totalProfit += profit;
            debugLog("runbot", `Cycle ${i + 1} finished | Profit: ${profit.toFixed(2)}%`);

            // Check exit conditions
            if (balance.totalProfit >= config.profitTarget) {
                debugLog("runbot", "Target profit achieved, exiting bot");
                break;
            }
            if (balance.totalProfit <= -config.stopLoss) {
                debugLog("runbot", "Stop loss triggered, exiting bot");
                break;
            }

            await sleep(2000); // wait 2s before next cycle
        }

        debugLog("runbot", `Bot run completed | Total Profit: ${balance.totalProfit.toFixed(2)}%`);

    } catch (err) {
        debugError("runbot", err);
    }
}

module.exports = { runBot };
