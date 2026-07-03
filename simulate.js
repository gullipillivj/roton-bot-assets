// simulate.js

if (typeof window.logToPanel !== "function") {
    window.logToPanel = function(msg) { console.log(msg); };
}

function logWithTime(message) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });
    window.logToPanel(`[INFO] ${timeStr} — ${message}`);
}

logWithTime("[Latest] simulate.js loaded successfully");

async function evaluateCoin(symbol, units = 1) {
    try {
        const cleanSymbol = symbol.endsWith("USDT") ? symbol : symbol + "USDT";
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
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${cleanSymbol}`);
        const data = await res.json();
        return parseFloat(data.priceChangePercent);
    } catch (err) {
        logWithTime(`[ERROR] ${symbol} 24h change fetch failed: ${err}`);
        return 0;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateCycle(cycleNum) {
    logWithTime(`[Latest] simulateCycle(${cycleNum}) started`);

    let investBalance = window.controls.investBalance;
    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    let coin = await window.pickBestCoin();
    if (!coin) {
        logWithTime("[ERROR] No coin available from Binance.");
        return;
    }
    coin = coin.endsWith("USDT") ? coin : coin + "USDT";

    let coinPrice = await evaluateCoin(coin, 1);
    if (coinPrice === 0) {
        logWithTime("[ERROR] Could not price coin.");
        return;
    }

    let coinUnits = balance / coinPrice;
    logWithTime(`Cycle ${cycleNum}: Initial buy ${coin}, ${coinUnits.toFixed(4)} units at ${coinPrice.toFixed(4)} USDT`);

    const currentPrice = await evaluateCoin(coin, 1);
    const held24hChange = await get24hChange(coin);
    let currentValue = coinUnits * currentPrice;

    logWithTime(`Cycle ${cycleNum}: Holding ${coin}, Value=${currentValue.toFixed(2)} USDT, 24h%=${held24hChange}`);

    if (currentPrice <= coinPrice) {
        logWithTime(`Cycle ${cycleNum}: Price dropped/stagnated, checking for better coin...`);
        let bestCoin = await window.pickBestCoin();
        if (bestCoin && bestCoin !== coin) {
            balance = currentValue * 0.9975;
            coin = bestCoin;
            coinPrice = await evaluateCoin(coin, 1);
            coinUnits = balance / coinPrice;
            logWithTime(`Cycle ${cycleNum}: Swapped into ${coin}, Units=${coinUnits.toFixed(4)}, Balance=${balance.toFixed(2)} USDT`);
        } else {
            logWithTime(`Cycle ${cycleNum}: Stayed with ${coin}`);
        }
    } else {
        logWithTime(`Cycle ${cycleNum}: Price rising, holding ${coin}`);
    }

    // ✅ update balances in controls and textboxes
    window.controls.investBalance = balance;
    window.controls.startBalance = balance + reserve;
    document.getElementById("startBalance").value = window.controls.startBalance.toFixed(2);
    document.getElementById("investBalance").value = window.controls.investBalance.toFixed(2);

    // ✅ show profit/loss
    const profit = balance - (investBalance - reserve);
    logWithTime(`Result: ${profit >= 0 ? "Profit" : "Loss"} (${profit.toFixed(2)} USDT)`);

    logWithTime(`[Latest] simulateCycle(${cycleNum}) complete`);

    await sleep(30000); // ⏱ wait 30s before next cycle
}

window.simulateCycle = simulateCycle;
