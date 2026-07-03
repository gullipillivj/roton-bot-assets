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

    let coins = await window.getRisingCoins();
    if (!coins || coins.length === 0) {
        logWithTime("[Latest] No rising coins found, using fallback list.");
        coins = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "ADAUSDT"];
    }
    let coin = coins[cycleNum % coins.length];
    logWithTime(`[Latest] Selected coin for cycle ${cycleNum}: ${coin}`);

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

    const profitPercent = ((currentPrice - coinPrice) / coinPrice) * 100;
    if (profitPercent >= window.controls.profitTarget) {
        logWithTime(`[Latest] Profit target reached (${profitPercent.toFixed(2)}%). Taking profit.`);
        balance = currentValue;
    } else if (profitPercent <= -window.controls.stopLoss) {
        logWithTime(`[Latest] Stop loss triggered (${profitPercent.toFixed(2)}%). Switching coin.`);
        let bestCoin = await window.pickBestCoin();
        if (bestCoin && bestCoin !== coin) {
            const changenowFee = 0.005;   // 0.5%
            const pancakeFee = 0.0025;    // 0.25%
            const totalFeeFactor = 1 - (changenowFee + pancakeFee); // 0.9925

            balance = currentValue * totalFeeFactor; // deduct fees
            coin = bestCoin;
            coinPrice = await evaluateCoin(coin, 1);
            coinUnits = balance / coinPrice;
            logWithTime(`[Latest] Swapped into ${coin}, Units=${coinUnits.toFixed(4)}, Balance=${balance.toFixed(2)} USDT after fees`);
        } else {
            logWithTime(`[Latest] Stayed with ${coin}`);
        }
    } else {
        logWithTime(`[Latest] No trigger hit, holding ${coin}`);
    }

    // ✅ Correct profit/loss calculation: (currentPrice - buyPrice) × units
    const profit = (currentPrice - coinPrice) * coinUnits;

    // ✅ Update BOTH textboxes by adding profit/loss
    let startBox = parseFloat(document.getElementById("startBalance").value);
    let investBox = parseFloat(document.getElementById("investBalance").value);

    document.getElementById("startBalance").value = (startBox + profit).toFixed(2);
    document.getElementById("investBalance").value = (investBox + profit).toFixed(2);

    logWithTime(`Result: ${profit >= 0 ? "Profit" : "Loss"} (${profit.toFixed(2)} USDT)`);

    logWithTime(`[Latest] simulateCycle(${cycleNum}) complete`);

    await sleep(30000); // ⏱ wait 30s before next cycle
}

window.simulateCycle = simulateCycle;
