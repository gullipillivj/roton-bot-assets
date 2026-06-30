// getStrength.js
const { debugLog, debugError } = require('./debug');

function getStrength(prices, lifeCycleLimits) {
    try {
        const { lastPrice, change24h } = prices;
        const { maxUp, maxDown } = lifeCycleLimits;

        debugLog("getStrength", "Inputs received", { lastPrice, change24h, maxUp, maxDown });

        let shouldBuy = false;
        let shouldHop = false;
        let expectedGain = 0;

        // Entry condition: near 0% and trending upward
        if (Math.abs(change24h) < 0.5 && change24h > 0) {
            shouldBuy = true;
            expectedGain = 2; // placeholder target
            debugLog("getStrength", "BUY condition met", { change24h });
        }

        // Hop condition: coin near life cycle upper limit
        if (change24h >= maxUp - 1) {
            shouldHop = true;
            debugLog("getStrength", "HOP condition met", { change24h, maxUp });
        }

        // Exit condition: coin near life cycle lower limit
        if (change24h <= maxDown + 1) {
            debugLog("getStrength", "EXIT condition met", { change24h, maxDown });
        }

        return { shouldBuy, shouldHop, expectedGain };

    } catch (err) {
        debugError("getStrength", err);
        return { shouldBuy: false, shouldHop: false, expectedGain: 0 };
    }
}

window.getStrength = getStrength;
