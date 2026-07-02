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

    let lastValue = balance;
    let cycle = 1;
    let check = 0;

    // Timer 1: 30‑second activity
    const interval = setInterval(async () => {
        check++;

        const risingCoins = await getRisingCoins();
        const held24hChange = await get24hChange(coin);

        let currentValue = await evaluateCoin(coin, lastValue);
        if (!currentValue || isNaN(currentValue)) currentValue = lastValue;

        const diff = currentValue - lastValue;
        const profitPercent = (diff / lastValue) * 100;

        logWithTime(`Coin: ${coin}, Current Value: ${currentValue.toFixed(2)} USDT, Change: ${diff >= 0 ? '+' : ''}${diff.toFixed(2)} USDT (${profitPercent.toFixed(2)}%), 24h %: ${held24hChange.toFixed(2)}%`);

        if (held24hChange < 0) {
            coin = risingCoins[Math.floor(Math.random() * risingCoins.length)];
            logWithTime(`Switched to new rising coin: ${coin}`);
        } else {
            logWithTime(`Coin not changed`);
        }

        lastValue = currentValue;

        // cycle management
        if (check >= checksPerCycle) {
            logWithTime(`Cycle ${cycle} complete`);
            cycle++;
            check = 0;
        }

        // stop after total cycles
        if (cycle > totalCycles) {
            clearInterval(interval); // stop Timer 1
            clearTimeout(stopTimer); // stop Timer 2

            logWithTime(`Bot stopped after ${totalCycles} cycles`);

            // reset both counters to 0
            check = 0;
            cycle = 0;
            logWithTime(`Timers reset: 30s counter = ${check}, cycle counter = ${cycle}`);
        }
    }, 30000);

    // Timer 2: safety stop after total runtime
    const totalRuntimeMs = totalCycles * checksPerCycle * 30000;
    const stopTimer = setTimeout(() => {
        clearInterval(interval); // stop Timer 1
        logWithTime(`Bot stopped automatically after ${totalCycles} cycles`);

        // reset both counters to 0
        check = 0;
        cycle = 0;
        logWithTime(`Timers reset: 30s counter = ${check}, cycle counter = ${cycle}`);
    }, totalRuntimeMs);
}
