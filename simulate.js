// simulate.js

function logWithTime(message) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });
    logToPanel(`[INFO] ${timeStr} — ${message}`);
}

async function simulateCycle(cycleNumber) {
    let investBalance = window.controls.investBalance;
    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    logWithTime(`Cycle ${cycleNumber} started`);

    // pick one coin from coins.js
    let coin = await pickBestCoin();
    logWithTime(`Bought ${coin} with ${balance.toFixed(2)} USDT`);

    let usdtValue = balance;

    // run 4 checks (≈2 minutes)
    for (let i = 1; i <= 4; i++) {
        await new Promise(resolve => setTimeout(resolve, 30000));

        // re‑enquire coins.js every 30s
        const coins = await getRisingCoins();

        // evaluate current coin
        usdtValue = await evaluateCoin(coin, balance);
        if (!usdtValue || isNaN(usdtValue)) {
            usdtValue = balance;
        }

        const diff = usdtValue - balance;
        const profitPercent = (diff / balance) * 100;

        // always show coin, price, profit/loss, %
        logWithTime(`Coin: ${coin}, Current Value: ${usdtValue.toFixed(2)} USDT, Change: ${diff >= 0 ? '+' : ''}${diff.toFixed(2)} USDT (${profitPercent.toFixed(2)}%)`);

        // hop if coin is falling, else show "not changed"
        if (profitPercent < 0) {
            coin = coins[Math.floor(Math.random() * coins.length)];
            logWithTime(`Switched to new coin: ${coin}`);
        } else {
            logWithTime(`Coin not changed`);
        }

        // profit/stop‑loss checks
        if (profitPercent >= window.controls.profitTarget || profitPercent <= -window.controls.stopLoss) {
            break;
        }

        balance = usdtValue;
    }

    // finish cycle summary
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

    logWithTime(`Bot stopped after 2 cycles`);
    logWithTime(`Updated Initial Balance: ${window.controls.startBalance.toFixed(2)} USDT`);
    logWithTime(`Updated Investment Balance: ${window.controls.investBalance.toFixed(2)} USDT`);
    logWithTime(`Total Profit/Loss across 2 cycles: ${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)} USDT (${percentChange.toFixed(2)}%)`);
}

function stopWithSummary(usdtValue, reserve, cycleNumber) {
    window.controls.investBalance = usdtValue + reserve;

    const startBalance = window.controls.startBalance;
    const investBalance = window.controls.investBalance;

    const totalWallet = startBalance + (usdtValue - (investBalance - reserve));
    const totalChange = totalWallet - startBalance;
    const percentChange = (totalChange / startBalance) * 100;

    logWithTime(`Cycle ${cycleNumber} complete`);
    logWithTime(`Net Wallet: ${totalWallet.toFixed(2)} USDT`);
    logWithTime(`Profit/Loss: ${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)} USDT (${percentChange.toFixed(2)}%)`);

    return usdtValue;
}
