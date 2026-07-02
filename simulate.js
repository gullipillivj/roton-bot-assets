// simulate.js

async function simulateCycle(cycleNumber) {
    let investBalance = window.controls.investBalance;
    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    let coin = await pickBestCoin();

    logToPanel(`[INFO] Cycle ${cycleNumber} started`);

    // show coin name only if it's reputed
    if (reputedCoins.includes(coin)) {
        logToPanel(`[INFO] Bought ${coin} with ${balance.toFixed(2)} USDT`);
    } else {
        logToPanel(`[INFO] Investment placed with ${balance.toFixed(2)} USDT`);
    }

    let usdtValue = balance;
    let cycleStart = Date.now();

    while (true) {
        let lastValue = balance;

        // 4 checks = 2 minutes total
        for (let i = 1; i <= 4; i++) {
            await new Promise(resolve => setTimeout(resolve, 30000));
            usdtValue = await evaluateCoin(coin, balance);

            const diff = usdtValue - balance;
            const profitPercent = (diff / balance) * 100;

            // keep user engaged with profit updates
            logToPanel(`[INFO] Profit update: ${diff >= 0 ? '+' : ''}${diff.toFixed(2)} USDT (${profitPercent.toFixed(2)}%)`);

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
