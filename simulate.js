// simulate.js

if (typeof window.logToPanel !== "function") {
    window.logToPanel = function(msg) { console.log(msg); };
}

async function evaluateCoin(symbol, units = 1) {
    try {
        const cleanSymbol = symbol.endsWith("USDT") ? symbol : symbol + "USDT";
        // ✅ Correct Binance endpoint
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${cleanSymbol}`);
        const data = await res.json();
        return parseFloat(data.price) * units;
    } catch (err) {
        logWithTime(`[ERROR] ${symbol} price fetch failed: ${err}`);
        return 0;
    }
}

async function get24hChange(symbol) {
    try {
        const cleanSymbol = symbol.endsWith("USDT") ? symbol : symbol + "USDT";
        // ✅ Correct Binance endpoint
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${cleanSymbol}`);
        const data = await res.json();
        return parseFloat(data.priceChangePercent);
    } catch (err) {
        logWithTime(`[ERROR] ${symbol} 24h change fetch failed: ${err}`);
        return 0;
    }
}

function logWithTime(message) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });
    window.logToPanel(`[INFO] ${timeStr} — ${message}`);
}

async function runBot(totalCycles = 2, checksPerCycle = 4) {
    let investBalance = parseFloat(window.controls.investBalance);
    if (isNaN(investBalance) || investBalance <= 0) {
        logWithTime(`[ERROR] Invalid investment balance in textbox.`);
        return;
    }

    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    // ✅ First buy using best coin
    let coin = await window.pickBestCoin();       
    coin = coin.endsWith("USDT") ? coin : coin + "USDT"; 
    
    let coinPrice = await evaluateCoin(coin, 1);
    if(coinPrice === 0) {
        logWithTime(`[ERROR] Could not price initial coin. Aborting.`);
        return;
    }
    
    let coinUnits = balance / coinPrice;
    let lastPriceInUsdt = coinPrice;

    logWithTime(`Bot started`);
    logWithTime(`Initial buy: ${coin}, ${coinUnits.toFixed(4)} units bought at ${coinPrice.toFixed(4)} USDT per coin using ${balance.toFixed(2)} USDT`);

    let timer2Counter = 0;

    const interval = setInterval(async () => {
        timer2Counter++;
        logWithTime(`DEBUG: Tick loop entered, Check = ${timer2Counter}`);

        const currentPriceInUsdt = await evaluateCoin(coin, 1);
        let currentValue = coinUnits * currentPriceInUsdt;
        if (!currentValue || isNaN(currentValue)) currentValue = balance;

        const held24hChange = await get24hChange(coin);
        
        logWithTime(`Tick ${timer2Counter}: Holding ${coin}, Live Price = ${currentPriceInUsdt.toFixed(4)} USDT (Previous: ${lastPriceInUsdt.toFixed(4)} USDT), Holding Value = ${currentValue.toFixed(2)} USDT`);

        // ✅ Swap if coin is down or stagnant
        if (currentPriceInUsdt <= lastPriceInUsdt) {
            logWithTime(`Coin price dropped or stagnated. Querying coins.js for a better option...`);
            
            let bestCoin = await window.pickBestCoin();
            bestCoin = bestCoin.endsWith("USDT") ? bestCoin : bestCoin + "USDT";
            
            if (bestCoin !== coin) {
                balance = currentValue * 0.9975; 
                coin = bestCoin;
                coinPrice = await evaluateCoin(coin, 1);
                coinUnits = balance / coinPrice;
                lastPriceInUsdt = coinPrice;
                logWithTime(`Swapped into: ${coin}, Units: ${coinUnits.toFixed(4)}, New Balance: ${balance.toFixed(2)} USDT`);
            } else {
                balance = currentValue;
                lastPriceInUsdt = currentPriceInUsdt;
                logWithTime(`Already holding Binance's highest performing asset: ${coin}. Staying put.`);
            }
        } else {
            balance = currentValue;
            lastPriceInUsdt = currentPriceInUsdt;
            logWithTime(`Coin price is climbing! Staying with ${coin}, Balance = ${balance.toFixed(2)} USDT`);
        }

        if (timer2Counter % checksPerCycle === 0) {
            const cycleNum = timer2Counter / checksPerCycle;
            logWithTime(`Cycle ${cycleNum} complete`);
        }

        if (timer2Counter >= (totalCycles * checksPerCycle)) {
            clearInterval(interval);
            clearTimeout(stopTimer);

            window.controls.startBalance = balance + reserve;
            window.controls.investBalance = balance;

            const profit = balance - (investBalance - reserve);
            logWithTime(`Bot stopped safely after completing ${totalCycles * checksPerCycle} iterations.`);
            logWithTime(`Final Balances: Start = ${window.controls.startBalance.toFixed(2)} USDT, Invest = ${window.controls.investBalance.toFixed(2)} USDT`);
            logWithTime(`Result: ${profit >= 0 ? "Profit" : "Loss"} (${profit.toFixed(2)} USDT)`);
        }
    }, 30000);

    const totalRuntimeMs = totalCycles * checksPerCycle * 30000;
    const stopTimer = setTimeout(() => {
        clearInterval(interval);
        logWithTime(`Bot safety-stopped automatically via timeout fallback`);
    }, totalRuntimeMs + 2000); 
}

window.runBot = runBot;
