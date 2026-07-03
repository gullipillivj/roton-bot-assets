async function simulateCycle(cycleNum) {
    try {
        logWithTime(`[Latest] simulateCycle(${cycleNum}) started`);

        let investBalance = window.controls.investBalance;
        const reserve = investBalance * 0.1;
        let balance = investBalance - reserve;

        const allCoins = await getDynamicCoins();
        if (!allCoins || allCoins.length === 0) {
            logWithTime(`[ERROR] No coins fetched from Binance`);
            return;
        }

        const randIndex = Math.floor(seededRandom(cycleNum) * allCoins.length);
        let coin = allCoins[randIndex];

        let entryPrice = await evaluateCoin(coin, 1);
        if (!entryPrice || entryPrice <= 0) {
            logWithTime(`[ERROR] Entry price fetch failed for ${coin}`);
            return;
        }

        let coinUnits = balance / entryPrice;
        logWithTime(`Cycle ${cycleNum}: Bought ${coin}, ${coinUnits.toFixed(4)} units at ${entryPrice.toFixed(4)} USDT`);

        await sleep(30000);

        let currentPrice = await evaluateCoin(coin, 1);
        let profit = (currentPrice - entryPrice) * coinUnits;

        let startBox = parseFloat(document.getElementById("startBalance").value);
        let investBox = parseFloat(document.getElementById("investBalance").value);
        document.getElementById("startBalance").value = (startBox + profit).toFixed(2);
        document.getElementById("investBalance").value = (investBox + profit).toFixed(2);

        logWithTime(`Cycle ${cycleNum}: Result after 30s — ${profit >= 0 ? "Profit" : "Loss"} (${profit.toFixed(2)} USDT)`);

        const feeRate = 0.0001; // 0.01%
        const totalFeeFactor = 1 - feeRate;

        for (let hop = 1; hop <= 3; hop++) {
            balance = (coinUnits * currentPrice) * totalFeeFactor;
            if (!balance || balance <= 0) {
                logWithTime(`[WARN] Balance invalid after hop ${hop}, stopping swaps`);
                break;
            }

            startBox = parseFloat(document.getElementById("startBalance").value);
            investBox = parseFloat(document.getElementById("investBalance").value);
            document.getElementById("startBalance").value = (startBox * totalFeeFactor).toFixed(2);
            document.getElementById("investBalance").value = (investBox * totalFeeFactor).toFixed(2);

            const newIndex = (randIndex + hop) % allCoins.length;
            coin = allCoins[newIndex];
            entryPrice = await evaluateCoin(coin, 1);
            if (!entryPrice || entryPrice <= 0) {
                logWithTime(`[ERROR] Entry price fetch failed for ${coin}`);
                break;
            }

            coinUnits = balance / entryPrice;
            logWithTime(`[Latest] Hop ${hop}: into ${coin}, Units=${coinUnits.toFixed(4)}, Entry=${entryPrice.toFixed(4)} USDT after 0.01% fee`);

            await sleep(30000);

            currentPrice = await evaluateCoin(coin, 1);
            profit = (currentPrice - entryPrice) * coinUnits;

            startBox = parseFloat(document.getElementById("startBalance").value);
            investBox = parseFloat(document.getElementById("investBalance").value);
            document.getElementById("startBalance").value = (startBox + profit).toFixed(2);
            document.getElementById("investBalance").value = (investBox + profit).toFixed(2);

            logWithTime(`Cycle ${cycleNum}: Result after hop ${hop} — ${profit >= 0 ? "Profit" : "Loss"} (${profit.toFixed(2)} USDT)`);
        }

        logWithTime(`[Latest] simulateCycle(${cycleNum}) complete`);
    } catch (err) {
        logWithTime(`[ERROR] simulateCycle(${cycleNum}) crashed: ${err}`);
    }
}
