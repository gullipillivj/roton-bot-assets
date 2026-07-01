// getStrength.js
function getStrength(prices, lifeCycleLimits) {
    try {
        const { lastPrice, change24h } = prices;
        const { maxUp, maxDown } = lifeCycleLimits;

        
        let shouldBuy = false;
        let shouldHop = false;
        let expectedGain = 0;

        // Entry condition: near 0% and trending upward
        if (Math.abs(change24h) < 0.5 && change24h > 0) {
            shouldBuy = true;
            expectedGain = 2; // placeholder target
               }

        // Hop condition: coin near life cycle upper limit
        if (change24h >= maxUp - 1) {
            shouldHop = true;
             }

        // Exit condition: coin near life cycle lower limit
        if (change24h <= maxDown + 1) {
         }

        return { shouldBuy, shouldHop, expectedGain };

    } catch (err) {
         return { shouldBuy: false, shouldHop: false, expectedGain: 0 };
    }
}

window.getStrength = getStrength;
