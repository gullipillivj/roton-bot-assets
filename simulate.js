// simulate.js

function logWithTime(message) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });
    logToPanel(`[INFO] ${timeStr} — ${message}`);
}

async function runBot(totalCycles = 2, checksPerCycle = 4) {
    let investBalance = window.controls.investBalance;
    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    // FIRST BUY
    let coin = await pickBestCoin();
    let coinPrice = await evaluateCoin(coin, 1);
    let coinUnits = balance / coinPrice;

    logWithTime(`Bot started`);
    logWithTime(`Initial buy: ${coin}, ${coinUnits.toFixed(4)} units worth ${balance.toFixed(2)} USDT`);

    let timer1Counter = 0;
    let timer2Counter = 0;

    const interval = setInterval(async () => {
        timer1Counter = 30000;

        // evaluate held coin
        const heldPrice = await evaluateCoin(coin, 1);
        let currentValue = coinUnits * heldPrice;
        if (!currentValue || isNaN(currentValue)) currentValue = balance;

        const held24hChange = await get24hChange(coin);
        const risingCoins = await getRisingCoins();
        const bestCoin = risingCoins[0];
        const bestChange = await get24hChange(bestCoin);

        const diff = currentValue - balance;
        const profitPercent = (diff / balance) * 100;

        logWithTime(`Tick ${timer2Counter + 1}: Holding ${coin}, Value = ${currentValue.toFixed(2)} USDT, Change = ${diff >= 0 ? '+' : ''}${diff.toFixed(2)} USDT (${profitPercent.toFixed(2)}%), 24h % = ${held24hChange.toFixed(2)}%`);

        // swap only if another coin is stronger
        if (bestCoin !== coin && bestChange > held24hChange) {
            balance = currentValue * 0.9975; // apply 0.25% fee
            coin = bestCoin;
            coinPrice = await evaluateCoin(coin, 1);
            coinUnits = balance / coinPrice;
            logWithTime(`Swapped into stronger coin: ${coin}, Balance = ${balance.toFixed(2)} USDT`);
        } else {
            balance = currentValue;
            logWithTime(`No swap, holding ${coin}, Balance = ${balance.toFixed(2)} USDT`);
        }

        timer1Counter = 0;
        timer2Counter++;

        if (timer2Counter % checksPerCycle === 0) {
            const cycleNum = timer2Counter / checksPerCycle;
            logWithTime(`Cycle ${cycleNum} complete`);
        }

        if (timer2Counter >= totalCycles * checksPerCycle) {
            clearInterval(interval);
            clearTimeout(stopTimer);

            window.controls.startBalance = balance + reserve;
            window.controls.investBalance = balance;

            const profit = balance - (investBalance - reserve);
            logWithTime(`Bot stopped after ${totalCycles} cycles`);
            logWithTime(`Final Balances: Start = ${window.controls.startBalance.toFixed(2)} USDT, Invest = ${window.controls.investBalance.toFixed(2)} USDT`);
            logWithTime(`Result: ${profit >= 0 ? "Profit" : "Loss"} (${profit.toFixed(2)} USDT)`);

            timer1Counter = 0;
            timer2Counter = 0;
            logWithTime(`Timers reset: Timer1 = ${timer1Counter}, Timer2 = ${timer2Counter}`);
            logWithTime(`Ready for next run`);
        }
    }, 30000);

    const totalRuntimeMs = totalCycles * checksPerCycle * 30000;
    const stopTimer = setTimeout(() => {
        clearInterval(interval);
        logWithTime(`Bot stopped automatically after ${totalCycles} cycles`);

        window.controls.startBalance = balance + reserve;
        window.controls.investBalance = balance;

        logWithTime(`Final Balances: Start = ${window.controls.startBalance.toFixed(2)} USDT, Invest = ${window.controls.investBalance.toFixed(2)} USDT`);

        timer1Counter = 0;
        timer2Counter = 0;
        logWithTime(`Timers reset: Timer1 = ${timer1Counter}, Timer2 = ${timer2Counter}`);
        logWithTime(`Ready for next run`);
    }, totalRuntimeMs);
}
