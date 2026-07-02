// simulate.js

async function simulateCycle(cycleNumber) {
    const investBalance = window.controls.investBalance;
    const reserve = investBalance * 0.1;
    const balance = investBalance - reserve;

    const coin = await pickBestCoin();

    // BUY step
    logToPanel(`[CYCLE ${cycleNumber}] Bought ${coin} with ${balance.toFixed(2)} USDT`);

    // HOPING step: 2 minutes total, check every 30 seconds
    const holdTime = 120000; // 2 minutes
    const interval = 30000;  // 30 seconds
    const checks = holdTime / interval;

    let usdtValue = balance;
    for (let i = 1; i <= checks; i++) {
        await new Promise(resolve => setTimeout(resolve, interval));
        usdtValue = await evaluateCoin(coin, balance);

        logToPanel(`[CYCLE ${cycleNumber}] Hoping check ${i}: ${coin} value = ${usdtValue.toFixed(2)} USDT`);

        // check profit target / stop loss
        if (usdtValue >= window.controls.profitTarget || usdtValue <= window.controls.stopLoss) {
            logToPanel(`[CYCLE ${cycleNumber}] Target/Stop triggered, exiting early`);
            break;
        }
    }

    logToPanel(`[CYCLE ${cycleNumber}] Final value after hoping: ${usdtValue.toFixed(2)} USDT`);

    window.controls.investBalance = usdtValue + reserve;
}
