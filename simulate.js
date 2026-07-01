// simulate.js


async function simulateCycle(userId, cycleId) {
    console.log("function name from", "simulatecycle");
   
    let hops = 0;
    let profit = 0;

    try {
        const lifeCycleLimits = await fetchSymbols();

        while (hops < config.HOP_LIMIT) {
            const prices = await fetchPrices("BTCUSDT"); // example symbol
            
            const strength = getStrength(prices, lifeCycleLimits["BTCUSDT"]);
            
            if (strength.shouldBuy) {
                     profit += strength.expectedGain;
            } else if (strength.shouldHop) {
                    } else {
             }

            hops++;
        }

          return profit;

    } catch (err) {
          return null;
    }
}


window.simulateCycle = simulateCycle;
