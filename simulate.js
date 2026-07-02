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

    let lastValue = balance;

    // run 4 checks (≈2 minutes)
    for (let i = 1; i <= 4; i++) {
        await new Promise(resolve => setTimeout(resolve, 30000));

        // re‑enquire coins.js every 30s (list of rising coins)
        const risingCoins = await getRisingCoins();

        // get 24h % change for current coin
        const held24hChange = await get24hChange(coin); // must call Binance API

        // evaluate current coin
        let currentValue = await evaluateCoin(coin, lastValue);
        if (!currentValue || isNaN(currentValue)) {
            currentValue = lastValue;
        }

        const diff = currentValue - lastValue;
        const profitPercent = (diff / lastValue) * 100;

        // log coin status
        logWithTime(`Coin: ${coin}, Current Value: ${currentValue.toFixed(2)} USDT, Change: ${diff >= 0 ? '+' : ''}${diff.toFixed(2)} USDT (${profitPercent.toFixed(2)}%), 24h %: ${held24hChange.toFixed(2)}%`);

        // decision: keep or hop
        if (held24hChange < 0) {
            // coin is falling → hop to one of the rising coins
            coin = risingCoins[Math.floor(Math.random() * risingCoins.length)];
            logWithTime(`Switched to new rising coin: ${coin}`);
        } else {
            logWithTime(`Coin not changed`);
        }

        lastValue = currentValue;
    }

    return stopWithSummary(lastValue, reserve, cycleNumber, coin);
}

async function runTwoCycles() {
    const result1 = await simulateCycle(1);
    const result2 = await simulateCycle(2);

    const startBalance = window.controls.startBalance;
    const finalBalance = result2 + (window.controls.investBalance - result2);
    const totalChange = finalBalance - startBalance;
    const percentChange = (totalChange / startBalance) * 100;

    window.controls.startBalance = finalBalance;
    window.controls.investBalance = result2;

    logWithTime(`Bot stopped after 2 cycles`);
    logWithTime(`Updated Initial Balance: ${window.controls.startBalance.toFixed(2)} USDT`);
    logWithTime(`Updated Investment Balance: ${window.controls.investBalance.toFixed(2)} USDT`);
    logWithTime(`Total Profit/Loss across 2 cycles: ${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)} USDT (${percentChange.toFixed(2)}%)`);
}

function stopWithSummary(usdtValue, reserve, cycleNumber, finalCoin) {
    window.controls.investBalance = usdtValue + reserve;

    const startBalance = window.controls.startBalance;
    const investBalance = window.controls.investBalance;

    const totalWallet = startBalance + (usdtValue - (investBalance - reserve));
    const totalChange = totalWallet - startBalance;
    const percentChange = (totalChange / startBalance) * 100;

    logWithTime(`Cycle ${cycleNumber} complete`);
    logWithTime(`Ended holding coin: ${finalCoin}`);
    logWithTime(`Net Wallet: ${totalWallet.toFixed(2)} USDT`);
    logWithTime(`Profit/Loss: ${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)} USDT (${percentChange.toFixed(2)}%)`);

    return usdtValue;
}
