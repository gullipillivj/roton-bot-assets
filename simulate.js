// simulate.js
const { debugLog, debugError } = require('./debug');
const { getStrength } = require('./getStrength');
const { fetchPrices } = require('./fetchPrices');
const { fetchSymbols } = require('./fetchSymbols');
const { config } = require('./config');

async function simulateCycle(userId, cycleId) {
    console.log("function name from", "simulatecycle");
    debugLog("simulate", `Starting cycle ${cycleId} for user ${userId}`);

    let hops = 0;
    let profit = 0;

    try {
        const lifeCycleLimits = await fetchSymbols();

        while (hops < config.HOP_LIMIT) {
            const prices = await fetchPrices("BTCUSDT"); // example symbol
            debugLog("simulate", `Hop ${hops + 1} | Prices fetched`, prices);

            const strength = getStrength(prices, lifeCycleLimits["BTCUSDT"]);
            debugLog("simulate", `Hop ${hops + 1} | Strength calculated`, strength);

            if (strength.shouldBuy) {
                debugLog("simulate", `Hop ${hops + 1}: BUY triggered`, { change24h: prices.change24h });
                profit += strength.expectedGain;
            } else if (strength.shouldHop) {
                debugLog("simulate", `Hop ${hops + 1}: HOP triggered`, { change24h: prices.change24h });
            } else {
                debugLog("simulate", `Hop ${hops + 1}: HOLD decision`, { change24h: prices.change24h });
            }

            hops++;
        }

        debugLog("simulate", `Cycle ${cycleId} ended | Total Profit: ${profit}%`);
        return profit;

    } catch (err) {
        debugError("simulate", err);
        return null;
    }
}

module.exports = { simulateCycle };
window.simulateCycle = simulateCycle;
