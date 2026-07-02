// simulate.js

async function simulateCycle(cycleNumber) {
    let investBalance = window.controls.investBalance;
    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    let coin = await pickBestCoin();
    logToPanel(`[CYCLE ${cycleNumber}] Bought ${coin} with ${balance.toFixed(2)} USDT`);

    let usdtValue = balance;
    let cycleStart = Date.now();

    while (true) {
        let rising = false;
        let lastValue = balance;

        // 2 minutes total, check every 30 seconds
        for (let i = 1; i <= 4; i++) {
            await new Promise(resolve => setTimeout(resolve, 30000));
            usdtValue = await evaluateCoin(coin, balance);

            const diff = usdtValue - balance;
            const profitPercent = (diff / balance) * 100;

            logToPanel(`[CYCLE ${cycleNumber}] Check ${i}: ${coin} value = ${usdtValue.toFixed(2)} USDT | Profit ${diff >= 0 ? '+' : ''}${diff.toFixed(2)} USDT (${profitPercent.toFixed(2)}%)`);

            document.getElementById("investBalance").value = usdtValue.toFixed(2);

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

            if (usdtValue > lastValue) rising = true;
            lastValue = usdtValue;
        }

        // hard stop after 4 mins
        if (Date.now() - cycleStart >= 240000) {
            logToPanel(`[CYCLE ${cycleNumber}] Max cycle time reached (4 mins)`);
            stopWithSummary(usdtValue, reserve);
            return;
        }

        // hop logic
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

function stopWithSummary(usdtValue, reserve) {
    window.controls.investBalance = usdtValue + reserve;

    const startBalance = window.controls.startBalance;
    const investBalance = window.controls.investBalance;

    const totalWallet = startBalance + (usdtValue - (investBalance - reserve));
    const totalChange = totalWallet - startBalance;
    const percentChange = (totalChange / startBalance) * 100;

    document.getElementById("startBalance").value = totalWallet.toFixed(2);
    document.getElementById("investBalance").value = investBalance.toFixed(2);

    logToPanel("Bot stopped");
    logToPanel("Final Start Balance: " + totalWallet.toFixed(2) + " USDT");
    logToPanel("Final Investment Balance: " + investBalance.toFixed(2) + " USDT");
    logToPanel("Net Change: " + totalChange.toFixed(2) + " USDT (" + percentChange.toFixed(2) + "%)");

    window.stopBot();
}
