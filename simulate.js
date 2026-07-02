// simulate.js

async function simulateCycle(cycleNumber) {
    logToPanel(`Simulating cycle ${cycleNumber}`);

    const investBalance = window.controls.investBalance;
    const profitTarget = window.controls.profitTarget / 100;
    const stopLoss = window.controls.stopLoss / 100;

    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    // First buy
    let currentCoin = await pickBestCoin();
    let usdtValue = await evaluateCoin(currentCoin, balance);
    logToPanel(`Bought ${currentCoin} with ${balance} USDT`);

    // Hop attempts (max 2, check every 30s for 2 mins each)
    for (let hop = 1; hop <= 2; hop++) {
        for (let check = 1; check <= 4; check++) {
            await new Promise(resolve => setTimeout(resolve, 30000)); // 30s delay
            usdtValue = await evaluateCoin(currentCoin, balance);

            if (usdtValue >= investBalance * (1 + profitTarget)) {
                logToPanel(`[INFO] Profit target reached in cycle ${cycleNumber}, exiting.`);
                finalizeTrade(usdtValue, investBalance);
                return;
            }

            if (usdtValue <= investBalance * (1 - stopLoss)) {
                logToPanel(`[WARN] Stop loss triggered in cycle ${cycleNumber}, exiting.`);
                finalizeTrade(usdtValue, investBalance);
                return;
            }

            logToPanel(`[INFO] Check ${check}/4: ${currentCoin} value = ${usdtValue.toFixed(2)} USDT`);
        }

        const newCoin = await pickBestCoin();
        if (newCoin !== currentCoin) {
            logToPanel(`[INFO] Hopping from ${currentCoin} to ${newCoin}`);
            currentCoin = newCoin;
            usdtValue = await evaluateCoin(currentCoin, balance);
        }
    }

    // After hops, finalize trade
    finalizeTrade(usdtValue, investBalance);
}

function finalizeTrade(finalValue, initialInvest) {
    const profitLoss = finalValue - initialInvest;

    // Update balances
    window.controls.startBalance += profitLoss;
    window.controls.investBalance = finalValue;

    if (profitLoss >= 0) {
        logToPanel(`[INFO] Trade ended with profit: +${profitLoss.toFixed(2)} USDT`);
    } else {
        logToPanel(`[WARN] Trade ended with loss: ${profitLoss.toFixed(2)} USDT`);
    }

    logToPanel(`[INFO] Updated balances → Start Balance: ${window.controls.startBalance.toFixed(2)}, Investment Balance: ${window.controls.investBalance.toFixed(2)}`);
}
