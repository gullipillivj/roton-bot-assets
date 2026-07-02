// simulate.js

async function simulateCycle(cycleNumber) {
    let investBalance = window.controls.investBalance;
    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    logToPanel(`[INFO] Cycle ${cycleNumber} started`);

    // initial coin
    let coin = await pickBestCoin();
    logToPanel(`[DEBUG] First coin chosen: ${coin}`);

    let usdtValue = balance;

    // run 4 checks (≈2 minutes)
    for (let i = 1; i <= 4; i++) {
        await new Promise(resolve => setTimeout(resolve, 30000));

        // re‑enquire coins.js every 30s
        const coins = await getRisingCoins();
        logToPanel(`[DEBUG] Coins fetched from Binance: ${coins.join(", ")}`);

        // evaluate current coin
        usdtValue = await evaluateCoin(coin, balance);
        if (!usdtValue || isNaN(usdtValue)) {
            usdtValue = balance;
            logToPanel(`[DEBUG] evaluateCoin invalid, fallback balance ${balance.toFixed(2)} USDT`);
        }

        const diff = usdtValue - balance;
        const profitPercent = (diff / balance) * 100;

        // always log profit update
        logToPanel(`[DEBUG] Coin: ${coin}, Profit update: ${diff >= 0 ? '+' : ''}${diff.toFixed(2)} USDT (${profitPercent.toFixed(2)}%)`);

        // hop if coin is falling
        if (profitPercent < 0) {
            coin = coins[Math.floor(Math.random() * coins.length)];
            logToPanel(`[DEBUG] Hop to new coin: ${coin}`);
        }

        // profit/stop‑loss checks
        if (profitPercent >= window.controls.profitTarget) {
            return stopWithSummary(usdtValue, reserve, cycleNumber);
        }
        if (profitPercent <= -window.controls.stopLoss) {
            return stopWithSummary(usdtValue, reserve, cycleNumber);
        }

        balance = usdtValue;
    }

    // after 4 hops, finish cycle
    return stopWithSummary(usdtValue, reserve, cycleNumber);
}

// run two cycles back‑to‑back (≈4 minutes total)
async function runTwoCycles() {
    const result1 = await simulateCycle(1);
    const result2 = await simulateCycle(2);

    // calculate cumulative profit/loss
    const startBalance = window.controls.startBalance;
    const finalBalance = result2 + (window.controls.investBalance - result2);
    const totalChange = finalBalance - startBalance;
    const percentChange = (totalChange / startBalance) * 100;

    // update balances
    window.controls.startBalance = finalBalance;
    window.controls.investBalance = result2;

    logToPanel(`[INFO] Bot stopped after 2 cycles`);
    logToPanel(`[INFO] Updated Initial Balance: ${window.controls.startBalance.toFixed(2)} USDT`);
    logToPanel(`[INFO] Updated Investment Balance: ${window.controls.investBalance.toFixed(2)} USDT`);
    logToPanel(`[INFO] Total Profit/Loss across 2 cycles: ${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)} USDT (${percentChange.toFixed(2)}%)`);
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
    logToPanel(`[INFO] Profit/Loss: ${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)} USDT (${percentChange.toFixed(2)}%)`);

    return usdtValue;
}
