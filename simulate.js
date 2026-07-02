// simulate.js

async function simulateCycle(cycleNumber) {
    let investBalance = window.controls.investBalance;
    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    // pick first coin from coins.js
    let coin = await pickBestCoin();

    logToPanel(`[INFO] Cycle ${cycleNumber} started`);
    logToPanel(`[DEBUG] First coin chosen: ${coin}`);

    let usdtValue = balance;
    let cycleStart = Date.now();

    while (true) {
        let lastValue = balance;

        // 4 checks = 2 minutes total
        for (let i = 1; i <= 4; i++) {
            await new Promise(resolve => setTimeout(resolve, 30000));

            usdtValue = await evaluateCoin(coin, balance);

            // fallback if evaluateCoin fails
            if (!usdtValue || isNaN(usdtValue)) {
                usdtValue = balance;
                logToPanel(`[DEBUG] evaluateCoin returned invalid, using balance ${balance.toFixed(2)} USDT`);
            }

            const diff = usdtValue - balance;
            const profitPercent = (diff / balance) * 100;

            // always show coin + profit every 30s
            logToPanel(`[DEBUG] Coin: ${coin}, Profit update: ${diff >= 0 ? '+' : ''}${diff.toFixed(2)} USDT (${profitPercent.toFixed(2)}%)`);

            // hop to new coin if not rising (hidden logic, but log for debug)
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

        // stop after 4 minutes max
        if (Date.now() - cycleStart >= 240000) {
            stopWithSummary(usdtValue, reserve, cycleNumber);
            return;
        }

        balance = usdtValue;
        window.controls.investBalance = usdtValue + reserve;
        document.getElementById("investBalance").value = window.controls.investBalance.toFixed(2);
    }
}

function stopWithSummary(usdtValue, reserve, cycleNumber) {
    window.controls.investBalance = usdtValue + reserve;

    const startBalance = window.controls.startBalance;
    const investBalance = window.controls.investBalance;

    const totalWallet = startBalance + (usdtValue - (investBalance - reserve));
    const totalChange = totalWallet - startBalance;
    const percentChange = (totalChange / startBalance) * 100;

    logToPanel(`[INFO] Cycle ${cycleNumber} complete`);
    logToPanel(`[INFO] Net Wallet: ${totalWallet.toFixed(2)} USDT`);
    logToPanel(`[INFO] Profit/Loss: ${totalChange.toFixed(2)} USDT (${percentChange.toFixed(2)}%)`);

    window.stopBot();
}
