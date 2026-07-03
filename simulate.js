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

    // ✅ Allow up to 3 hops per cycle
    const feeRate = 0.0001; // 0.01%
    const totalFeeFactor = 1 - feeRate;

    for (let hop = 1; hop <= 3; hop++) {
        balance = (coinUnits * currentPrice) * totalFeeFactor;

        startBox = parseFloat(document.getElementById("startBalance").value);
        investBox = parseFloat(document.getElementById("investBalance").value);
        document.getElementById("startBalance").value = (startBox * totalFeeFactor).toFixed(2);
        document.getElementById("investBalance").value = (investBox * totalFeeFactor).toFixed(2);

        const newIndex = (randIndex + hop) % allCoins.length;
        coin = allCoins[newIndex];
        entryPrice = await evaluateCoin(coin, 1);
        coinUnits = balance / entryPrice;
        logWithTime(`[Latest] Hop ${hop}: into ${coin}, Units=${coinUnits.toFixed(4)}, Entry=${entryPrice.toFixed(4)} USDT after 0.01% fee`);

        // Hold new coin for 30s
        await sleep(30000);

        // Check new coin price
        currentPrice = await evaluateCoin(coin, 1);
        profit = (currentPrice - entryPrice) * coinUnits;

        startBox = parseFloat(document.getElementById("startBalance").value);
        investBox = parseFloat(document.getElementById("investBalance").value);
        document.getElementById("startBalance").value = (startBox + profit).toFixed(2);
        document.getElementById("investBalance").value = (investBox + profit).toFixed(2);

        logWithTime(`Cycle ${cycleNum}: Result after hop ${hop} — ${profit >= 0 ? "Profit" : "Loss"} (${profit.toFixed(2)} USDT)`);
    }

    // ✅ Chart update at the end of cycle
    balanceHistory.push(parseFloat(document.getElementById("investBalance").value));
    updateChart();

    logWithTime(`[Latest] simulateCycle(${cycleNum}) complete`);
}
