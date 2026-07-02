async function simulateCycle(cycleNumber) {
    logToPanel(`Simulating cycle ${cycleNumber}`);

    const investBalance = window.controls.investBalance;
    const profitTarget = window.controls.profitTarget / 100; // convert % to decimal
    const stopLoss = window.controls.stopLoss / 100;

    // Reserve fund (10%)
    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    // Pick best coin based on 24h change
    const bestCoin = await pickBestCoin(); // from coins.js
    logToPanel(`Best coin chosen: ${bestCoin}`);

    // Simulate coin purchase
    const usdtValue = await evaluateCoin(bestCoin, balance);

    // Profit target check
    if (usdtValue >= investBalance * (1 + profitTarget)) {
        logToPanel(`[INFO] Profit target reached in cycle ${cycleNumber}, exiting.`);
        window.controls.isRunning = false;
        return;
    }

    // Stop loss check
    if (usdtValue <= investBalance * (1 - stopLoss)) {
        logToPanel(`[WARN] Stop loss triggered in cycle ${cycleNumber}, exiting.`);
        window.controls.isRunning = false;
        return;
    }

    logToPanel(`[INFO] Cycle ${cycleNumber} complete. Current value: ${usdtValue.toFixed(2)} USDT`);
}
