// simulate.js

async function simulateCycle(cycleNumber) {
    let investBalance = window.controls.investBalance;
    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    let coin = await pickBestCoin();
    logToPanel(`[CYCLE ${cycleNumber}] Bought ${coin} with ${balance.toFixed(2)} USDT`);

    let usdtValue = balance;
    let continueCycle = true;
    let cycleStart = Date.now();

    while (continueCycle) {
        const holdTime = 120000; // 2 minutes
        const interval = 30000;  // 30 seconds
        const checks = holdTime / interval;

        let lastValue = balance;
        let rising = false;

        for (let i = 1; i <= checks; i++) {
            await new Promise(resolve => setTimeout(resolve, interval));
            usdtValue = await evaluateCoin(coin, balance);

            logToPanel(`[CYCLE ${cycleNumber}] Hoping check ${i}: ${coin} value = ${usdtValue.toFixed(2)} USDT`);

            // live update textbox
            document.getElementById("investBalance").value = usdtValue.toFixed(2);

            const profitPercent = ((usdtValue - balance) / balance) * 100;

            if (profitPercent >= window.controls.profitTarget) {
                logToPanel(`[CYCLE ${cycleNumber}] Profit target reached (${profitPercent.toFixed(2)}%)`);
                stopWithSummary(usdtValue, reserve);
                return;
            }

            if (profitPercent <= -window.controls.stopLoss) {
                logToPanel(`[CYCLE ${cycleNumber}] Stop loss triggered (${profitPercent.toFixed(2)}%)`);
                stopWithSummary(usdtValue, reserve);
                return;
            }

            if (usdtValue > lastValue) {
                rising = true;
            }
            lastValue = usdtValue;
        }

        if (Date.now() - cycleStart >= 240000) {
            logToPanel(`[CYCLE ${cycleNumber}] Max cycle time reached (4 mins)`);
            stopWithSummary(usdtValue, reserve);
            return;
        }

        if (rising) {
            logToPanel(`[CYCLE ${cycleNumber}] Coin ${coin} is rising, continue holding`);
            balance = usdtValue;
        } else {
            logToPanel(`[CYCLE ${cycleNumber}] Coin ${coin} not rising, switching to new coin`);
            coin = await pickBestCoin();
            balance = usdtValue;
            logToPanel(`[CYCLE ${cycleNumber}] Switched to ${coin} with ${balance.toFixed(2)} USDT`);
        }

        window.controls.investBalance = usdtValue + reserve;
        document.getElementById("investBalance").value = window.controls.investBalance.toFixed(2);
    }
}

// helper to stop and show summary
function stopWithSummary(usdtValue, reserve) {
    window.controls.investBalance = usdtValue + reserve;

    const startBalance = window.controls.startBalance;
    const investBalance = window.controls.investBalance;
    const totalChange = investBalance - startBalance;
    const percentChange = (totalChange / startBalance) * 100;

    // update textboxes
    document.getElementById("startBalance").value = startBalance.toFixed(2);
    document.getElementById("investBalance").value = investBalance.toFixed(2);

    // log summary
    logToPanel("Bot run complete");
    logToPanel("Final Start Balance: " + startBalance.toFixed(2) + " USDT");
    logToPanel("Final Investment Balance: " + investBalance.toFixed(2) + " USDT");
    logToPanel("Net Change: " + totalChange.toFixed(2) + " USDT (" + percentChange.toFixed(2) + "%)");

    // stop bot
    window.stopBot();
}
