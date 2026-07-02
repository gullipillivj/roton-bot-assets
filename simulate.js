function logWithTime(message) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });
    logToPanel(`[INFO] ${timeStr} — ${message}`);
}

async function runBot(totalCycles = 2, checksPerCycle = 4) {
    let investBalance = window.controls.investBalance;
    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    let coin = await pickBestCoin();
    logWithTime(`Bot started`);
    logWithTime(`Bought ${coin} with ${balance.toFixed(2)} USDT`);

    let timer1Counter = 0; // counts ms up to 30000
    let timer2Counter = 0; // counts ticks (total checks)

    const interval = setInterval(async () => {
        // simulate Timer1 reaching 30000
        timer1Counter = 30000;

        const risingCoins = await getRisingCoins();
        const held24hChange = await get24hChange(coin);

        let currentValue = await evaluateCoin(coin, balance);
        if (!currentValue || isNaN(currentValue)) currentValue = balance;

        const diff = currentValue - balance;
        const profitPercent = (diff / balance) * 100;

        logWithTime(`Coin: ${coin}, Value: ${currentValue.toFixed(2)} USDT, Change: ${diff >= 0 ? '+' : ''}${diff.toFixed(2)} USDT (${profitPercent.toFixed(2)}%), 24h %: ${held24hChange.toFixed(2)}%`);

        if (held24hChange < 0) {
            coin = risingCoins[Math.floor(Math.random() * risingCoins.length)];
            logWithTime(`Switched to new rising coin: ${coin}`);
        } else {
            logWithTime(`Coin not changed`);
        }

        // reset Timer1 back to 0 after firing
        timer1Counter = 0;

        // increment Timer2
        timer2Counter++;

        // cycle management
        if (timer2Counter % checksPerCycle === 0) {
            const cycleNum = timer2Counter / checksPerCycle;
            logWithTime(`Cycle ${cycleNum} complete`);
        }

        // stop after 8 ticks (2 cycles × 4 checks)
        if (timer2Counter >= totalCycles * checksPerCycle) {
            clearInterval(interval);
            clearTimeout(stopTimer);

            // update balances
            window.controls.startBalance = currentValue + reserve;
            window.controls.investBalance = currentValue;

            logWithTime(`Bot stopped after ${totalCycles} cycles`);
            logWithTime(`Final Balances: Start = ${window.controls.startBalance.toFixed(2)} USDT, Invest = ${window.controls.investBalance.toFixed(2)} USDT`);

            // reset both counters
            timer1Counter = 0;
            timer2Counter = 0;
            logWithTime(`Timers reset: Timer1 = ${timer1Counter}, Timer2 = ${timer2Counter}`);
            logWithTime(`Ready for next run`);
        }
    }, 30000);

    // Timer2: safety stop after full runtime
    const totalRuntimeMs = totalCycles * checksPerCycle * 30000;
    const stopTimer = setTimeout(() => {
        clearInterval(interval);
        logWithTime(`Bot stopped automatically after ${totalCycles} cycles`);

        // balances update
        window.controls.startBalance = balance + reserve;
        window.controls.investBalance = balance;

        logWithTime(`Final Balances: Start = ${window.controls.startBalance.toFixed(2)} USDT, Invest = ${window.controls.investBalance.toFixed(2)} USDT`);

        // reset both counters
        timer1Counter = 0;
        timer2Counter = 0;
        logWithTime(`Timers reset: Timer1 = ${timer1Counter}, Timer2 = ${timer2Counter}`);
        logWithTime(`Ready for next run`);
    }, totalRuntimeMs);
}
