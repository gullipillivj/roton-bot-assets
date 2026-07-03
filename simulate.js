async function simulateCycle(cycleNum) {
    logWithTime(`[Latest] simulateCycle(${cycleNum}) started`);

    let investBalance = window.controls.investBalance;
    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    // 🔁 Get dynamic coin pool
    const allCoins = await getDynamicCoins();
    const randIndex = Math.floor(seededRandom(cycleNum) * allCoins.length);
    let coin = allCoins[randIndex];

    // Phase 1: Buy coin
    let entryPrice = await evaluateCoin(coin, 1);
    let coinUnits = balance / entryPrice;
    logWithTime(`Cycle ${cycleNum}: Bought ${coin}, ${coinUnits.toFixed(4)} units at ${entryPrice.toFixed(4)} USDT`);

    // Hold for 30s
    await sleep(30000);

    // Phase 2: Check price after 30s
    let currentPrice = await evaluateCoin(coin, 1);
    let profit = (currentPrice - entryPrice) * coinUnits;

    let startBox = parseFloat(document.getElementById("startBalance").value);
    let investBox = parseFloat(document.getElementById("investBalance").value);
    document.getElementById("startBalance").value = (startBox + profit).toFixed(2);
    document.getElementById("investBalance").value = (investBox + profit).toFixed(2);

    logWithTime(`Cycle ${cycleNum}: Result after 30s — ${profit >= 0 ? "Profit" : "Loss"} (${profit.toFixed(2)} USDT)`);

    // ✅ Phase 3: Limit swaps to max 3, apply 0.01% fee
    const feeRate = 0.0001; // 0.01%
    if (cycleNum <= 3) {
        const totalFeeFactor = 1 - feeRate;
        balance = (coinUnits * currentPrice) * totalFeeFactor;

        startBox = parseFloat(document.getElementById("startBalance").value);
        investBox = parseFloat(document.getElementById("investBalance").value);
        document.getElementById("startBalance").value = (startBox * totalFeeFactor).toFixed(2);
        document.getElementById("investBalance").value = (investBox * totalFeeFactor).toFixed(2);

        const newIndex = (randIndex + 1) % allCoins.length;
        coin = allCoins[newIndex];
        entryPrice = await evaluateCoin(coin, 1);
        coinUnits = balance / entryPrice;
        logWithTime(`[Latest] Swapped into ${coin}, Units=${coinUnits.toFixed(4)}, Entry=${entryPrice.toFixed(4)} USDT after 0.01% fee`);

        // Hold new coin for 30s
        await sleep(30000);

        // Phase 4: Check new coin price
        currentPrice = await evaluateCoin(coin, 1);
        profit = (currentPrice - entryPrice) * coinUnits;

        startBox = parseFloat(document.getElementById("startBalance").value);
        investBox = parseFloat(document.getElementById("investBalance").value);
        document.getElementById("startBalance").value = (startBox + profit).toFixed(2);
        document.getElementById("investBalance").value = (investBox + profit).toFixed(2);

        logWithTime(`Cycle ${cycleNum}: Result after swap 30s — ${profit >= 0 ? "Profit" : "Loss"} (${profit.toFixed(2)} USDT)`);
    }

    // ✅ Update chart at the end of cycle
    balanceHistory.push(parseFloat(document.getElementById("investBalance").value));
    updateChart();

    logWithTime(`[Latest] simulateCycle(${cycleNum}) complete`);
}
