// simulate.js

async function simulateCycle(cycleNumber) {
    let investBalance = window.controls.investBalance;
    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    let coin = await pickBestCoin();
    logToPanel(`[CYCLE ${cycleNumber}] Bought ${coin} with ${balance.toFixed(2)} USDT`);

    let usdtValue = balance;
    let continueCycle = true;

    while (continueCycle) {
        // 2 minutes total, check every 30 seconds
        const holdTime = 120000;
        const interval = 30000;
        const checks = holdTime / interval;

        let rising = false;

        for (let i = 1; i <= checks; i++) {
            await new Promise(resolve => setTimeout(resolve, interval));
            usdtValue = await evaluateCoin(coin, balance);

            logToPanel(`[CYCLE ${cycleNumber}] Hoping check ${i}: ${coin} value = ${usdtValue.toFixed(2)} USDT`);

            const profitPercent = ((usdtValue - balance) / balance) * 100;

            // stop if profit target reached
            if (profitPercent >= window.controls.profitTarget) {
                logToPanel(`[CYCLE ${cycleNumber}] Profit target reached (${profitPercent.toFixed(2)}%), stopping bot`);
                window.controls.investBalance = usdtValue + reserve;
                window.stopBot();
                return;
            }

            // stop if stop loss triggered
            if (profitPercent <= -window.controls.stopLoss) {
                logToPanel(`[CYCLE ${cycleNumber}] Stop loss triggered (${profitPercent.toFixed(2)}%), exiting coin`);
                continueCycle = false;
                break;
            }

            // mark rising if value increased vs last check
            if (usdtValue > balance) {
                rising = true;
            }
        }

        if (rising) {
            logToPanel(`[CYCLE ${cycleNumber}] Coin ${coin} is still rising, continue holding`);
            balance = usdtValue; // update balance baseline
        } else {
            logToPanel(`[CYCLE ${cycleNumber}] Coin ${coin} not rising, switching to new coin`);
            coin = await pickBestCoin();
            balance = usdtValue; // carry forward current value
            logToPanel(`[CYCLE ${cycleNumber}] Switched to ${coin} with ${balance.toFixed(2)} USDT`);
        }

        // update investBalance each loop
        window.controls.investBalance = usdtValue + reserve;
    }
}
