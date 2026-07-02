// simulate.js

async function simulateCycle(cycleNumber) {
    let investBalance = window.controls.investBalance;
    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    let coin = await pickBestCoin();

    logToPanel(`[INFO] Cycle ${cycleNumber} started`);
    logToPanel(`[DEBUG] First coin chosen: ${coin}`);

    let usdtValue = balance;
    let cycleStart = Date.now();

    while (true) {
        let lastValue = balance;

        for (let i = 1; i <= 4; i++) {
            await new Promise(resolve => setTimeout(resolve, 30000));

            usdtValue = await evaluateCoin(coin, balance);
            if (!usdtValue || isNaN(usdtValue)) usdtValue = balance;

            const diff = usdtValue - balance;
            const profitPercent = (diff / balance) * 100;

            // DEBUG: show coin name + profit
            logToPanel(`[DEBUG] Coin: ${coin}, Profit update: ${diff >= 0 ? '+' : ''}${diff.toFixed(2)} USDT (${profitPercent.toFixed(2)}%)`);

            if (profitPercent <= 0 && i === 4) {
                coin = await pickBestCoin();
                logToPanel(`[DEBUG] Hop to new coin: ${coin}`);
            }

            if (profitPercent >= window.controls.profitTarget) {
                stopWithSummary(usdtValue, reserve, cycleNumber);
                return;
            }
            if (profitPercent <= -window.controls.stopLoss) {
                stopWithSummary(usdtValue, reserve, cycleNumber);
                return;
            }

            if (usdtValue > lastValue) balance = usdtValue;
            lastValue = usdtValue;
        }

        if (Date.now() - cycleStart >= 240000) {
            stopWithSummary(usdtValue, reserve, cycleNumber);
            return;
        }

        balance = usdtValue;
        window.controls.investBalance = usdtValue + reserve;
        document.getElementById("investBalance").value = window.controls.investBalance.toFixed(2);
    }
}
