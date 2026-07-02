// simulate.js

// fetch rising mid/low range coins
async function getRisingCoins() {
    try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        const data = await res.json();

        // filter: USDT pairs, positive change, mid/low range volume
        const rising = data.filter(item =>
            item.symbol.endsWith("USDT") &&
            parseFloat(item.priceChangePercent) > 0 &&
            parseFloat(item.quoteVolume) > 500000 // >$0.5M daily volume
        );

        // sort by % gain descending
        rising.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));

        const topCoins = rising.slice(0, 10).map(item => item.symbol);
        logToPanel(`[INFO] Rising coins selected: ${topCoins.join(", ")}`);
        return topCoins;
    } catch (err) {
        logToPanel(`[ERROR] Failed to fetch rising coins: ${err}`);
        return ["BTCUSDT", "ETHUSDT", "ADAUSDT", "BNBUSDT"];
    }
}

async function pickBestCoin() {
    const coins = await getRisingCoins();
    return coins[Math.floor(Math.random() * coins.length)];
}

async function simulateCycle(cycleNumber) {
    let investBalance = window.controls.investBalance;
    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    let coin = await pickBestCoin();
    logToPanel(`[CYCLE ${cycleNumber}] Bought ${coin} with ${balance.toFixed(2)} USDT`);

    let usdtValue = balance;
    let cycleStart = Date.now();

    // keep looping until stop conditions
    while (true) {
        const holdTime = 120000; // 2 minutes
        const interval = 30000;  // 30 seconds
        const checks = holdTime / interval;

        let lastValue = balance;
        let rising = false;

        for (let i = 1; i <= checks; i++) {
            await new Promise(resolve => setTimeout(resolve, interval));
            usdtValue = await evaluateCoin(coin, balance);

            const diff = usdtValue - balance;
            const profitPercent = (diff / balance) * 100;

            logToPanel(`[CYCLE ${cycleNumber}] Hoping check ${i}: ${coin} value = ${usdtValue.toFixed(2)} USDT | Profit ${diff >= 0 ? '+' : ''}${diff.toFixed(2)} USDT (${profitPercent.toFixed(2)}%)`);

            document.getElementById("investBalance").value = usdtValue.toFixed(2);

            if (profitPercent >= window.controls.profitTarget) {
                logToPanel(`[CYCLE ${cycleNumber}] Profit target reached (${profitPercent.toFixed(2)}%)`);
                stopWithSummary(usdtValue, reserve);
                return;
            }

            if (profitPercent <= -window.controls.stopLoss) {
                logToPanel(`[CYCLE ${cycleNumber}] Stop loss triggered (${profitPercent.toFixed(2)}%)`);
                stopWithSummary(usdtValue, reserve);
                return;
            }

            if (usdtValue > lastValue) rising = true;
            lastValue = usdtValue;
        }

        // hard stop after 4 mins
        if (Date.now() - cycleStart >= 240000) {
            logToPanel(`[CYCLE ${cycleNumber}] Max cycle time reached (4 mins)`);
            stopWithSummary(usdtValue, reserve);
            return;
        }

        // hop logic
        if (rising) {
            logToPanel(`[CYCLE ${cycleNumber}] Coin ${coin} is rising, continue holding`);
            balance = usdtValue;
        } else {
            logToPanel(`[CYCLE ${cycleNumber}] Coin ${coin} not rising, switching to new coin`);
            coin = await pickBestCoin();
            balance = usdtValue;
            logToPanel(`[CYCLE ${cycleNumber}] Switched to ${coin} with ${balance.toFixed(2)} USDT`);
        }

        window.controls.investBalance = usdtValue + reserve;
        document.getElementById("investBalance").value = window.controls.investBalance.toFixed(2);
    }
}

// stop and show summary
function stopWithSummary(usdtValue, reserve) {
    window.controls.investBalance = usdtValue + reserve;

    const startBalance = window.controls.startBalance;
    const investBalance = window.controls.investBalance;

    // true wallet total = startBalance + profit/loss
    const totalWallet = startBalance + (usdtValue - (investBalance - reserve));
    const totalChange = totalWallet - startBalance;
    const percentChange = (totalChange / startBalance) * 100;

    document.getElementById("startBalance").value = totalWallet.toFixed(2);
    document.getElementById("investBalance").value = investBalance.toFixed(2);

    logToPanel("Bot stopped");
    logToPanel("Final Start Balance: " + totalWallet.toFixed(2) + " USDT");
    logToPanel("Final Investment Balance: " + investBalance.toFixed(2) + " USDT");
    logToPanel("Net Change: " + totalChange.toFixed(2) + " USDT (" + percentChange.toFixed(2) + "%)");

    window.stopBot();
}
